import {
    addFilmToDB,
    deleteFilmFromDB,
    getAllFilmsFromDB,
    getComingSoonFilmsFromDB,
    getFilmByIdFromDB,
    getShowtimesWithDetails,
    getUpcomingFilms,
    saveCountry,
    saveDirectorToDB,
    saveFilmCountry,
    saveFilmGenres,
    saveGenreToDB,
    saveShowtimesWithDetails,
    updateFilmInDB,
} from "../models/filmModel.js";
import {
    formatDate,
    formatDateforProgram,
    formatDateToLocaleString,
    groupShowtimes,
} from "../utils/formatDate.js";
import { saveFile } from "../utils/fileUtils.js";
import { validateFilmData } from "../utils/validators.js";

// Alle Filme abrufen
export const getAllFilms = async () => {
    const data = await getAllFilmsFromDB();

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
                createdAt: formatDateToLocaleString(row[6]),
                genres: row[7] ? row[7].split(",") : [],
                director: row[8],
                countries: row[9] ? row[9].split(",") : [],
                showtimes: {},
            };
        }

        const date = row[10] ? formatDateToLocaleString(row[10]) : null;
        const time = row[11];
        const isOriginalVersion = !!row[12];
        const is3D = !!row[13];

        if (!films[filmId].showtimes[date]) {
            films[filmId].showtimes[date] = [];
        }

        films[filmId].showtimes[date].push({
            time,
            isOriginalVersion,
            is3D,
        });
    });

    const dataArr = Object.values(films);

    return dataArr;
};

// Einen Film und seine Spielzeiten abrufen
export const getFilmById = async (id) => {
    let film = getFilmByIdFromDB(id);

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

    const showtimes = getShowtimesWithDetails(id);

    const formattedShowtimes = showtimes.map((row) => ({
        date: formatDate(row.date),
        time: row.time,
        isOriginalVersion: row.isOriginalVersion,
        is3D: row.is3D,
    }));

    const groupedShowtimes = groupShowtimes(formattedShowtimes);

    return { film, showtimes, groupedShowtimes };
};

// Einen neuen Film hinzufügen
export const addFilm = async (req) => {
    const formData = await req.formData();

    // Validierung der Formulardaten
    const { errors, hasErrors } = validateFilmData(formData);

    // Formulardaten extrahieren
    const formValues = extractFilmFormData(formData);

    if (hasErrors) {
        console.log("Validierungsfehler:", errors);
        return new Response(render("add.html", { errors, formValues }), {
            status: 400,
            headers: { "Content-Type": "text/html" },
        });
    }

    // Spielzeiten extrahieren
    const showtimes = extractShowtimes(formValues);

    // Dateien hochladen
    await uploadFiles(formData, formValues);

    // Regisseur und Produktionsland speichern
    const directorId = saveDirectorToDB(formValues.director);
    const countryId = saveCountry(formValues.production_country);

    // Film-Objekt erstellen
    const film = buildFilmObject(formValues, directorId, countryId);

    // Film hinzufügen und verknüpfte Daten speichern
    const filmId = await addFilmToDB(film);
    saveFilmCountry(filmId, countryId);
    saveShowtimesWithDetails(filmId, showtimes);

    const genreIds = formValues.genres.map((genre) => saveGenreToDB(genre));
    saveFilmGenres(filmId, genreIds);

    return new Response(null, { status: 201 });
};

