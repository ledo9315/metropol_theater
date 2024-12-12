import { connection } from "../services/db.js";

// Speichert ein Genre in der Datenbank und gibt dessen ID zurück
export const saveGenreToDB = (genreName) => {
  const db = connection();

  if (!genreName || typeof genreName !== "string") {
    console.error("Ungültiges Genre:", genreName);
    return null;
  }

  const existingGenre = db.query(
    "SELECT id FROM genres WHERE name = ?",
    [genreName],
  );

  if (existingGenre.length > 0) {
    return parseInt(existingGenre[0]);
  }

  db.query("INSERT INTO genres (name) VALUES (?)", [genreName]);

  return db.lastInsertRowId;
};

// Verknüpft ein Genre mit einem Film
export const saveFilmGenres = (filmId, genreIds) => {
  const db = connection();

  // Hole aktuelle Verknüpfungen
  const existingGenres = db.query(
    "SELECT genre_id FROM film_genres WHERE film_id = ?",
    [filmId],
  ).map((row) => row[0]);

  // Füge neue Verknüpfungen hinzu
  genreIds.forEach((genreId) => {
    if (!existingGenres.includes(genreId)) {
      db.query(
        `INSERT INTO film_genres (film_id, genre_id) VALUES (?, ?)`,
        [filmId, genreId],
      );
    }
  });

  // Entferne nicht mehr benötigte Verknüpfungen
  existingGenres.forEach((existingGenreId) => {
    if (!genreIds.includes(existingGenreId)) {
      db.query(
        `DELETE FROM film_genres WHERE film_id = ? AND genre_id = ?`,
        [filmId, existingGenreId],
      );
    }
  });
};

// Speichert ein Land in der Datenbank
export const saveCountry = (countryName) => {
  const db = connection();

  const existingCountry = db.query(
    "SELECT id FROM countries WHERE name = ?",
    [countryName],
  );

  if (existingCountry.length > 0) {
    return parseInt(existingCountry[0]);
  }

  db.query("INSERT INTO countries (name) VALUES (?)", [countryName]);

  return db.lastInsertRowId;
};

// Verknüpft ein Land mit einem Film
export const saveFilmCountry = (filmId, countryId) => {
  const db = connection();

  // Hole aktuelle Verknüpfung
  const existingCountry = db.query(
    "SELECT country_id FROM film_countries WHERE film_id = ?",
    [filmId],
  );

  if (existingCountry.length > 0) {
    const existingCountryId = existingCountry[0][0];
    if (existingCountryId !== countryId) {
      db.query(
        `UPDATE film_countries SET country_id = ? WHERE film_id = ?`,
        [countryId, filmId],
      );
    } else {
      console.log("Land ist bereits korrekt, keine Aktualisierung notwendig.");
    }
  } else {
    console.log(`Füge neues Land mit ID ${countryId} hinzu.`);
    db.query(
      `INSERT INTO film_countries (film_id, country_id) VALUES (?, ?)`,
      [filmId, countryId],
    );
  }
};

// Speichert einen Regisseur in der Datenbank
export const saveDirectorToDB = (directorName) => {
  const db = connection();

  const existingDirector = db.query(
    "SELECT id FROM director WHERE name = ?",
    [directorName],
  );

  if (existingDirector.length > 0) {
    return parseInt(existingDirector[0]);
  }

  db.query("INSERT INTO director (name) VALUES (?)", [directorName]);

  return db.lastInsertRowId;
};

