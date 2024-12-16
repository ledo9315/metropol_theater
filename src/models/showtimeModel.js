import { connection } from "../services/db.js";

/**
 * Setzt die Spielzeiten eines Films neu (alle bestehenden werden gelöscht und neu eingefügt).
 *
 * @param {number} filmId - Die ID des Films.
 * @param {Array} showtimes - Ein Array von Spielzeiten-Objekten mit {date, time, isOriginalVersion, is3D}.
 */
export const update = (filmId, showtimes) => {
    const db = connection();
    db.query(
        `DELETE FROM show_details WHERE show_time_id IN (
       SELECT show_times.id FROM show_times
       INNER JOIN show_dates ON show_times.show_date_id = show_dates.id
       WHERE show_dates.film_id = ?
     )`,
        [filmId],
    );
    db.query(
        `DELETE FROM show_times WHERE show_date_id IN (
       SELECT id FROM show_dates WHERE film_id = ?
     )`,
        [filmId],
    );
    db.query("DELETE FROM show_dates WHERE film_id = ?", [filmId]);

    for (const { date, time, isOriginalVersion, is3D } of showtimes) {
        db.query(
            "INSERT INTO show_dates (film_id, show_date) VALUES (?, ?)",
            [filmId, date],
        );
        const showDateId = db.lastInsertRowId;

        db.query(
            "INSERT INTO show_times (show_date_id, show_time) VALUES (?, ?)",
            [showDateId, time],
        );
        const showTimeId = db.lastInsertRowId;

        db.query(
            `INSERT INTO show_details (show_time_id, is_original_version, is_3d) 
       VALUES (?, ?, ?)`,
            [showTimeId, isOriginalVersion ? 1 : 0, is3D ? 1 : 0],
        );
    }
};

/**
 * Ruft die Spielzeiten mit Details für einen bestimmten Film ab.
 *
 * @param {number} filmId - Die ID des Films.
 * @returns {Array} Ein Array von Objekten mit {date, time, isOriginalVersion, is3D}.
 */
export const show = (filmId) => {
    const db = connection();
    const result = db.query(
        `SELECT 
        show_dates.show_date, 
        show_times.show_time, 
        show_details.is_original_version, 
        show_details.is_3d
      FROM show_dates
      INNER JOIN show_times ON show_dates.id = show_times.show_date_id
      LEFT JOIN show_details ON show_times.id = show_details.show_time_id
      WHERE show_dates.film_id = ?;`,
        [filmId],
    );

    return result.map((row) => ({
        date: row[0],
        time: row[1],
        isOriginalVersion: !!row[2],
        is3D: !!row[3],
    }));
};
