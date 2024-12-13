import * as filmService from "../services/filmService.js";
import { getProgramOverview } from "../services/filmService.js";
import { render } from "../services/render.js";
import { createResponse } from "../utils/response.js";

/**
 * Holt die Filme für ein bestimmtes Datum.
 *
 *  @param {string} date - Das Datum, für das die Filme abgerufen werden sollen.
 * @returns {Promise<Array>} Ein Array mit den Filmen für das angegebene Datum.
 */
export const index = async () => {
  const films = await filmService.getAllFilms();

  try {
    return createResponse(render("dashboard.html", { films }));
  } catch (error) {
    console.error("Fehler beim Abrufen der Filme:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

/**
 * Holt die Filme für ein bestimmtes Datum.
 *
 * @param {string} date - Das Datum, für das die Filme abgerufen werden sollen.
 * @returns {Promise<Array>} Ein Array mit den Filmen für das angegebene Datum.
 */
export const show = async (_, params) => {
  try {
    const { id } = params.pathname.groups;
    const data = await filmService.getFilmById(id);

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

/**
 *  Zeigt das Formular zum Hinzufügen eines neuen Films an.
 *
 *  @returns {Response} Eine HTML-Antwort mit dem Formular zum Hinzufügen eines Films.
 */
export const add = () => {
  try {
    return createResponse(render("add.html"));
  } catch (error) {
    console.error("Fehler beim Anzeigen des Formulars:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

/**
 * Erstellt einen neuen Film.
 *
 * @param {Request} req - Die eingehende Anfrage mit den Daten des neuen Films.
 * @returns {Response} Eine Weiterleitung zur Dashboard-Seite oder ein HTML-Response bei Validierungsfehlern.
 */
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

/**
 *  Zeigt das Formular zum Bearbeiten eines Films an.
 *
 * @param {Object} params - Die URL-Parameter mit der ID des zu bearbeitenden Films.
 * @returns {Response} Eine HTML-Antwort mit dem Formular zum Bearbeiten des Films.
 */
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

/**
 * Aktualisiert einen Film.
 *
 * @param {Request} req - Die eingehende Anfrage mit den aktualisierten Daten des Films.
 * @param {Object} params - Die URL-Parameter mit der ID des zu aktualisierenden Films.
 * @returns {Response} Eine Weiterleitung zur Dashboard-Seite oder ein HTML-Response bei Validierungsfehlern.
 */
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

/**
 * Löscht einen Film.
 *
 * @param {Object} params - Die URL-Parameter mit der ID des zu löschenden Films.
 * @returns {Response} Eine Weiterleitung zur Dashboard-Seite.
 */
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

export const createHighlight = async (req) => {
  try {
    const response = await filmService.addHighlight(req);

    // if (response.status === 400) {
    //   console.log("Validierungsfehler erkannt, Seite neu rendern");
    //   return response;
    // }

    return new Response(null, {
      status: 302,
      headers: { Location: "/highlights" },
    });
  } catch (error) {
    console.error("Fehler beim Hinzufügen des Highlights:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

export const indexHighlights = async () => {
  try {
    const highlights = await filmService.getHighlights();

    console.log("Highlights:", highlights);

    return createResponse(render("highlights.html", { highlights }));
  } catch (error) {
    console.error("Fehler beim Abrufen der Highlights:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

export const renderHighlightForm = () => {
  try {
    return createResponse(render("add_highlight.html"));
  } catch (error) {
    console.error(
      "Fehler beim Laden des Formulars zum Hinzufügen von Highlights:",
      error,
    );
    return new Response("Interner Serverfehler", { status: 500 });
  }
};
