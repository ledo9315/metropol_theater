// filmService.js

import {
    deleteFilm as modelDeleteFilm,
    deleteHighlight as modelDeleteHighlight,
    findCountryIdByName as modelFindCountryIdByName,
    findDirectorIdByName as modelFindDirectorIdByName,
    findGenreIdByName as modelFindGenreIdByName,
    getAllFilms as modelGetAllFilms,
    getAllHighlights as modelGetHighlights,
    getComingSoonFilms as modelGetComingSoonFilms,
    getFilmById as modelGetFilmById,
    getHighlightById as modelGetHighlightById,
    getShowtimesForFilm as modelGetShowtimesForFilm,
    getUpcomingFilms as modelGetUpcomingFilms,
    insertCountry as modelInsertCountry,
    insertDirector as modelInsertDirector,
    insertFilm as modelInsertFilm,
    insertGenre as modelInsertGenre,
    insertHighlight as modelInsertHighlight,
    setFilmCountry as modelSetFilmCountry,
    setFilmGenres as modelSetFilmGenres,
    setShowtimesForFilm as modelSetShowtimesForFilm,
    updateFilm as modelUpdateFilm,
    updateHighlight as modelUpdateHighlight,
} from "../models/filmModel.js";

import {
    buildFilmObject,
    extractFilmFormData,
    extractShowtimes,
    uploadFiles,
} from "../utils/filmUtils.js";

import {
    extractDayAndWeekday,
    formatDateToGermanLocale,
    formatDateWithWeekday,
    groupAndSortShowtimes,
} from "../utils/formatDate.js";

import { saveFile } from "../utils/fileUtils.js";
import { validateFilmData } from "../utils/validators.js";
import { render } from "../services/render.js";

/**
 * Ruft alle Filme und deren Details ab.
 *
 * @returns {Array} Array mit den Filmdetails, einschließlich Spielzeiten und zugehöriger Metadaten.
 */
export const getAllFilms = async () => {
    try {
        const data = await modelGetAllFilms();

        console.log("Filme aus getAllFilms:", data);

        const films = {};
        data.forEach((row) => {
            const filmId = row[0];
            if (!films[filmId]) {
                films[filmId] = {
                    id: row[0],
                    title: row[1],
                    producer: row[2],
                    duration: row[3],
                    rating: row[4],
                    poster: row[5],
                    createdAt: formatDateToGermanLocale(row[6]),
                    genres: row[7] ? row[7].split(",") : [],
                    director: row[8],
                    countries: row[9] ? row[9].split(",") : [],
                    showtimes: {},
                };
            }

            const date = row[10] ? formatDateToGermanLocale(row[10]) : null;
            const time = row[11];
            const isOriginalVersion = !!row[12];
            const is3D = !!row[13];

            if (date) {
                if (!films[filmId].showtimes[date]) {
                    films[filmId].showtimes[date] = [];
                }

                films[filmId].showtimes[date].push({
                    time,
                    isOriginalVersion,
                    is3D,
                });
            }
        });

        return Object.values(films);
    } catch (error) {
        console.error("Fehler beim Abrufen der Filme:", error);
        throw new Error("Filme konnten nicht abgerufen werden.");
    }
};

/**
 * Ruft Details eines Films und dessen Spielzeiten anhand der ID ab.
 *
 * @param {number} id - Die eindeutige ID des Films.
 * @returns {Object|null} Ein Objekt mit den Filmdetails oder null, wenn kein Film gefunden wurde.
 */
