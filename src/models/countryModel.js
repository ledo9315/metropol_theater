import { connection } from "../services/db.js";

/**
 * Fügt ein neues Land ein und gibt dessen ID zurück.
 *
 * @param {string} countryName - Der Name des Landes.
 * @returns {number} Die ID des eingefügten Landes.
 */
export const add = (countryName) => {
    const db = connection();
    db.query("INSERT INTO countries (name) VALUES (?)", [countryName]);
    return db.lastInsertRowId;
};

/**
 * Setzt das Land für einen Film neu (vorheriges Land wird entfernt).
 *
 * @param {number} filmId - Die ID des Films.
 * @param {number} countryId - Die ID des neuen Landes.
 */
export const update = (filmId, countryId) => {
    const db = connection();
    db.query("DELETE FROM film_countries WHERE film_id = ?", [filmId]);
    db.query(
        "INSERT INTO film_countries (film_id, country_id) VALUES (?, ?)",
        [filmId, countryId],
    );
};

/**
 * Sucht die ID eines Landes anhand seines Namens.
 *
 * @param {string} countryName - Der Name des Landes.
 * @returns {number|null} Die ID des Landes oder null, falls nicht gefunden.
 */
export const show = (countryName) => {
    const db = connection();
    const rows = db.query("SELECT id FROM countries WHERE name = ?", [
        countryName,
    ]);
    return rows.length > 0 ? rows[0][0] : null;
};
