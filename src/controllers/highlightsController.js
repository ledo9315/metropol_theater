import * as highlightsService from "../services/highlightsService.js";
import { render } from "../services/render.js";
import { createResponse } from "../utils/response.js";

/**
 * Erstellt ein neues Highlight basierend auf der eingereichten Anfrage.
 * @param {Request} req - Die eingehende Anfrage mit Highlight-Daten.
 * @returns {Promise<Response>} Eine Weiterleitung zur Dashboard-Seite.
 */
export const create = async (req) => {
    try {
        const response = await highlightsService.add(req);

        if (response.status === 400) {
            // Validierungsfehler: HTML-Response zurückgeben
            console.log("Validierungsfehler erkannt, Seite neu rendern");
            return response;
        }

        return new Response(null, {
            status: 302,
            headers: { Location: "/dashboard?section=highlights-section" },
        });
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Highlights:", error);
        return new Response("Interner Serverfehler", { status: 500 });
    }
};

/**
 * Zeigt das Formular zum Hinzufügen eines neuen Highlights an.
 * @returns {Response} Eine HTML-Antwort mit dem Formular.
 */
export const add = () => {
    try {
        return createResponse(render("add_highlight.html"));
    } catch (error) {
        console.error("Fehler beim Anzeigen des Formulars:", error);
        return new Response("Interner Serverfehler", { status: 500 });
    }
};

/**
 * Zeigt das Formular zum Bearbeiten eines bestehenden Highlights an.
 * @param {Object} _ - Der Request-Parameter (nicht genutzt).
 * @param {Object} params - Die URL-Parameter mit der Highlight-ID.
 * @returns {Promise<Response>} Eine HTML-Antwort mit dem Bearbeitungsformular.
 */
export const edit = async (_, params) => {
    try {
        const { id } = params.pathname.groups;
        const data = await highlightsService.show(id);
        if (!data) {
            return new Response("Highlight nicht gefunden", { status: 404 });
        }

        return createResponse(
            render("edit_highlight.html", { highlight: data }),
        );
    } catch (error) {
        console.error("Fehler beim Bearbeiten des Highlights:", error);
        return new Response("Interner Serverfehler", { status: 500 });
    }
};

/**
 * Aktualisiert ein bestehendes Highlight basierend auf der eingereichten Anfrage.
 * @param {Request} req - Die eingehende Anfrage mit aktualisierten Highlight-Daten.
 * @param {Object} params - Die URL-Parameter mit der Highlight-ID.
 * @returns {Promise<Response>} Eine Weiterleitung zur Dashboard-Seite.
 */
export const update = async (req, params) => {
    try {
        const { id } = params.pathname.groups;
        const response = await highlightsService.update(id, req);
        if (response.status === 400) return response;

        return new Response(null, {
            status: 302,
            headers: { Location: "/dashboard?section=highlights-section" },
        });
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Highlights:", error);
        return new Response("Interner Serverfehler", { status: 500 });
    }
};

/**
 * Zeigt das Formular zum Entfernen eines bestehenden Highlights an.
 *
 * @param {Object} _ - Der Request-Parameter (nicht genutzt).
 * @param {Object} params - Die URL-Parameter mit der Highlight-ID.
 * @returns {Promise<Response>} Eine HTML-Antwort mit dem Entfernungsformular.
 */
export const remove = async (_, params) => {
    try {
        const { id } = params.pathname.groups;

        return createResponse(render("remove_highlight.html", { id }));
    } catch (error) {
        console.error(
            "Fehler beim Laden des Highlights für das Entfernen:",
            error,
        );
        return new Response("Interner Serverfehler", { status: 500 });
    }
};

/**
 * Löscht ein Highlight basierend auf der übergebenen ID.
 * @param {Object} _ - Der Request-Parameter (nicht genutzt).
 * @param {Object} params - Die URL-Parameter mit der Highlight-ID.
 * @returns {Promise<Response>} Eine Weiterleitung zur Dashboard-Seite.
 */
export const destroy = async (_, params) => {
    try {
        const { id } = params.pathname.groups;
        await highlightsService.destroy(id);

        return new Response(null, {
            status: 302,
            headers: { Location: "/dashboard?section=highlights-section" },
        });
    } catch (error) {
        console.error("Fehler beim Löschen des Highlights:", error);
        return new Response("Interner Serverfehler", { status: 500 });
    }
};

export const toggleVisible = async (req, params) => {
    try {
        const { id } = params.pathname.groups;
        await highlightsService.toggleVisible(id, req);

        return new Response(null, {
            status: 302,
            headers: { Location: "/dashboard?section=highlights-section" },
        });
    } catch (error) {
        console.error(
            "Fehler beim Umschalten der Sichtbarkeit des Highlights:",
            error,
        );
        return new Response("Interner Serverfehler", { status: 500 });
    }
};
