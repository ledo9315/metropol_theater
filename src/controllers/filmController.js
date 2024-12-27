import * as filmService from "../services/filmService.js";
import { render } from "../services/render.js";
import { createResponse } from "../utils/response.js";

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
    const data = await filmService.show(id);

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
    const response = await filmService.add(req);

    if (response.status === 400) {
      // Validierungsfehler: HTML-Response zurückgeben
      console.log("Validierungsfehler erkannt, Seite neu rendern");
      return response;
    }

    console.log("Film erfolgreich verarbeitet");
    return new Response(null, {
      status: 302,
      headers: { Location: "/dashboard?section=movies-section" },
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
    const data = await filmService.show(id);

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
    const response = await filmService.update(id, req);

    if (response.status === 400) {
      console.log("Validierungsfehler erkannt, Seite neu rendern");
      return response;
    }

    return new Response(null, {
      status: 302,
      headers: { Location: "/dashboard?section=movies-section" },
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
    await filmService.destroy(id);

    return new Response(null, {
      status: 302,
      headers: { Location: "/dashboard?section=movies-section" },
    });
  } catch (error) {
    console.error("Fehler beim Löschen des Films:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};