// Film aktualisieren
export const updateFilm = async (id, req) => {
    const formData = await req.formData();

    // Validierung und Extraktion der Formulardaten
    const { errors, hasErrors } = validateFilmData(formData);
    const formValues = extractFilmFormData(formData);

    if (hasErrors) {
        console.log("Validierungsfehler:", errors);
        return new Response(render("edit.html", { errors, formValues }), {
            status: 400,
            headers: { "Content-Type": "text/html" },
        });
    }

    // Existierenden Film abrufen
    const existingFilm = getFilmByIdFromDB(id);

    if (!existingFilm) {
        console.error(`Film mit ID ${id} nicht gefunden.`);
        return new Response("Film nicht gefunden", { status: 404 });
    }

    // Debugging-Log
    console.log("Vorhandener Film:", existingFilm);

    // Spielzeiten extrahieren
    const showtimes = extractShowtimes(formValues);

    // Dateien hochladen und bestehende Werte übernehmen
    await uploadFiles(formData, formValues, existingFilm);

    // Regisseur, Produktionsland und Genres speichern
    const directorId = saveDirectorToDB(formValues.director);
    const countryId = saveCountry(formValues.production_country);
    const genreIds = formValues.genres.map((genre) => saveGenreToDB(genre));

    // Debugging-Log
    console.log("FormValues nach Upload:", formValues);

    // Film-Objekt erstellen
    const film = buildFilmObject(formValues, directorId, countryId);

    // Film in der Datenbank aktualisieren
    await updateFilmInDB(id, { film, showtimes, genreIds });

    return new Response(null, { status: 200 });
};

// Film löschen
export const deleteFilm = async (id) => {
    // Film löschen
    deleteFilmFromDB(id);
};

// service.js
/**
 * Holt eine Übersicht über Filme, die in den nächsten 5 Tagen gezeigt werden.
 *
 * @returns {Object} Ein Objekt, das das Programm und die entsprechenden Daten enthält.
 */
export const getProgramOverview = async () => {
    // Initialisiere das heutige Datum und erstelle einen 5-Tage-Bereich
    const heute = new Date();
    const daten = [];

    for (let i = 0; i < 5; i++) {
        const datum = new Date(heute);
        datum.setDate(heute.getDate() + i);
        daten.push(datum.toISOString().split("T")[0]);
    }

    try {
        // Hole kommende Filme aus der Datenbank
        const filme = await getUpcomingFilms(daten[0], daten[4]);

        // Erstelle das Programm-Objekt und initialisiere jedes Datum mit einem leeren Array
        const programm = daten.reduce((acc, datum) => {
            acc[datum] = [];
            return acc;
        }, {});

        // Fülle das Programm mit Filmen, gruppiert nach Datum
        filme.forEach((film) => {
            const filmDatum = film[7];
            if (programm[filmDatum]) {
                programm[filmDatum].push({
                    id: film[0],
                    titel: film[1],
                    dauer: film[2],
                    bewertung: film[3],
                    poster: film[4],
                    genres: film[5] ? film[5].split(",") : [],
                    vorfuehrzeiten: film[6] ? film[6].split(",") : [],
                    vorfuehrdatum: formatDateforProgram(film[7]),
                });
            }
        });

        console.log("Programmübersicht:", programm);
        console.log("Daten:", daten);

        return { programm, daten };
    } catch (fehler) {
        console.error("Fehler beim Abrufen der Programmübersicht:", fehler);
        throw new Error("Programmübersicht konnte nicht abgerufen werden.");
    }
};

/**
 * Holt Filme für ein bestimmtes Datum.
 *
 * @param {string} datum - Das Datum, für das Filme abgerufen werden sollen (Format: JJJJ-MM-TT).
 * @returns {Array} Ein Array von Filmen, die für das angegebene Datum geplant sind.
 */
export const getFilmsByDate = async (datum) => {
    try {
        // Validierung des Datumsformats
        if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
            throw new Error("Ungültiges Datumsformat. Erwartet: JJJJ-MM-TT.");
        }

        // Hole Filme für das angegebene Datum
        const filme = await getUpcomingFilms(datum, datum);

        return filme.map((film) => ({
            id: film[0],
            titel: film[1],
            dauer: film[2],
            bewertung: film[3],
            poster: film[4],
            genres: film[5] ? film[5].split(",") : [],
            vorfuehrzeiten: film[6] ? film[6].split(",") : [],
            vorfuehrdatum: formatDateforProgram(film[7]),
        }));
    } catch (fehler) {
        console.error(
            `Fehler beim Abrufen der Filme für das Datum ${datum}:`,
            fehler,
        );
        throw new Error(
            `Filme für das Datum ${datum} konnten nicht abgerufen werden.`,
        );
    }
};

