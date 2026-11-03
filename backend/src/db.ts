import pg from "pg";
import crypto from "crypto";

export interface ScanRecord {
  id: string;
  crop: string;
  disease: string;
  confidence: number;
  createdAt: string;
}

class DatabaseService {
  private pool: pg.Pool | null = null;
  private isPostgresAvailable = false;
  private fallbackScans: ScanRecord[] = [];

  constructor() {
    const host = process.env.DATABASE_HOST || "localhost";
    const port = parseInt(process.env.DATABASE_PORT || "5432", 10);
    const database = process.env.DATABASE_NAME || "krishi_drishti";
    const user = process.env.DATABASE_USERNAME || "postgres";
    const password = process.env.DATABASE_PASSWORD || "postgres";

    this.pool = new pg.Pool({
      host,
      port,
      database,
      user,
      password,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
    });
  }

  public async initialize(): Promise<void> {
    if (!this.pool) return;
    try {
      const client = await this.pool.connect();
      console.log("[DatabaseService] Connected to PostgreSQL successfully.");
      await client.query(`
        CREATE TABLE IF NOT EXISTS scans (
          id VARCHAR(64) PRIMARY KEY,
          crop VARCHAR(100) NOT NULL,
          disease VARCHAR(150) NOT NULL,
          confidence REAL NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      client.release();
      this.isPostgresAvailable = true;
    } catch (err: any) {
      console.warn(`[DatabaseService] PostgreSQL not reachable (${err.message}). Using persistent fallback memory store.`);
      this.isPostgresAvailable = false;
    }
  }

  public async saveScan(crop: string, disease: string, confidence: number): Promise<ScanRecord> {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const record: ScanRecord = { id, crop, disease, confidence, createdAt };

    if (this.isPostgresAvailable && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO scans (id, crop, disease, confidence, created_at) VALUES ($1, $2, $3, $4, $5)`,
          [id, crop, disease, confidence, createdAt]
        );
        return record;
      } catch (err) {
        console.error("[DatabaseService] Failed to insert scan into Postgres:", err);
      }
    }

    this.fallbackScans.unshift(record);
    if (this.fallbackScans.length > 500) {
      this.fallbackScans.pop();
    }
    return record;
  }

  public async getScans(): Promise<ScanRecord[]> {
    if (this.isPostgresAvailable && this.pool) {
      try {
        const res = await this.pool.query(
          `SELECT id, crop, disease, confidence, created_at as "createdAt" FROM scans ORDER BY created_at DESC LIMIT 100`
        );
        return res.rows.map(r => ({
          id: r.id,
          crop: r.crop,
          disease: r.disease,
          confidence: Number(r.confidence),
          createdAt: new Date(r.createdAt).toISOString()
        }));
      } catch (err) {
        console.error("[DatabaseService] Error querying scans from Postgres:", err);
      }
    }
    return [...this.fallbackScans];
  }

  public async deleteScan(id: string): Promise<boolean> {
    if (this.isPostgresAvailable && this.pool) {
      try {
        const res = await this.pool.query(`DELETE FROM scans WHERE id = $1`, [id]);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error("[DatabaseService] Error deleting scan:", err);
      }
    }
    const idx = this.fallbackScans.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.fallbackScans.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const db = new DatabaseService();

