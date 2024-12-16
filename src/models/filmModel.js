import { connection } from "../services/db.js";

/**
 * Fügt ein neues Genre ein und gibt dessen ID zurück.
 *
 * @param {string} genreName - Der Name des Genres.
 * @returns {number} Die ID des eingefügten Genres.
 */
export const insertGenre = (genreName) => {
  const db = connection();
  db.query("INSERT INTO genres (name) VALUES (?)", [genreName]);
  return db.lastInsertRowId;
};

/**
 * Setzt die Genres eines Films neu (alle bisherigen werden gelöscht und durch die übergebenen ersetzt).
 *
 * @param {number} filmId - Die ID des Films.
 * @param {number[]} genreIds - Ein Array von Genre-IDs.
 */
export const setFilmGenres = (filmId, genreIds) => {
  const db = connection();
  db.query("DELETE FROM film_genres WHERE film_id = ?", [filmId]);

  for (const genreId of genreIds) {
    db.query(
      "INSERT INTO film_genres (film_id, genre_id) VALUES (?, ?)",
      [filmId, genreId],
    );
  }
};

/**
 * Sucht die ID eines Genres anhand seines Namens.
 *
 * @param {string} genreName - Der Name des Genres.
 * @returns {number|null} Die ID des Genres oder null, falls nicht gefunden.
 */
export const findGenreIdByName = (genreName) => {
  const db = connection();
  const rows = db.query("SELECT id FROM genres WHERE name = ?", [genreName]);
  return rows.length > 0 ? rows[0][0] : null;
};

/**
 * Fügt ein neues Land ein und gibt dessen ID zurück.
 *
 * @param {string} countryName - Der Name des Landes.
 * @returns {number} Die ID des eingefügten Landes.
 */
