import { getUpcomingFilms } from "../models/filmModel.js";
import * as filmService from "../services/filmService.js";
import { getProgramOverview } from "../services/filmService.js";
import { render } from "../services/render.js";
import { createResponse } from "../utils/response.js";

// Alle Filme anzeigen (GET)
export const index = async () => {
  const films = await filmService.getAllFilms();

  try {
    return createResponse(render("dashboard.html", { films }));
  } catch (error) {
    console.error("Fehler beim Abrufen der Filme:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

// Einen bestimmten Film anzeigen (GET)
export const show = async (_, params) => {
  try {
    const { id } = params.pathname.groups;
    const data = await filmService.getFilmById(id);

    console.log("Filmdaten:", data);

    if (!data) {
      return new Response("Film nicht gefunden", { status: 404 });
    }

    return createResponse(
      render("film.html", {
        film: data.film,
        showtimes: data.groupedShowtimes,
      }),
    );
  } catch (error) {
    console.error("Fehler beim Abrufen des Films:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

// Formular anzeigen (GET)
export const add = () => {
  try {
    return createResponse(render("add.html"));
  } catch (error) {
    console.error("Fehler beim Anzeigen des Formulars:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

// Film hinzufügen (POST)
export const create = async (req) => {
  try {
    const response = await filmService.addFilm(req);

    if (response.status === 400) {
      // Validierungsfehler: HTML-Response zurückgeben
      console.log("Validierungsfehler erkannt, Seite neu rendern");
      return response;
    }

    console.log("Film erfolgreich verarbeitet");
    return new Response(null, {
      status: 302,
      headers: { Location: "/dashboard" },
    });
  } catch (error) {
    console.error("Fehler beim Hinzufügen des Films:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

// Film bearbeiten (GET)
export const edit = async (_, params) => {
  try {
    const { id } = params.pathname.groups;
    const data = await filmService.getFilmById(id);

    if (!data) {
      return new Response("Film nicht gefunden", { status: 404 });
    }

    const { film, showtimes } = data;

    return createResponse(
      render("edit.html", { film: film, showtimes: showtimes }),
    );
  } catch (error) {
    console.error("Fehler beim Bearbeiten des Films:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

// Film aktualisieren (POST)
export const update = async (req, params) => {
  try {
    const { id } = params.pathname.groups;
    const response = await filmService.updateFilm(id, req);

    if (response.status === 400) {
      console.log("Validierungsfehler erkannt, Seite neu rendern");
      return response;
    }

    return new Response(null, {
      status: 302,
      headers: { Location: "/dashboard" },
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Films:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

// Film löschen (POST)
export const destroy = async (_, params) => {
  try {
    const { id } = params.pathname.groups;
    await filmService.deleteFilm(id);

    return new Response(null, {
      status: 302,
      headers: { Location: "/dashboard" },
    });
  } catch (error) {
    console.error("Fehler beim Löschen des Films:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

/**
 * Rendert die Startseite mit der Programmübersicht und den kommenden Filmen.
 *
 * @returns {Response} Eine HTML-Antwort mit den gerenderten Daten.
 */
export const homePage = async () => {
  try {
    const { programm, daten } = await getProgramOverview();
    const comingFilms = await filmService.getComingFilms();

    console.log("Coming films:", comingFilms);

    return new Response(
      render("index.html", {
        programm,
        daten,
        films: comingFilms,
      }),
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  } catch (error) {
    console.error("Fehler beim Rendern der Startseite:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

/**
 * API-Endpunkt: Holt Filme für ein bestimmtes Datum.
 *
 * @param {Request} req - Die eingehende Anfrage mit dem Datumsparameter.
 * @returns {Response} Eine JSON-Antwort mit den Filmen für das angegebene Datum.
 */
export const filmsByDate = async (req) => {
  try {
    const url = new URL(req.url);
    const date = url.searchParams.get("date");

    if (!date) {
      return new Response("Fehlender Datumsparameter.", { status: 400 });
    }

    const filme = await getFilmsByDate(date);

    return new Response(JSON.stringify(filme), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Filme für ein Datum:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

/**
 * API-Endpunkt: Holt die Programmübersicht der nächsten 5 Tage.
 *
 * @returns {Response} Eine JSON-Antwort mit den Filmen und den Daten.
 */
export const getProgramOverviewEndpoint = async () => {
  try {
    const { programm, daten } = await getProgramOverview();

    return new Response(
      JSON.stringify({ programm, daten }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Fehler beim Abrufen der Programmübersicht:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};
