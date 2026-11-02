import * as SQLite from "expo-sqlite";
import { ScanRecord } from "./types";

let database: SQLite.SQLiteDatabase | null = null;

async function getDatabase() {
  database ??= await SQLite.openDatabaseAsync("krishi-drishti.db");
  await database.execAsync(
    "CREATE TABLE IF NOT EXISTS scans (id INTEGER PRIMARY KEY NOT NULL, image_uri TEXT NOT NULL, created_at TEXT NOT NULL, predictions_json TEXT NOT NULL);"
  );
  return database;
}

export async function saveScan(scan: ScanRecord) {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT OR REPLACE INTO scans (id, image_uri, created_at, predictions_json) VALUES (?, ?, ?, ?)",
    scan.id,
    scan.imageUri,
    scan.createdAt,
    JSON.stringify(scan.predictions)
  );
}

export async function loadScans(): Promise<ScanRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: number; image_uri: string; created_at: string; predictions_json: string }>(
    "SELECT id, image_uri, created_at, predictions_json FROM scans ORDER BY id DESC"
  );
  return rows.map((row) => ({
    id: row.id,
    imageUri: row.image_uri,
    createdAt: row.created_at,
    predictions: JSON.parse(row.predictions_json) as ScanRecord["predictions"]
  }));
}
