import { renderPage } from "../utils/renderHelper.js";

export const renderAboutPage = async () => renderPage("about.html", 200);
export const renderPricesPage = async () => renderPage("prices.html", 200);
export const renderContactPage = async () => renderPage("contact.html", 200);
export const renderChroniclePage = async () =>
    renderPage("chronicle.html", 200);
