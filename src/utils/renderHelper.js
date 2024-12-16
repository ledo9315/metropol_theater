import { render } from "../services/render.js";
import { createResponse } from "./response.js";

/**
 * Rendert eine statische Seite basierend auf einem Template.
 * @param {string} templateName - Der Name des Templates, das gerendert werden soll.
 * @param {number} status - Der HTTP-Statuscode der Antwort.
 * @returns {Response} Die gerenderte Seite als HTML-Antwort.
 */
export function renderPage(templateName, status) {
    try {
        const pageContent = render(templateName);
        return createResponse(pageContent, status, "text/html");
    } catch (error) {
        console.error(`Fehler beim Rendern der Seite ${templateName}:`, error);
        return createResponse("Interner Serverfehler", 500, "text/plain");
    }
}