export const getFilmById = async (id) => {
    try {
        let film = modelGetFilmById(id);

        if (!film) {
            console.log(`Kein Film mit der ID ${id} gefunden.`);
            return null;
        }

        film = {
            id: film[0],
            title: film[1],
            duration: film[2],
            rating: film[3],
            description: film[4],
            production_year: film[5],
            poster: film[6],
            trailer: film[7],
            trailer_poster: film[8],
            createdAt: film[9],
            producer: film[10],
            director_name: film[11],
            country_names: film[12] ? film[12].split(",") : [],
            genres: film[13] ? film[13].split(",") : [],
        };

        const showtimes = modelGetShowtimesForFilm(id);

        const formattedShowtimes = showtimes.map((row) => ({
            date: formatDateWithWeekday(row.date),
            time: row.time,
            isOriginalVersion: row.isOriginalVersion,
            is3D: row.is3D,
        }));

        const groupedShowtimes = groupAndSortShowtimes(formattedShowtimes);

        return { film, showtimes, groupedShowtimes };
    } catch (error) {
        console.error("Fehler beim Abrufen des Films:", error);
        throw new Error("Film konnte nicht abgerufen werden.");
    }
};

/**
 * Fügt einen neuen Film hinzu.
 *
 * @param {Request} req - Die eingehende Anfrage mit den Formulardaten des Films.
 * @returns {Response} Antwortstatus mit entsprechenden Informationen.
 */
export const addFilm = async (req) => {
    try {
        const formData = await req.formData();
        const { errors, hasErrors } = validateFilmData(formData);
        const formValues = extractFilmFormData(formData);

        if (hasErrors) {
            console.log("Validierungsfehler:", errors);
            return new Response(render("add.html", { errors, formValues }), {
                status: 400,
                headers: { "Content-Type": "text/html" },
            });
        }

        const showtimes = extractShowtimes(formValues);
        await uploadFiles(formData, formValues);

        let directorId = modelFindDirectorIdByName(formValues.director);
        if (!directorId) {
            directorId = modelInsertDirector(formValues.director);
        }

        let countryId = modelFindCountryIdByName(formValues.production_country);
        if (!countryId) {
            countryId = modelInsertCountry(formValues.production_country);
        }

        const film = buildFilmObject(formValues, directorId, countryId);
        const filmId = await modelInsertFilm(film);

        modelSetFilmCountry(filmId, countryId);
        modelSetShowtimesForFilm(filmId, showtimes);

        const genreIds = [];
        for (const genre of formValues.genres) {
            let gId = modelFindGenreIdByName(genre);
            if (!gId) {
                gId = modelInsertGenre(genre);
            }
            genreIds.push(gId);
        }

        modelSetFilmGenres(filmId, genreIds);

        return new Response(null, { status: 201 });
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Films:", error);
        throw new Error("Film konnte nicht hinzugefügt werden.");
    }
};

/**
 * Aktualisiert die Details eines Films.
 *
 * @param {number} id - Die eindeutige ID des Films, der aktualisiert werden soll.
 * @param {Request} req - Die eingehende Anfrage mit den aktualisierten Formulardaten des Films.
 * @returns {Response} Antwortstatus mit entsprechenden Informationen.
 */
export const updateFilm = async (id, req) => {
    try {
        const formData = await req.formData();
        const { errors, hasErrors } = validateFilmData(formData);
        const formValues = extractFilmFormData(formData);

        if (hasErrors) {
            console.log("Validierungsfehler:", errors);
            return new Response(render("edit.html", { errors, formValues }), {
                status: 400,
                headers: { "Content-Type": "text/html" },
            });
        }

        const existingFilm = modelGetFilmById(id);
        if (!existingFilm) {
            console.error(`Film mit ID ${id} nicht gefunden.`);
            return new Response("Film nicht gefunden", { status: 404 });
        }

        const showtimes = extractShowtimes(formValues);
        await uploadFiles(formData, formValues, existingFilm);

        let directorId = modelFindDirectorIdByName(formValues.director);
        if (!directorId) {
            directorId = modelInsertDirector(formValues.director);
        }

        let countryId = modelFindCountryIdByName(formValues.production_country);
        if (!countryId) {
            countryId = modelInsertCountry(formValues.production_country);
        }

        const genreIds = [];
        for (const genre of formValues.genres) {
            let gId = modelFindGenreIdByName(genre);
            if (!gId) {
                gId = modelInsertGenre(genre);
            }
            genreIds.push(gId);
        }

        const film = buildFilmObject(formValues, directorId, countryId);
        await modelUpdateFilm(id, { film, showtimes, genreIds });

        return new Response(null, { status: 200 });
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Films:", error);
        throw new Error("Film konnte nicht aktualisiert werden.");
    }
};