export const insertCountry = (countryName) => {
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
export const setFilmCountry = (filmId, countryId) => {
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
export const findCountryIdByName = (countryName) => {
  const db = connection();
  const rows = db.query("SELECT id FROM countries WHERE name = ?", [
    countryName,
  ]);
  return rows.length > 0 ? rows[0][0] : null;
};

/**
 * Fügt einen neuen Regisseur ein und gibt dessen ID zurück.
 *
 * @param {string} directorName - Der Name des Regisseurs.
 * @returns {number} Die ID des eingefügten Regisseurs.
 */
export const insertDirector = (directorName) => {
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
export const findDirectorIdByName = (directorName) => {
  const db = connection();
  const rows = db.query("SELECT id FROM director WHERE name = ?", [
    directorName,
  ]);
  return rows.length > 0 ? rows[0][0] : null;
};

/**
 * Setzt die Spielzeiten eines Films neu (alle bestehenden werden gelöscht und neu eingefügt).
 *
 * @param {number} filmId - Die ID des Films.
 * @param {Array} showtimes - Ein Array von Spielzeiten-Objekten mit {date, time, isOriginalVersion, is3D}.
 */
export const setShowtimesForFilm = (filmId, showtimes) => {
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
 * Ruft alle Filme und deren Details ab.
 *
 * @returns {Array} Array mit den Filmdetails, einschließlich Spielzeiten und zugehöriger Metadaten.
 */
export const getAllFilms = () => {
  const db = connection();
  const data = [...db.query(
    `SELECT
      films.id, 
      films.title,
      films.producer,
      films.duration,
      films.rating,
      films.poster,
      films.createdAt,
      GROUP_CONCAT(DISTINCT genres.name) AS genres,
      director.name AS director,
      GROUP_CONCAT(DISTINCT countries.name) AS countries,
      show_dates.show_date,
      show_times.show_time,
      show_details.is_original_version,
      show_details.is_3d
    FROM films
    LEFT JOIN film_genres ON films.id = film_genres.film_id
    LEFT JOIN genres ON film_genres.genre_id = genres.id
    LEFT JOIN film_countries ON films.id = film_countries.film_id
    LEFT JOIN countries ON film_countries.country_id = countries.id
    LEFT JOIN director ON films.director_id = director.id
    LEFT JOIN show_dates ON films.id = show_dates.film_id
    LEFT JOIN show_times ON show_dates.id = show_times.show_date_id
    LEFT JOIN show_details ON show_times.id = show_details.show_time_id
    GROUP BY films.id, show_dates.show_date, show_times.show_time
    `,
  )];
  return data;
};

/**
 * Ruft einen Film anhand seiner ID ab.
 *
 * @param {number} id - Die ID des Films.
 * @returns {object|null} Ein Objekt mit den Filmdetails oder null, wenn kein Film gefunden wurde.
 */
export const getFilmById = (id) => {
  const db = connection();
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
          films.producer,
          director.name AS director_name,
          GROUP_CONCAT(DISTINCT countries.name) AS country_names,
          GROUP_CONCAT(DISTINCT genres.name) AS genres
      FROM films
      LEFT JOIN director ON films.director_id = director.id
      LEFT JOIN film_countries ON films.id = film_countries.film_id
      LEFT JOIN countries ON film_countries.country_id = countries.id
      LEFT JOIN film_genres ON films.id = film_genres.film_id
      LEFT JOIN genres ON film_genres.genre_id = genres.id
      WHERE films.id = ?
      GROUP BY films.id;`,
    [id],
  );

  return result[0] || null;
};

/**
 * Ruft die Spielzeiten mit Details für einen bestimmten Film ab.
 *
 * @param {number} filmId - Die ID des Films.
 * @returns {Array} Ein Array von Objekten mit {date, time, isOriginalVersion, is3D}.
 */
export const getShowtimesForFilm = (filmId) => {
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

/**
 * Fügt einen neuen Film ein.
 *
 * @param {object} film - Das Filmobjekt mit allen nötigen Feldern.
 * @returns {number} Die ID des neu eingefügten Films.
 */
export const insertFilm = async (film) => {
  const db = connection();
  const query = `INSERT INTO films 
    (title, duration, production_year, rating, description, poster, trailer, trailer_poster, director_id, country_id, producer, createdAt)
  VALUES 
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

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
    film.producer,
    film.createdAt,
  ];

  db.query(query, values);
  return db.lastInsertRowId;
};

/**
 * Löscht einen Film und alle damit verknüpften Daten.
 *
 * @param {number} filmId - Die ID des zu löschenden Films.
 * @throws {Error} Wird geworfen, wenn beim Löschen ein Fehler auftritt.
 */
export const deleteFilm = (filmId) => {
  const db = connection();
  try {
    db.query(`DELETE FROM film_genres WHERE film_id = ?`, [filmId]);
    db.query(`DELETE FROM film_countries WHERE film_id = ?`, [filmId]);
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
    console.error("Fehler beim Löschen des Films:", error);
    throw error;
  }
};

/**
 * Aktualisiert die Daten eines Films (überschreibt Genres, Land und Spielzeiten).
 *
 * @param {number} id - Die ID des zu aktualisierenden Films.
 * @param {object} data - Ein Objekt mit { film, genreIds, showtimes }.
 */
export const updateFilm = (id, data) => {
  const db = connection();
  const { film, genreIds, showtimes } = data;

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
          producer = ?
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
    film.producer,
    id,
  ];

  db.query(query, values);

  // Genres überschreiben
  db.query("DELETE FROM film_genres WHERE film_id = ?", [id]);
  for (const gid of genreIds) {
    db.query("INSERT INTO film_genres (film_id, genre_id) VALUES (?, ?)", [
      id,
      gid,
    ]);
  }

  // Land überschreiben
  db.query("DELETE FROM film_countries WHERE film_id = ?", [id]);
  db.query("INSERT INTO film_countries (film_id, country_id) VALUES (?, ?)", [
    id,
    film.country_id,
  ]);

  // Spielzeiten überschreiben
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

    db.query("INSERT INTO show_times (show_date_id, show_time) VALUES (?, ?)", [
      showDateId,
      time,
    ]);
    const showTimeId = db.lastInsertRowId;

    db.query(
      "INSERT INTO show_details (show_time_id, is_original_version, is_3d) VALUES (?, ?, ?)",
      [showTimeId, isOriginalVersion ? 1 : 0, is3D ? 1 : 0],
    );
  }
};

/**
 * Holt Filme, die innerhalb eines bestimmten Datumsbereichs gezeigt werden (inkl. Spielzeiten und Details).
 *
 * @param {string} startDate - Das Startdatum (YYYY-MM-DD).
 * @param {string} endDate - Das Enddatum (YYYY-MM-DD).
 * @returns {Promise<Array>} Ein Array mit Filmdaten im angegebenen Zeitraum.
 */
export const getUpcomingFilms = async (startDate, endDate) => {
  const db = connection();
  const query = `
    SELECT 
      films.id,
      films.title,
      films.duration,
      films.rating,
      films.poster,
      GROUP_CONCAT(DISTINCT genres.name) AS genres,
      GROUP_CONCAT(DISTINCT show_times.show_time) AS show_times,
      show_dates.show_date,
      show_details.is_original_version,
      show_details.is_3d
    FROM films
    JOIN film_genres ON films.id = film_genres.film_id
    JOIN genres ON film_genres.genre_id = genres.id
    JOIN show_dates ON films.id = show_dates.film_id
    JOIN show_times ON show_dates.id = show_times.show_date_id
    JOIN show_details ON show_times.id = show_details.show_time_id
    WHERE show_dates.show_date BETWEEN ? AND ?
    GROUP BY films.id, show_dates.show_date
    ORDER BY show_dates.show_date ASC;
  `;
  const result = db.query(query, [startDate, endDate]);
  const data = [];
  for await (const row of result) {
    data.push(row);
  }
  return data;
};

/**
 * Holt kommende Filme, die außerhalb eines bestimmten Datumsbereichs gezeigt werden.
 *
 * @param {string} startDate - Das Startdatum (YYYY-MM-DD) ab dem Filme gesucht werden.
 * @param {string} exclusionStartDate - Der Start des Ausschlusszeitraums.
 * @param {string} exclusionEndDate - Das Ende des Ausschlusszeitraums.
 * @returns {Promise<Array>} Ein Array mit kommenden Filmen außerhalb des Ausschlusszeitraums.
 */
export const getComingSoonFilms = async (
  startDate,
  exclusionStartDate,
  exclusionEndDate,
) => {
  const db = connection();
  const query = `
    SELECT 
      films.id,
      films.title,
      films.duration,
      films.rating,
      films.poster,
      GROUP_CONCAT(DISTINCT genres.name) AS genres,
      GROUP_CONCAT(DISTINCT show_times.show_time) AS show_times,
      show_dates.show_date
    FROM films
    JOIN film_genres ON films.id = film_genres.film_id
    JOIN genres ON film_genres.genre_id = genres.id
    JOIN show_dates ON films.id = show_dates.film_id
    JOIN show_times ON show_dates.id = show_times.show_date_id
    WHERE show_dates.show_date >= ? 
      AND films.id NOT IN (
        SELECT DISTINCT films.id
        FROM films
        JOIN show_dates ON films.id = show_dates.film_id
        WHERE show_dates.show_date BETWEEN ? AND ?
      )
    GROUP BY films.id, show_dates.show_date
    ORDER BY show_dates.show_date ASC;
  `;

  const result = db.query(query, [
    startDate,
    exclusionStartDate,
    exclusionEndDate,
  ]);
  const data = [];
  for await (const row of result) {
    data.push(row);
  }
  return data;
};

export const insertHighlight = (image, description, title) => {
  const db = connection();
  db.query(
    "INSERT INTO highlights (highlight_image, description, highlight_title) VALUES (?,?,?)",
    [
      image,
      description,
      title,
    ],
  );
};

export const getAllHighlights = () => {
  const db = connection();

  return db.query("SELECT * FROM highlights");
};

export const getHighlightById = (id) => {
  const db = connection();
  const result = db.query("SELECT * FROM highlights WHERE id = ?", [id]);
  return result[0] || null;
};

export const updateHighlight = (image, description, title, id) => {
  const db = connection();

  db.query(
    `
    UPDATE 
      highlights 
    SET
      highlight_image = ?,
      description = ?,
      highlight_title = ?
    WHERE id = ?;
    `,
    [image, description, title, id],
  );
};

export const deleteHighlight = (id) => {
  const db = connection();

  db.query(
    `
    DELETE FROM highlights WHERE id = ?
  `,
    [id],
  );
};
