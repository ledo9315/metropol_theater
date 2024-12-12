import nunjucks from "npm:nunjucks@3.2.4";

// Nunjucks-Konfiguration
nunjucks.configure("src/templates", {
  autoescape: true,
  noCache: true,
});

/**
 * Rendert ein Template mit Nunjucks synchron und gibt einen String zurück.
 * @param {string} templateName - Der Name des Templates.
 * @param {Object} [context={}] - Der Kontext für das Template.
 * @returns {string} Der gerenderte Inhalt als String.
 */
export function render(templateName, context = {}) {
  try {
    return nunjucks.render(templateName, context);
  } catch (error) {
    console.error(`Fehler beim Rendern des Templates ${templateName}:`, error);
    throw error;
  }
}
