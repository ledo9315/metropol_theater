import { render } from "../services/render.js";
import { createResponse } from "../utils/response.js";

export function renderPage(templateName, status) {
    try {
        const pageContent = render(templateName);
        return createResponse(pageContent, status, "text/html");
    } catch (error) {
        console.error(`Fehler beim Rendern der Seite ${templateName}:`, error);
        return createResponse("Interner Serverfehler", 500, "text/plain");
    }
}

export const renderHomePage = async () => renderPage("index.html", 200);
export const renderAboutPage = async () => renderPage("about.html", 200);
export const renderPricesPage = async () => renderPage("prices.html", 200);
export const renderContactPage = async () => renderPage("contact.html", 200);
export const renderChroniclePage = async () =>
    renderPage("chronicle.html", 200);
