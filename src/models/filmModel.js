import { connection, handleDatabaseError } from "../services/db.js";

/**
 * Ruft alle Filme und deren Details ab.
 *
 * @returns {Array} Array mit den Filmdetails, einschließlich Spielzeiten und zugehöriger Metadaten.
 */
export const index = async (
  sortField = "createdAt",
  sortOrder = "ASC",
  search = "",
) => {
  const db = connection();
  try {
    const query = `
          SELECT
              films.id,
              films.title,
              films.duration,
              films.rating,
              films.poster,
              films.createdAt,
              films.is_3d,
              films.is_original_version,
              GROUP_CONCAT(DISTINCT genres.name) AS genres,
              GROUP_CONCAT(DISTINCT producers.name) AS producers,
              director.name AS director,
              GROUP_CONCAT(DISTINCT countries.name) AS countries,
              show_dates.show_date,
              show_times.show_time,
              show_details.is_original_version,
              show_details.is_3d
          FROM films
          LEFT JOIN film_genres ON films.id = film_genres.film_id
          LEFT JOIN genres ON film_genres.genre_id = genres.id
          LEFT JOIN film_producers ON films.id = film_producers.film_id
          LEFT JOIN producers ON film_producers.producer_id = producers.id
          LEFT JOIN film_countries ON films.id = film_countries.film_id
          LEFT JOIN countries ON film_countries.country_id = countries.id
          LEFT JOIN director ON films.director_id = director.id
          LEFT JOIN show_dates ON films.id = show_dates.film_id
          LEFT JOIN show_times ON show_dates.id = show_times.show_date_id
          LEFT JOIN show_details ON show_times.id = show_details.show_time_id
          WHERE films.title LIKE ?
          GROUP BY films.id, show_dates.show_date, show_times.show_time
          ORDER BY ${sortField} ${sortOrder};
      `;

    const searchPattern = `%${search}%`; // Füge Wildcards für die Suche hinzu
    return db.query(query, [searchPattern]);
  } catch (error) {
    console.error("Fehler bei der Datenbankabfrage:", error);
    throw new Error("Datenbankfehler");
  }
};

/**
 * Ruft einen Film anhand seiner ID ab.
 *
 * @param {number} id - Die ID des Films.
 * @returns {object|null} Ein Objekt mit den Filmdetails oder null, wenn kein Film gefunden wurde.
 */
export const show = (id) => {
  const db = connection();
  try {
    const result = db.query(
      `SELECT 
          films.id AS film_id,
          films.title,
          films.duration,
          films.rating,
          films.description,
          films.production_year,
          films.poster,
          films.trailer,
          films.trailer_poster,
          films.createdAt,
          films.is_3d,
          films.is_original_version,
          GROUP_CONCAT(DISTINCT producers.name) AS producers,
          director.name AS director_name,
          GROUP_CONCAT(DISTINCT countries.name) AS country_names,
          GROUP_CONCAT(DISTINCT genres.name) AS genres
      FROM films
      LEFT JOIN director ON films.director_id = director.id
      LEFT JOIN film_countries ON films.id = film_countries.film_id
      LEFT JOIN countries ON film_countries.country_id = countries.id
      LEFT JOIN film_genres ON films.id = film_genres.film_id
      LEFT JOIN genres ON film_genres.genre_id = genres.id
      LEFT JOIN film_producers ON films.id = film_producers.film_id 
      LEFT JOIN producers ON film_producers.producer_id = producers.id 
      WHERE films.id = ?
      GROUP BY films.id;`,
      [id],
    );

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error);
  }
};

/**
 * Fügt einen neuen Film ein.
 *
 * @param {object} film - Das Filmobjekt mit allen nötigen Feldern.
 * @returns {number} Die ID des neu eingefügten Films.
 */
