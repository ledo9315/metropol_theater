import { connection } from "../services/db.js";

/**
 * Fügt einen neuen Regisseur ein und gibt dessen ID zurück.
 *
 * @param {string} directorName - Der Name des Regisseurs.
 * @returns {number} Die ID des eingefügten Regisseurs.
 */
export const add = (directorName) => {
    const db = connection();
    db.query("INSERT INTO director (name) VALUES (?)", [directorName]);
    return db.lastInsertRowId;
};

/**
 * Sucht die ID eines Regisseurs anhand seines Namens.
 *
 * @param {string} directorName - Der Name des Regisseurs.
 * @returns {number|null} Die ID des Regisseurs oder null, falls nicht gefunden.
 */
export const show = (directorName) => {
    const db = connection();
    const rows = db.query("SELECT id FROM director WHERE name = ?", [
        directorName,
    ]);
    return rows.length > 0 ? rows[0][0] : null;
};
