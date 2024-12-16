import {
    getComingSoonFilms as modelGetComingSoonFilms,
    getUpcomingFilms as modelGetUpcomingFilms,
} from "../models/schedulingModel.js";

import { show as modelGetShowtimesForFilm } from "../models/showtimeModel.js";

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
            day_month: datum.toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "2-digit",
            }),
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
