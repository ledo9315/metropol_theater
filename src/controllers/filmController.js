import * as filmService from "../services/filmService.js";
import { render } from "../services/render.js";
import { createResponse } from "../utils/response.js";

// Alle Filme anzeigen (GET)
export const index = async () => {
  const films = await filmService.getAllFilms();

  console.log("Filme aus index:", films);

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
 * Zeigt die Startseite mit den aktuellen Programmdaten an.
 *
 * @returns {Response} Eine gerenderte HTML-Seite oder ein Fehler, wenn etwas schiefgeht.
 */
export const homePage = async () => {
  try {
    const data = await filmService.getComingFilms();
    console.log("Daten für Startseite:", data);
    return createResponse(render("index.html", { films: data }));
  } catch (fehler) {
    console.error("Fehler beim Anzeigen der Startseite:", fehler);
    return new Response("Interner Serverfehler", { status: 500 });
  }
};

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

export const getProgramOverview = async () => {
  try {
    const { programm, daten } = await filmService.getProgramOverview();

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
