import router from "./router.js";
import { render } from "./services/render.js";
import { serveStatic } from "./services/serveStatic.js";
import { createResponse } from "./utils/response.js";

const baseDir = "./public";

export default async function handleRequest(req) {
  try {
    // Versuche, eine statische Datei auszuliefern
    const staticResponse = await serveStatic(req, baseDir);
    if (staticResponse && staticResponse.status === 200) {
      return staticResponse;
    }

    // Wenn keine statische Datei gefunden, Router verwenden
    const routedResponse = await router(req);
    if (routedResponse) {
      return routedResponse;
    }

    // Keine Route gefunden
    return createResponse(render("error404.html"), 404);
  } catch (error) {
    console.error("Fehler bei der Anfrageverarbeitung:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
}