export const getComingFilms = async () => {
    const today = new Date();

    // Startdatum: Heute + 6 Tage
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 6);

    // Ausschlusszeitraum: Heute bis Heute + 5 Tage
    const exclusionStartDate = today;
    const exclusionEndDate = new Date(today);
    exclusionEndDate.setDate(today.getDate() + 5);

    const startDateISO = startDate.toISOString().split("T")[0];
    const exclusionStartDateISO =
        exclusionStartDate.toISOString().split("T")[0];
    const exclusionEndDateISO = exclusionEndDate.toISOString().split("T")[0];

    console.log("Startdatum (Demnächst):", startDateISO);
    console.log(
        "Ausschlusszeitraum:",
        exclusionStartDateISO,
        "-",
        exclusionEndDateISO,
    );

    // Abruf aus der Datenbank
    const data = await getComingSoonFilmsFromDB(
        startDateISO,
        exclusionStartDateISO,
        exclusionEndDateISO,
    );

    // Mapping der Ergebnisse
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
};

// Hilfsfunktionen

const extractFilmFormData = (formData) => ({
    title: formData.get("title"),
    duration: formData.get("duration"),
    production_country: formData.get("production_country"),
    production_year: formData.get("production_year"),
    fsk: formData.get("fsk"),
    description: formData.get("description"),
    producer: formData.get("producer"),
    director: formData.get("director"),
    genres: formData.getAll("genres"),
    show_dates: formData.getAll("show_date[]"),
    show_times: formData.getAll("show_time[]"),
    is_original_versions: formData.getAll("is_original_version[]"),
    is_3ds: formData.getAll("is_3d[]"),
});

const extractShowtimes = (formValues) =>
    formValues.show_dates.map((date, index) => ({
        date,
        time: formValues.show_times[index],
        isOriginalVersion: formValues.is_original_versions[index] === "1",
        is3D: formValues.is_3ds[index] === "1",
    }));

const uploadFiles = async (formData, formValues, existingFilm) => {
    // Poster
    const poster = formData.get("poster");
    if (poster instanceof File && poster.size > 0) {
        formValues.poster = await saveFile(poster, "uploads/posters");
    } else {
        formValues.poster = existingFilm[6]; // Vorhandenes Poster übernehmen
    }

    // Trailer
    const trailer = formData.get("trailer");
    if (trailer instanceof File && trailer.size > 0) {
        formValues.trailer = await saveFile(trailer, "uploads/trailers");
    } else {
        console.log("Vorhandener Trailer:", existingFilm[7]);
        formValues.trailer = existingFilm[7]; // Vorhandenes Trailer übernehmen
    }

    // Trailer Poster
    const trailerPoster = formData.get("trailer_poster");
    if (trailerPoster instanceof File && trailerPoster.size > 0) {
        formValues.trailer_poster = await saveFile(
            trailerPoster,
            "uploads/posters",
        );
    } else {
        formValues.trailer_poster = existingFilm[8]; // Vorhandenes Trailer-Poster übernehmen
    }

    // Debugging-Log
    console.log("Hochgeladene Dateien:", {
        poster: formValues.poster,
        trailer: formValues.trailer,
        trailer_poster: formValues.trailer_poster,
    });
};

const buildFilmObject = (formValues, directorId, countryId) => ({
    title: formValues.title,
    duration: parseInt(formValues.duration, 10),
    production_year: parseInt(formValues.production_year, 10),
    rating: formValues.fsk,
    description: formValues.description,
    poster: formValues.poster,
    trailer: formValues.trailer,
    trailer_poster: formValues.trailer_poster,
    producer: formValues.producer,
    createdAt: new Date(),
    director_id: directorId,
    country_id: countryId,
});