export const saveShowtimesWithDetails = (filmId, showtimes) => {
  const db = connection();

  // Aktuelle Spielzeiten aus der Datenbank abrufen
  const existingShowDates = db.query(
    `SELECT id, show_date FROM show_dates WHERE film_id = ?`,
    [filmId],
  ).map((row) => ({ id: row[0], date: row[1] }));

  const existingShowTimes = db.query(
    `SELECT show_times.id, show_times.show_date_id, show_times.show_time
     FROM show_times
     INNER JOIN show_dates ON show_times.show_date_id = show_dates.id
     WHERE show_dates.film_id = ?`,
    [filmId],
  ).map((row) => ({ id: row[0], show_date_id: row[1], time: row[2] }));

  // Liste der neuen Spielzeiten (aus dem Formular)
  const newShowDates = showtimes.map(({ date }) => date);
  const newShowTimes = showtimes.map(({ date, time }) => ({ date, time }));

  // Entferne nicht mehr benötigte `show_times` und `show_details`
  existingShowTimes.forEach(({ id: showTimeId, show_date_id, time }) => {
    const correspondingDate = existingShowDates.find((d) =>
      d.id === show_date_id
    )?.date;
    const isStillPresent = newShowTimes.some(
      (newShowTime) =>
        newShowTime.date === correspondingDate && newShowTime.time === time,
    );

    if (!isStillPresent) {
      console.log(
        `Entferne show_time und zugehörige show_details mit ID ${showTimeId}`,
      );
      db.query(`DELETE FROM show_details WHERE show_time_id = ?`, [showTimeId]);
      db.query(`DELETE FROM show_times WHERE id = ?`, [showTimeId]);
    }
  });

  // Entferne nicht mehr benötigte `show_dates`
  existingShowDates.forEach(({ id: showDateId, date }) => {
    const isStillPresent = newShowDates.includes(date);

    if (!isStillPresent) {
      console.log(`Entferne show_date mit ID ${showDateId}`);
      db.query(`DELETE FROM show_dates WHERE id = ?`, [showDateId]);
    }
  });

  // Neue oder aktualisierte Einträge hinzufügen/aktualisieren
  for (const { date, time, isOriginalVersion, is3D } of showtimes) {
    try {
      // Überprüfen, ob `show_date` existiert
      const existingDate = db.query(
        `SELECT id FROM show_dates WHERE film_id = ? AND show_date = ?`,
        [filmId, date],
      );

      let showDateId;
      if (existingDate.length > 0) {
        showDateId = existingDate[0][0]; // ID der vorhandenen show_date
      } else {
        db.query(
          `INSERT INTO show_dates (film_id, show_date) VALUES (?, ?)`,
          [filmId, date],
        );
        showDateId = db.lastInsertRowId;
      }

      // Überprüfen, ob `show_time` existiert
      const existingTime = db.query(
        `SELECT id FROM show_times WHERE show_date_id = ? AND show_time = ?`,
        [showDateId, time],
      );

      let showTimeId;
      if (existingTime.length > 0) {
        showTimeId = existingTime[0][0]; // ID der vorhandenen show_time
        // Aktualisieren der Zeit
        db.query(
          `UPDATE show_times SET show_time = ? WHERE id = ?`,
          [time, showTimeId],
        );
      } else {
        db.query(
          `INSERT INTO show_times (show_date_id, show_time) VALUES (?, ?)`,
          [showDateId, time],
        );
        showTimeId = db.lastInsertRowId;
      }

      // Überprüfen, ob `show_details` existiert
      const existingDetails = db.query(
        `SELECT id FROM show_details WHERE show_time_id = ?`,
        [showTimeId],
      );

      if (existingDetails.length > 0) {
        // Aktualisieren der Details
        db.query(
          `UPDATE show_details 
           SET is_original_version = ?, is_3d = ? 
           WHERE show_time_id = ?`,
          [isOriginalVersion ? 1 : 0, is3D ? 1 : 0, showTimeId],
        );
      } else {
        // Details hinzufügen
        db.query(
          `INSERT INTO show_details (show_time_id, is_original_version, is_3d) 
           VALUES (?, ?, ?)`,
          [showTimeId, isOriginalVersion ? 1 : 0, is3D ? 1 : 0],
        );
      }
    } catch (error) {
      console.error(
        "Fehler beim Speichern/Aktualisieren der Spielzeiten:",
        error,
      );
      throw error;
    }
  }

  console.log("Speichern der Spielzeiten abgeschlossen.");
};

// Gibt alle Filme aus der Datenbank zurück
export const getAllFilmsFromDB = () => {
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

// Gibt einen Film mit allen Details zurück
export const getFilmByIdFromDB = (id) => {
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

  return result[0];
};

// Gibt Spielzeiten mit Details zurück
export const getShowtimesWithDetails = (filmId) => {
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

// Fügt einen neuen Film in die Datenbank ein
export const addFilmToDB = async (film) => {
  const db = connection();

  console.log("Film wird hinzugefügt:", film);
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

  const filmId = db.lastInsertRowId;

  console.log("Eingefügte film_id:", filmId);

  return filmId;
};

// Löscht einen Film
export const deleteFilmFromDB = (filmId) => {
  const db = connection();

  try {
    console.log(`Lösche Film mit ID ${filmId} und alle verknüpften Daten...`);

    // 1. Lösche verknüpfte Genres
    db.query(`DELETE FROM film_genres WHERE film_id = ?`, [filmId]);
    console.log("Verknüpfte Genres gelöscht.");

    // 2. Lösche verknüpfte Länder
    db.query(`DELETE FROM film_countries WHERE film_id = ?`, [filmId]);
    console.log("Verknüpfte Länder gelöscht.");

    // 3. Lösche Spielzeiten-Details (show_details)
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
    console.log("Verknüpfte Spielzeit-Details gelöscht.");

    // 4. Lösche Spielzeiten (show_times)
    db.query(
      `DELETE FROM show_times 
       WHERE show_date_id IN (
         SELECT id FROM show_dates WHERE film_id = ?
       )`,
      [filmId],
    );
    console.log("Verknüpfte Spielzeiten gelöscht.");

    // 5. Lösche Spieltermine (show_dates)
    db.query(`DELETE FROM show_dates WHERE film_id = ?`, [filmId]);
    console.log("Verknüpfte Spieltermine gelöscht.");

    // 6. Lösche den Film selbst
    db.query(`DELETE FROM films WHERE id = ?`, [filmId]);
    console.log(`Film mit ID ${filmId} erfolgreich gelöscht.`);
  } catch (error) {
    console.error("Fehler beim Löschen des Films:", error);
    throw error; // Fehler weiterwerfen
  }
};

export const updateFilmInDB = (id, data) => {
  const db = connection();

  const { film, showtimes, genreIds } = data;

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

  // Genres aktualisieren
  saveFilmGenres(id, genreIds);

  // Länder aktualisieren
  saveFilmCountry(id, film.country_id);

  // Spielzeiten aktualisieren
  saveShowtimesWithDetails(id, showtimes);
};

// model.js
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

export const getComingSoonFilmsFromDB = async (
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
