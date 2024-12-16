import { connection, handleDatabaseError } from "../services/db.js";

/**
 * Fügt ein neues Genre ein und gibt dessen ID zurück.
 *
 * @param {string} genreName - Der Name des Genres.
 * @returns {number} Die ID des eingefügten Genres.
 */
export const add = (genreName) => {
    try {
        const db = connection();
        db.query("INSERT INTO genres (name) VALUES (?)", [genreName]);
        return db.lastInsertRowId;
    } catch (error) {
        handleDatabaseError(error);
    }
};

/**
 * Setzt die Genres eines Films neu (alle bisherigen werden gelöscht und durch die übergebenen ersetzt).
 *
 * @param {number} filmId - Die ID des Films.
 * @param {number[]} genreIds - Ein Array von Genre-IDs.
 */
export const update = (filmId, genreIds) => {
    const db = connection();
    try {
        db.query("DELETE FROM film_genres WHERE film_id = ?", [filmId]);

        for (const genreId of genreIds) {
            db.query(
                "INSERT INTO film_genres (film_id, genre_id) VALUES (?, ?)",
                [filmId, genreId],
            );
        }
    } catch (error) {
        handleDatabaseError(error);
    }
};

/**
 * Sucht die ID eines Genres anhand seines Namens.
 *
 * @param {string} genreName - Der Name des Genres.
 * @returns {number|null} Die ID des Genres oder null, falls nicht gefunden.
 */
export const show = (genreName) => {
    try {
        const db = connection();
        const rows = db.query("SELECT id FROM genres WHERE name = ?", [
            genreName,
        ]);
        return rows.length > 0 ? rows[0][0] : null;
    } catch (error) {
        handleDatabaseError(error);
    }
};