/**
 * Löscht einen Film aus der Datenbank.
 *
 * @param {number} id - Die eindeutige ID des Films, der gelöscht werden soll.
 * @returns {Response} Antwortstatus mit Erfolgs- oder Fehlermeldung.
 */
export const deleteFilm = async (id) => {
    try {
        const filmExists = await modelGetFilmById(id);
        if (!filmExists) {
            console.warn(`Film mit ID ${id} nicht gefunden.`);
            return new Response("Film nicht gefunden", { status: 404 });
        }

        await modelDeleteFilm(id);
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error(`Fehler beim Löschen des Films mit ID ${id}:`, error);
        throw new Error("Film konnte nicht gelöscht werden.");
    }
};

/**
 * Holt eine Übersicht über Filme, die in den nächsten 5 Tagen gezeigt werden.
 *
 * @returns {Object} Ein Objekt, das das Programm und die entsprechenden Daten enthält.
 */
export const getProgramOverview = async () => {
    const heute = new Date();
    const daten = [];

    for (let i = 0; i < 5; i++) {
        const datum = new Date(heute);
        datum.setDate(heute.getDate() + i);
        daten.push({
            date: datum.toISOString().split("T")[0],
            day: datum.getDate().toString().padStart(2, "0"),
            weekday: datum.toLocaleDateString("de-DE", { weekday: "short" })
                .toUpperCase(),
        });
    }

    try {
        const filme = await modelGetUpcomingFilms(daten[0].date, daten[4].date);

        const programm = daten.reduce((acc, tag) => {
            acc[tag.date] = [];
            return acc;
        }, {});

        for (const film of filme) {
            const filmDatum = film[7];
            if (programm[filmDatum]) {
                const allShowtimes = modelGetShowtimesForFilm(film[0]);
                const filteredShowtimes = allShowtimes.filter(
                    (showtime) => showtime.date === filmDatum,
                );

                programm[filmDatum].push({
                    id: film[0],
                    title: film[1],
                    duration: film[2],
                    rating: film[3],
                    poster: film[4],
                    genres: film[5] ? film[5].split(",") : [],
                    show_times: film[6] ? film[6].split(",") : [],
                    showtimeWithDetails: filteredShowtimes,
                });
            }
        }

        return { programm, daten };
    } catch (error) {
        console.error("Fehler beim Abrufen der Programmübersicht:", error);
        throw new Error("Programmübersicht konnte nicht abgerufen werden.");
    }
};

/**
 * Holt Filme für ein bestimmtes Datum.
 *
 * @param {string} datum - Das Datum, für das Filme abgerufen werden sollen.
 * @returns {Array} Filme für das angegebene Datum.
 */
export const getFilmsByDate = async (datum) => {
    try {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
            throw new Error("Ungültiges Datumsformat. Erwartet: JJJJ-MM-TT.");
        }

        const filme = await modelGetUpcomingFilms(datum, datum);

        return filme.map((film) => ({
            id: film[0],
            titel: film[1],
            dauer: film[2],
            bewertung: film[3],
            poster: film[4],
            genres: film[5] ? film[5].split(",") : [],
            vorfuehrzeiten: film[6] ? film[6].split(",") : [],
            vorfuehrdatum: extractDayAndWeekday(film[7]),
        }));
    } catch (error) {
        console.error(
            `Fehler beim Abrufen der Filme für das Datum ${datum}:`,
            error,
        );
        throw new Error(
            `Filme für das Datum ${datum} konnten nicht abgerufen werden.`,
        );
    }
};