export const add = (film) => {
  const db = connection();
  try {
    const query = `
    INSERT INTO films 
      (title, duration, production_year, rating, description, poster, trailer, trailer_poster, director_id, country_id, createdAt, is_3d, is_original_version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

    const values = [
      film.title,
      film.duration,
      film.production_year,
      film.rating,
      film.description,
      film.poster,
      film.trailer,
      film.trailer_poster,
      film.director_id,
      film.country_id,
      film.createdAt,
      film.is_film_3d ? 1 : 0,
      film.is_film_original_version ? 1 : 0,
    ];

    db.query(query, values);
    return db.lastInsertRowId;
  } catch (error) {
    handleDatabaseError(error);
  }
};

/**
 * Löscht einen Film und alle damit verknüpften Daten.
 *
 * @param {number} filmId - Die ID des zu löschenden Films.
 * @throws {Error} Wird geworfen, wenn beim Löschen ein Fehler auftritt.
 */
export const destroy = (filmId) => {
  const db = connection();
  try {
    db.query(`DELETE FROM film_genres WHERE film_id = ?`, [filmId]);
    db.query(`DELETE FROM film_countries WHERE film_id = ?`, [filmId]);
    db.query(`DELETE FROM film_producers WHERE film_id = ?`, [filmId]);
    db.query(
      `DELETE FROM show_details 
       WHERE show_time_id IN (
         SELECT show_times.id 
         FROM show_times
         INNER JOIN show_dates ON show_times.show_date_id = show_dates.id
         WHERE show_dates.film_id = ?
       )`,
      [filmId],
    );
    db.query(
      `DELETE FROM show_times 
       WHERE show_date_id IN (
         SELECT id FROM show_dates WHERE film_id = ?
       )`,
      [filmId],
    );
    db.query(`DELETE FROM show_dates WHERE film_id = ?`, [filmId]);
    db.query(`DELETE FROM films WHERE id = ?`, [filmId]);
  } catch (error) {
    handleDatabaseError(error);
  }
};

/**
 * Aktualisiert die Daten eines Films (überschreibt Genres, Land und Spielzeiten).
 *
 * @param {number} id - Die ID des zu aktualisierenden Films.
 * @param {object} data - Ein Objekt mit { film, genreIds, showtimes }.
 */
export const update = (id, data) => {
  const db = connection();
  const { film, genreIds, showtimes, producerIds } = data;

  try {
    // 1. Film aktualisieren
    const query = `UPDATE films
      SET title = ?,
          duration = ?,
          production_year = ?,
          rating = ?,
          description = ?,
          poster = ?,
          trailer = ?,
          trailer_poster = ?,
          director_id = ?,
          is_3d = ?,
          is_original_version = ?
      WHERE id = ?;`;

    const values = [
      film.title,
      film.duration,
      film.production_year,
      film.rating,
      film.description,
      film.poster,
      film.trailer,
      film.trailer_poster,
      film.director_id,
      film.is_film_3d ? 1 : 0,
      film.is_film_original_version ? 1 : 0,
      id,
    ];

    db.query(query, values);

    db.query("DELETE FROM film_genres WHERE film_id = ?", [id]);
    for (const gid of genreIds) {
      db.query("INSERT INTO film_genres (film_id, genre_id) VALUES (?, ?)", [
        id,
        gid,
      ]);
    }

    db.query("DELETE FROM film_producers WHERE film_id = ?", [id]);
    for (const pid of producerIds) {
      db.query(
        "INSERT INTO film_producers (film_id, producer_id) VALUES (?, ?)",
        [id, pid],
      );
    }

    db.query("DELETE FROM film_countries WHERE film_id = ?", [id]);
    db.query("INSERT INTO film_countries (film_id, country_id) VALUES (?, ?)", [
      id,
      film.country_id,
    ]);

    db.query(
      `DELETE FROM show_details WHERE show_time_id IN (
       SELECT show_times.id FROM show_times
       INNER JOIN show_dates ON show_times.show_date_id = show_dates.id
       WHERE show_dates.film_id = ?
     )`,
      [id],
    );
    db.query(
      `DELETE FROM show_times WHERE show_date_id IN (
       SELECT id FROM show_dates WHERE film_id = ?
     )`,
      [id],
    );
    db.query("DELETE FROM show_dates WHERE film_id = ?", [id]);

    for (const { date, time, isOriginalVersion, is3D } of showtimes) {
      db.query("INSERT INTO show_dates (film_id, show_date) VALUES (?, ?)", [
        id,
        date,
      ]);
      const showDateId = db.lastInsertRowId;

      db.query(
        "INSERT INTO show_times (show_date_id, show_time) VALUES (?, ?)",
        [
          showDateId,
          time,
        ],
      );
      const showTimeId = db.lastInsertRowId;

      db.query(
        "INSERT INTO show_details (show_time_id, is_original_version, is_3d) VALUES (?, ?, ?)",
        [showTimeId, isOriginalVersion ? 1 : 0, is3D ? 1 : 0],
      );
    }
  } catch (error) {
    handleDatabaseError(error);
  }
};

/**
 *  Gibt das Poster eines Films zurück.
 *
 * @param {number} id - Die ID des Films.
 * @returns {string|null} Der Pfad zum Poster oder null, wenn kein Film gefunden wurde.
 */
export const showPoster = (id) => {
  const db = connection();
  try {
    const result = db.query(
      `SELECT poster FROM films WHERE id = ?;`,
      [id],
    );

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error);
  }
};

/**
 * Gibt die Dateien eines Films zurück (Poster, Trailer, Trailer-Poster).
 * @param {number} id - Die ID des Films.
 * @returns {string|null} Die Dateien des Films oder null, wenn kein Film gefunden wurde.
 */
export const showFiles = (id) => {
  const db = connection();
  try {
    const result = db.query(
      `SELECT poster, trailer, trailer_poster FROM films WHERE id = ?;`,
      [id],
    );

    return result[0] || null;
  } catch (error) {
    handleDatabaseError(error);
  }
};
