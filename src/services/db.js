import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
let db = null;

/**
 * Initialisiert die Datenbankverbindung.
 * @param {string} path - Der Pfad zur SQLite-Datenbankdatei.
 */
export function initConnection(path) {
  if (db) {
    console.warn("Datenbankverbindung ist bereits initialisiert.");
    return;
  }
  db = new DB(path);
}

/**
 * Gibt die Datenbankverbindung zurück.
 * @returns {DB} Die Datenbankverbindung.
 * @throws {Error} Wenn die Datenbank nicht initialisiert ist.
 */
export function connection() {
  if (!db) throw new Error("Datenbank ist nicht initialisiert");
  return db;
}

export function handleDatabaseError(error) {
  console.error("Datenbankfehler:", error.message);
  throw new Error(
    "Interner Serverfehler. Bitte versuchen Sie es später erneut.",
  );
}
