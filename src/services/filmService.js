import * as filmModel from "../models/filmModel.js";
import * as showtimeModel from "../models/showtimeModel.js";
import * as genreModel from "../models/genresModel.js";
import * as countryModel from "../models/countryModel.js";
import * as directorModel from "../models/directorModel.js";

import {
    buildFilmObject,
    extractFilmFormData,
    extractShowtimes,
    uploadFiles,
} from "../utils/filmUtils.js";

import {
    formatDateToGermanLocale,
    formatDateWithWeekday,
    groupAndSortShowtimes,
} from "../utils/formatDate.js";

import { validateFilmData } from "../utils/validators.js";
import { render } from "../services/render.js";

/**
 * Ruft alle Filme und deren Details ab.
 *
 * @returns {Array} Array mit den Filmdetails, einschließlich Spielzeiten und zugehöriger Metadaten.
 */
export const index = async () => {
    try {
        const data = await filmModel.index();

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
export const show = async (id) => {
    try {
        let film = filmModel.show(id);

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

        const showtimes = showtimeModel.show(id);

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
export const add = async (req) => {
    try {
        const formData = await req.formData();

        const formValues = extractFilmFormData(formData);
        const { errors, hasErrors } = validateFilmData(formValues);

        if (hasErrors) {
            console.log("Validierungsfehler:", errors);
            return new Response(render("add.html", { errors, formValues }), {
                status: 400,
                headers: { "Content-Type": "text/html" },
            });
        }

        const showtimes = extractShowtimes(formValues);
        await uploadFiles(formData, formValues);

        let directorId = directorModel.show(formValues.director);
        if (!directorId) {
            directorId = directorModel.add(formValues.director);
        }

        let countryId = countryModel.show(formValues.production_country);
        if (!countryId) {
            countryId = countryModel.add(formValues.production_country);
        }

        const film = buildFilmObject(formValues, directorId, countryId);
        const filmId = await filmModel.add(film);

        countryModel.update(filmId, countryId);
        showtimeModel.update(filmId, showtimes);

        const genreIds = [];
        for (const genre of formValues.genres) {
            let gId = genreModel.show(genre);
            if (!gId) {
                gId = genreModel.add(genre);
            }
            genreIds.push(gId);
        }

        genreModel.update(filmId, genreIds);

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
export const update = async (id, req) => {
    try {
        const formData = await req.formData();
        const formValues = extractFilmFormData(formData);
        const { errors, hasErrors } = validateFilmData(formValues);

        const files = await filmModel.showFiles(id);

        const fileObject = {
            poster: files[0],
            trailer: files[1],
            trailer_poster: files[2],
        };

        console.log("files", files);

        if (hasErrors) {
            console.log("Validierungsfehler:", errors);
            formValues.id = id;
            return new Response(
                render("edit.html", { errors, formValues, fileObject }),
                {
                    status: 400,
                    headers: { "Content-Type": "text/html" },
                },
            );
        }

        const existingFilm = filmModel.show(id);
        if (!existingFilm) {
            console.error(`Film mit ID ${id} nicht gefunden.`);
            return new Response("Film nicht gefunden", { status: 404 });
        }

        const showtimes = extractShowtimes(formValues);
        await uploadFiles(formData, formValues, existingFilm);

        let directorId = directorModel.show(formValues.director);
        if (!directorId) {
            directorId = directorModel.add(formValues.director);
        }

        let countryId = countryModel.show(formValues.production_country);
        if (!countryId) {
            countryId = countryModel.add(formValues.production_country);
        }

        const genreIds = [];
        for (const genre of formValues.genres) {
            let gId = genreModel.show(genre);
            if (!gId) {
                gId = genreModel.add(genre);
            }
            genreIds.push(gId);
        }

        const film = buildFilmObject(formValues, directorId, countryId);

        await filmModel.update(id, { film, showtimes, genreIds });

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
export const destroy = async (id) => {
    try {
        const filmExists = await filmModel.show(id);
        if (!filmExists) {
            console.warn(`Film mit ID ${id} nicht gefunden.`);
            return new Response("Film nicht gefunden", { status: 404 });
        }

        await filmModel.destroy(id);
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error(`Fehler beim Löschen des Films mit ID ${id}:`, error);
        throw new Error("Film konnte nicht gelöscht werden.");
    }
};
