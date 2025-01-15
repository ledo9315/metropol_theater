import { render } from "../services/render.js";
import { createResponse } from "../utils/response.js";
import * as filmService from "../services/filmService.js";
import * as highlightsService from "../services/highlightsService.js";
import * as schedulingService from "../services/schedulingService.js";

/**
 * Zeigt das Dashboard mit allen Filmen und Highlights.
 *
 * @returns {Promise<Response>} Eine HTML-Antwort mit dem Dashboard.
 */
export const index = async () => {
    const films = await filmService.index();
    const highlights = await highlightsService.index();

    console.log("Filme:", films);

    try {
        return createResponse(render("dashboard.html", { films, highlights }));
    } catch (error) {
        console.error("Fehler beim Abrufen der Filme:", error);
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
        const { programm, daten } = await schedulingService
            .getProgramOverview();
        const comingFilms = await schedulingService.getComingFilms();
        const highliglights = await highlightsService.index();

        console.log("Coming Films:", comingFilms);
        console.log("Programm:", programm);

        return new Response(
            render("index.html", {
                programm,
                daten,
                films: comingFilms,
                highlights: highliglights,
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
