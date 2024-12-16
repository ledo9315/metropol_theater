import * as filmService from "../services/filmService.js";
import { getProgramOverview } from "../services/filmService.js";
import { render } from "../services/render.js";
import { createResponse } from "../utils/response.js";

/**
 * Zeigt das Dashboard mit allen Filmen und Highlights.
 *
 * @returns {Promise<Response>} Eine HTML-Antwort mit dem Dashboard.
 */
export const index = async () => {
  const films = await filmService.getAllFilms();
  const highlights = await filmService.getHighlights();

  try {
    return createResponse(render("dashboard.html", { films, highlights }));
  } catch (error) {
    console.error("Fehler beim Abrufen der Filme:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

/**
 * Zeigt die Details eines Films.
 *
 * @param {Object} _ - Der Request-Parameter (nicht genutzt).
 * @param {Object} params - Die URL-Parameter mit der Film-ID.
 * @returns {Promise<Response>} Eine HTML-Antwort mit den Filmdetails.
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
 * Zeigt das Formular zum Hinzufügen eines neuen Films an.
 *
 * @returns {Response} Eine HTML-Antwort mit dem Formular.
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
 * Erstellt einen neuen Film basierend auf der Anfrage.
 *
 * @param {Request} req - Die eingehende Anfrage mit den Filmdaten.
 * @returns {Promise<Response>} Eine Weiterleitung zur Dashboard-Seite oder ein Validierungsfehler.
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
 * Zeigt das Formular zum Bearbeiten eines Films an.
 *
 * @param {Object} _ - Der Request-Parameter (nicht genutzt).
 * @param {Object} params - Die URL-Parameter mit der Film-ID.
 * @returns {Promise<Response>} Eine HTML-Antwort mit dem Bearbeitungsformular.
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
 * Aktualisiert einen bestehenden Film.
 *
 * @param {Request} req - Die eingehende Anfrage mit aktualisierten Filmdaten.
 * @param {Object} params - Die URL-Parameter mit der Film-ID.
 * @returns {Promise<Response>} Eine Weiterleitung zur Dashboard-Seite oder ein Validierungsfehler.
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
 * Zeigt das Formular zum Löschen eines Films an.
 * @param {Object} _ - Der Request-Parameter (nicht genutzt).
 * @param {Object} params - Die URL-Parameter mit der Film-ID.
 * @returns {Promise<Response>} Eine HTML-Antwort mit dem Löschformular.
 */
export const remove = async (_, params) => {
  try {
    const { id } = params.pathname.groups;

    return createResponse(render("remove.html", { id }));
  } catch (error) {
    console.error("Fehler beim Laden des Films für das Entfernen:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

/**
 * Löscht einen Film.
 *
 * @param {Object} _ - Der Request-Parameter (nicht genutzt).
 * @param {Object} params - Die URL-Parameter mit der Film-ID.
 * @returns {Promise<Response>} Eine Weiterleitung zur Dashboard-Seite.
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
    const highliglights = await filmService.getHighlights();

    console.log("Coming Films:", comingFilms);

    return new Response(
      render("index.html", {
        programm,
        daten,
        films: comingFilms,
        highlights: highliglights[0],
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