/**
 * Holt eine Liste kommender Filme, die außerhalb der nächsten 5 Tage gezeigt werden.
 *
 * @returns {Array} Kommende Filme.
 */
export const getComingFilms = async () => {
    try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 6);

        const exclusionStartDate = today;
        const exclusionEndDate = new Date(today);
        exclusionEndDate.setDate(today.getDate() + 5);

        const startDateISO = startDate.toISOString().split("T")[0];
        const exclusionStartDateISO =
            exclusionStartDate.toISOString().split("T")[0];
        const exclusionEndDateISO =
            exclusionEndDate.toISOString().split("T")[0];

        console.log("Startdatum (Demnächst):", startDateISO);
        console.log(
            "Ausschlusszeitraum:",
            exclusionStartDateISO,
            "-",
            exclusionEndDateISO,
        );

        const data = await modelGetComingSoonFilms(
            startDateISO,
            exclusionStartDateISO,
            exclusionEndDateISO,
        );

        return data.map((row) => ({
            id: row[0],
            title: row[1],
            duration: row[2],
            rating: row[3],
            poster: row[4],
            genres: row[5] ? row[5].split(",") : [],
            show_times: row[6] ? row[6].split(",") : [],
            show_date: row[7],
        }));
    } catch (error) {
        console.error("Fehler beim Abrufen der kommenden Filme:", error);
        throw new Error("Kommende Filme konnten nicht abgerufen werden.");
    }
};

export const addHighlight = async (req) => {
    try {
        const formData = await req.formData();
        const description = formData.get("description");

        let image = formData.get("highlight_image");
        if (image instanceof File && image.size > 0) {
            image = await saveFile(image, "uploads/highlight_poster");
        }

        modelInsertHighlight(image, description);
        return new Response(null, { status: 201 });
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Highlights:", error);
        throw new Error("Highlight konnte nicht hinzugefügt werden.");
    }
};

export const getHighlights = async () => {
    try {
        const highlights = await modelGetHighlights();

        return highlights.map((highlight) => ({
            id: highlight[0],
            image: highlight[1],
            description: highlight[2],
        }));
    } catch (error) {
        console.error("Fehler beim Abrufen der Highlights:", error);
        throw new Error("Highlights konnten nicht abgerufen werden.");
    }
};

export const getHighlightById = async (id) => {
    try {
        const highlight = await modelGetHighlightById(id);

        if (!highlight) {
            console.warn(`Highlight mit ID ${id} nicht gefunden.`);
            return null;
        }

        return {
            id: highlight[0],
            image: highlight[1],
            description: highlight[2],
        };
    } catch (error) {
        console.error("Fehler beim Abrufen des Highlights:", error);
        throw new Error("Highlight konnte nicht abgerufen werden.");
    }
};

export const updateHighlight = async (id, req) => {
    try {
        const formData = await req.formData();
        const description = formData.get("description");

        let image = formData.get("highlight_image");
        if (image instanceof File && image.size > 0) {
            image = await saveFile(image, "uploads/highlight_poster");
        } else {
            const existingHighlight = modelGetHighlightById(id);
            image = existingHighlight[1];
        }

        modelUpdateHighlight(image, description, id);
        return new Response(null, { status: 200 });
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Highlights:", error);
        throw new Error("Highlight konnte nicht aktualisiert werden.");
    }
};

export const deleteHighlight = (id) => {
    try {
        const existingHighlight = getHighlightById(id);

        if (!existingHighlight) {
            console.warn(`Highlight mit ID ${id} nicht gefunden.`);
            return new Response("Highlight nicht gefunden", { status: 404 });
        }

        modelDeleteHighlight(id);

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error(
            `Fehler beim Löschen des Highlights mit ID ${id}:`,
            error,
        );
        throw new Error("Highlight konnte nicht gelöscht werden.");
    }
};
