import { connection } from "../services/db.js";

/**
 * Holt Filme, die innerhalb eines bestimmten Datumsbereichs gezeigt werden (inkl. Spielzeiten und Details).
 *
 * @param {string} startDate - Das Startdatum (YYYY-MM-DD).
 * @param {string} endDate - Das Enddatum (YYYY-MM-DD).
 * @returns {Promise<Array>} Ein Array mit Filmdaten im angegebenen Zeitraum.
 */
export const getUpcomingFilms = async (startDate, endDate) => {
  const db = connection();
  try {
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
  } catch (error) {
    handleDatabaseError(error);
  }
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
  try {
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
  } catch (error) {
    handleDatabaseError(error);
  }
};
