import pg from "pg";
import crypto from "crypto";

export interface ScanRecord {
  id: string;
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

      client.release();
      this.isPostgresAvailable = true;
    } catch (err: any) {
      console.warn(`[DatabaseService] PostgreSQL not reachable (${err.message}). Using persistent fallback memory store.`);
      this.isPostgresAvailable = false;
    }
  }

  // --- Scan Records ---

  public async saveScan(crop: string, disease: string, confidence: number, notes: string = ""): Promise<ScanRecord> {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const record: ScanRecord = { id, crop, disease, confidence, notes, createdAt };

    if (this.isPostgresAvailable && this.pool) {
      try {
        await this.pool.query(
          `INSERT INTO scans (id, crop, disease, confidence, notes, created_at) VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, crop, disease, confidence, notes, createdAt]
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
          `SELECT id, crop, disease, confidence, COALESCE(notes, '') as notes, created_at as "createdAt" FROM scans ORDER BY created_at DESC LIMIT 100`
        );
        return res.rows.map(r => ({
          id: r.id,
          crop: r.crop,
          disease: r.disease,
          confidence: Number(r.confidence),
          notes: r.notes || "",
          createdAt: new Date(r.createdAt).toISOString()
        }));
      } catch (err) {
        console.error("[DatabaseService] Error querying scans from Postgres:", err);
      }
    }
    return [...this.fallbackScans];
  }

  public async updateScanNotes(id: string, notes: string): Promise<boolean> {
    if (this.isPostgresAvailable && this.pool) {
      try {
        const res = await this.pool.query(`UPDATE scans SET notes = $1 WHERE id = $2`, [notes, id]);
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error("[DatabaseService] Error updating scan notes:", err);
      }
    }
    const target = this.fallbackScans.find(s => s.id === id);
    if (target) {
      target.notes = notes;
      return true;
    }
    return false;
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
