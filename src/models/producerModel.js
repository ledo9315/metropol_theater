import { connection, handleDatabaseError } from "../services/db.js";

/**
 * Fügt einen neuen Produzenten ein und gibt dessen ID zurück.
 *
 * @param {string} producerName - Der Name des Produzenten.
 * @returns {number} Die ID des eingefügten Produzenten.
 */
export const add = (producerName) => {
    try {
        const db = connection();
        db.query("INSERT INTO producers (name) VALUES (?)", [producerName]);
        return db.lastInsertRowId;
    } catch (error) {
        handleDatabaseError(error);
    }
};

/**
 * Setzt die Produzenten eines Films neu (alle bisherigen werden gelöscht und durch die übergebenen ersetzt).
 *
 * @param {number} filmId - Die ID des Films.
 * @param {number[]} producerIds - Ein Array von Produzenten-IDs.
 */
export const update = (filmId, producerIds) => {
    const db = connection();
    try {
        db.query("DELETE FROM film_producers WHERE film_id = ?", [filmId]);

        for (const producerId of producerIds) {
            db.query(
                "INSERT INTO film_producers (film_id, producer_id) VALUES (?, ?)",
                [filmId, producerId],
            );
        }
    } catch (error) {
        handleDatabaseError(error);
    }
};

/**
 * Sucht die ID eines Produzenten anhand seines Namens.
 *
 * @param {string} producerName - Der Name des Produzenten.
 * @returns {number|null} Die ID des Produzenten oder null, falls nicht gefunden.
 */
export const show = (producerName) => {
    try {
        const db = connection();
        const rows = db.query("SELECT id FROM producers WHERE name = ?", [
            producerName,
        ]);
        return rows.length > 0 ? rows[0][0] : null;
    } catch (error) {
        handleDatabaseError(error);
    }
};
