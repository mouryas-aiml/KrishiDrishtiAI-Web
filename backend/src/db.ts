import pg from "pg";
import crypto from "crypto";

export interface ScanRecord {
  id: string;
  userId?: string;
  crop: string;
  disease: string;
  confidence: number;
  notes?: string;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  name: string;
  contactNumber: string;
  passwordHash: string;
  preferredLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublicProfile {
  id: string;
  name: string;
  contactNumber: string;
  preferredLanguage: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalScans: number;
  healthyScans: number;
  diseasedScans: number;
  lastUpdated: string;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(derivedKey, "hex"));
}

class DatabaseService {
  private pool: pg.Pool | null = null;
  private isPostgresAvailable = false;
  private fallbackScans: ScanRecord[] = [];
  private fallbackUsers: UserRecord[] = [];
  private fallbackSessions = new Map<string, { userId: string; expiresAt: number }>();

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
          user_id VARCHAR(64),
          crop VARCHAR(100) NOT NULL,
          disease VARCHAR(150) NOT NULL,
          confidence REAL NOT NULL,
          notes TEXT DEFAULT '',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Migration: Ensure notes column exists in existing tables
      await client.query(`ALTER TABLE scans ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          contact_number VARCHAR(20) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          preferred_language VARCHAR(20) DEFAULT 'English',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`ALTER TABLE scans ADD COLUMN IF NOT EXISTS user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL;`);
      await client.query(`CREATE INDEX IF NOT EXISTS scans_user_created_idx ON scans (user_id, created_at DESC);`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id VARCHAR(128) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      client.release();
      this.isPostgresAvailable = true;
    } catch (err: any) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(`PostgreSQL is required in production: ${err.message}`);
      }
      console.warn(`[DatabaseService] PostgreSQL not reachable (${err.message}). Using persistent fallback memory store.`);
      this.isPostgresAvailable = false;
    }
  }

  // --- Scan Records ---

  public async saveScan(crop: string, disease: string, confidence: number, notes: string = "", userId?: string): Promise<ScanRecord> {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const record: ScanRecord = { id, crop, disease, confidence, notes, createdAt, userId };

    if (this.isPostgresAvailable && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO scans (id, user_id, crop, disease, confidence, notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, userId || null, crop, disease, confidence, notes, createdAt]
        );
        return record;
      } catch (err) {
        console.error("[DatabaseService] Failed to insert scan into Postgres:", err);
        if (process.env.NODE_ENV === "production") throw err;
      }
    }

    this.fallbackScans.unshift(record);
    if (this.fallbackScans.length > 500) {
      this.fallbackScans.pop();
    }
    return record;
  }

  public async getScans(userId?: string, page = 1, pageSize = 100): Promise<{ items: ScanRecord[]; total: number }> {
    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
    const offset = (safePage - 1) * safePageSize;
    if (this.isPostgresAvailable && this.pool) {
      try {
        const filter = userId ? ` WHERE user_id = $1` : "";
        const params = userId ? [userId] : [];
        const totalResult = await this.pool.query(`SELECT COUNT(*)::int AS total FROM scans${filter}`, params);
        const res = await this.pool.query(
          `SELECT id, user_id as "userId", crop, disease, confidence, COALESCE(notes, '') as notes, created_at as "createdAt"
           FROM scans${filter} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
          [...params, safePageSize, offset]
        );
        return { items: res.rows.map(r => ({
          id: r.id,
          userId: r.userId || undefined,
          crop: r.crop,
          disease: r.disease,
          confidence: Number(r.confidence),
          notes: r.notes || "",
          createdAt: new Date(r.createdAt).toISOString()
        })), total: totalResult.rows[0].total };
      } catch (err) {
        console.error("[DatabaseService] Error querying scans from Postgres:", err);
        if (process.env.NODE_ENV === "production") throw err;
      }
    }
    const filtered = userId ? this.fallbackScans.filter(scan => scan.userId === userId) : this.fallbackScans;
    return { items: filtered.slice(offset, offset + safePageSize), total: filtered.length };
  }

  public async getDashboardSummary(userId?: string): Promise<DashboardSummary> {
    if (this.isPostgresAvailable && this.pool) {
      const filter = userId ? ` WHERE user_id = $1` : "";
      const params = userId ? [userId] : [];
      const result = await this.pool.query(
        `SELECT COUNT(*)::int AS total_scans,
                COUNT(*) FILTER (WHERE LOWER(disease) = 'healthy')::int AS healthy_scans
         FROM scans${filter}`,
        params
      );
      const totalScans = Number(result.rows[0]?.total_scans || 0);
      const healthyScans = Number(result.rows[0]?.healthy_scans || 0);
      return {
        totalScans,
        healthyScans,
        diseasedScans: totalScans - healthyScans,
        lastUpdated: new Date().toISOString(),
      };
    }

    const scans = userId ? this.fallbackScans.filter(scan => scan.userId === userId) : this.fallbackScans;
    const healthyScans = scans.filter(scan => scan.disease.toLowerCase() === "healthy").length;
    return {
      totalScans: scans.length,
      healthyScans,
      diseasedScans: scans.length - healthyScans,
      lastUpdated: new Date().toISOString(),
    };
  }

  public async updateScanNotes(id: string, notes: string, userId?: string): Promise<boolean> {
    if (this.isPostgresAvailable && this.pool) {
      try {
        const ownership = userId ? ` AND user_id = $3` : "";
        const res = await this.pool.query(`UPDATE scans SET notes = $1 WHERE id = $2${ownership}`, userId ? [notes, id, userId] : [notes, id]);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error("[DatabaseService] Error updating scan notes:", err);
        if (process.env.NODE_ENV === "production") throw err;
      }
    }
    const target = this.fallbackScans.find(s => s.id === id && (!userId || s.userId === userId));
    if (target) {
      target.notes = notes;
      return true;
    }
    return false;
  }

  public async deleteScan(id: string, userId?: string): Promise<boolean> {
    if (this.isPostgresAvailable && this.pool) {
      try {
        const ownership = userId ? ` AND user_id = $2` : "";
        const res = await this.pool.query(`DELETE FROM scans WHERE id = $1${ownership}`, userId ? [id, userId] : [id]);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error("[DatabaseService] Error deleting scan:", err);
        if (process.env.NODE_ENV === "production") throw err;
      }
    }
    const idx = this.fallbackScans.findIndex(s => s.id === id && (!userId || s.userId === userId));
    if (idx !== -1) {
      this.fallbackScans.splice(idx, 1);
      return true;
    }
    return false;
  }

  // --- User Authentication & Management ---

  public async registerUser(name: string, contactNumber: string, password: string): Promise<UserPublicProfile> {
    const cleanContact = contactNumber.trim().replace(/\s+/g, "");
    if (!cleanContact) throw new Error("Contact number is required.");
    if (!name || !name.trim()) throw new Error("Farmer name is required.");
    if (!password || password.length < 4) throw new Error("Password must be at least 4 characters long.");

    const id = crypto.randomUUID();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    if (this.isPostgresAvailable && this.pool) {
      // Check existing
      const existing = await this.pool.query(`SELECT id FROM users WHERE contact_number = $1`, [cleanContact]);
      if (existing.rows.length > 0) {
        throw new Error("An account with this contact number already exists. Please log in.");
      }

      await this.pool.query(
        `INSERT INTO users (id, name, contact_number, password_hash, preferred_language, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, name.trim(), cleanContact, passwordHash, "English", now, now]
      );

      return {
        id,
        name: name.trim(),
        contactNumber: cleanContact,
        preferredLanguage: "English",
        createdAt: now,
      };
    }

    const memExisting = this.fallbackUsers.find(u => u.contactNumber === cleanContact);
    if (memExisting) {
      throw new Error("An account with this contact number already exists. Please log in.");
    }

    const newUser: UserRecord = {
      id,
      name: name.trim(),
      contactNumber: cleanContact,
      passwordHash,
      preferredLanguage: "English",
      createdAt: now,
      updatedAt: now,
    };
    this.fallbackUsers.push(newUser);

    return {
      id,
      name: newUser.name,
      contactNumber: newUser.contactNumber,
      preferredLanguage: newUser.preferredLanguage,
      createdAt: now,
    };
  }

  public async loginUser(contactNumber: string, password: string): Promise<UserPublicProfile> {
    const cleanContact = contactNumber.trim().replace(/\s+/g, "");
    if (!cleanContact || !password) {
      throw new Error("Both contact number and password are required.");
    }

    if (this.isPostgresAvailable && this.pool) {
      const res = await this.pool.query(
        `SELECT id, name, contact_number as "contactNumber", password_hash as "passwordHash",
                preferred_language as "preferredLanguage", created_at as "createdAt"
         FROM users WHERE contact_number = $1`,
        [cleanContact]
      );
      if (res.rows.length === 0) {
        throw new Error("No account found for this contact number. Please register.");
      }
      const user = res.rows[0];
      const valid = verifyPassword(password, user.passwordHash);
      if (!valid) {
        throw new Error("Invalid password. Please check your credentials or reset your password.");
      }
      return {
        id: user.id,
        name: user.name,
        contactNumber: user.contactNumber,
        preferredLanguage: user.preferredLanguage || "English",
        createdAt: new Date(user.createdAt).toISOString(),
      };
    }

    const user = this.fallbackUsers.find(u => u.contactNumber === cleanContact);
    if (!user) {
      throw new Error("No account found for this contact number. Please register.");
    }
    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new Error("Invalid password. Please check your credentials or reset your password.");
    }
    return {
      id: user.id,
      name: user.name,
      contactNumber: user.contactNumber,
      preferredLanguage: user.preferredLanguage,
      createdAt: user.createdAt,
    };
  }

  public async createSession(userId: string, ttlMs: number): Promise<string> {
    const id = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + ttlMs);
    if (this.isPostgresAvailable && this.pool) {
      await this.pool.query(
        `INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`,
        [id, userId, expiresAt.toISOString()]
      );
    } else {
      this.fallbackSessions.set(id, { userId, expiresAt: expiresAt.getTime() });
    }
    return id;
  }

  public async getSessionUserId(sessionId: string): Promise<string | null> {
    if (!sessionId) return null;
    if (this.isPostgresAvailable && this.pool) {
      const result = await this.pool.query(
        `SELECT user_id FROM sessions WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP`,
        [sessionId]
      );
      return result.rows[0]?.user_id || null;
    }
    const session = this.fallbackSessions.get(sessionId);
    if (!session || session.expiresAt <= Date.now()) {
      this.fallbackSessions.delete(sessionId);
      return null;
    }
    return session.userId;
  }

  public async deleteSession(sessionId: string): Promise<void> {
    if (this.isPostgresAvailable && this.pool) {
      await this.pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
    } else {
      this.fallbackSessions.delete(sessionId);
    }
  }

  public async forgotPassword(contactNumber: string, newPassword: string): Promise<boolean> {
    const cleanContact = contactNumber.trim().replace(/\s+/g, "");
    if (!cleanContact) throw new Error("Contact number is required.");
    if (!newPassword || newPassword.length < 4) throw new Error("New password must be at least 4 characters long.");

    const newHash = hashPassword(newPassword);
    const now = new Date().toISOString();

    if (this.isPostgresAvailable && this.pool) {
      const res = await this.pool.query(
        `UPDATE users SET password_hash = $1, updated_at = $2 WHERE contact_number = $3`,
        [newHash, now, cleanContact]
      );
      if ((res.rowCount ?? 0) === 0) {
        throw new Error("No account found for this contact number to reset.");
      }
      return true;
    }

    const user = this.fallbackUsers.find(u => u.contactNumber === cleanContact);
    if (!user) {
      throw new Error("No account found for this contact number to reset.");
    }
    user.passwordHash = newHash;
    user.updatedAt = now;
    return true;
  }

  public async updateUserProfile(id: string, name: string, contactNumber: string, preferredLanguage?: string): Promise<UserPublicProfile> {
    const cleanContact = contactNumber.trim().replace(/\s+/g, "");
    if (!cleanContact) throw new Error("Contact number cannot be empty.");
    if (!name || !name.trim()) throw new Error("Name cannot be empty.");
    const now = new Date().toISOString();

    if (this.isPostgresAvailable && this.pool) {
      // Check collision
      const check = await this.pool.query(
        `SELECT id FROM users WHERE contact_number = $1 AND id != $2`,
        [cleanContact, id]
      );
      if (check.rows.length > 0) {
        throw new Error("Another user is already registered with this contact number.");
      }

      const res = await this.pool.query(
        `UPDATE users
         SET name = $1, contact_number = $2, preferred_language = COALESCE($3, preferred_language), updated_at = $4
         WHERE id = $5
         RETURNING id, name, contact_number as "contactNumber", preferred_language as "preferredLanguage", created_at as "createdAt"`,
        [name.trim(), cleanContact, preferredLanguage || null, now, id]
      );

      if (res.rows.length === 0) {
        throw new Error("User record not found.");
      }

      const row = res.rows[0];
      return {
        id: row.id,
        name: row.name,
        contactNumber: row.contactNumber,
        preferredLanguage: row.preferredLanguage,
        createdAt: new Date(row.createdAt).toISOString(),
      };
    }

    const user = this.fallbackUsers.find(u => u.id === id);
    if (!user) throw new Error("User record not found.");
    const collision = this.fallbackUsers.find(u => u.contactNumber === cleanContact && u.id !== id);
    if (collision) throw new Error("Another user is already registered with this contact number.");

    user.name = name.trim();
    user.contactNumber = cleanContact;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    user.updatedAt = now;

    return {
      id: user.id,
      name: user.name,
      contactNumber: user.contactNumber,
      preferredLanguage: user.preferredLanguage,
      createdAt: user.createdAt,
    };
  }
}

export const db = new DatabaseService();
