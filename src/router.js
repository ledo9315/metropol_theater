// router.js
import filmRoutes from "./routes/filmRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";

export default async function router(req) {
  try {
    const url = new URL(req.url);
    console.log(`[${req.method}] ${url.pathname}`); // Logging der Anfrage

    // Kombinierte Routendefinitionen
    const routes = [
      ...filmRoutes,
      ...pageRoutes,
    ];

    // Finde passende Route
    for (const route of routes) {
      if (route.pattern.test(url) && route.method === req.method) {
        const match = route.pattern.exec(url);
        return await route.handler(req, match);
      }
    }

    // 404-Fehler, wenn keine Route passt
    return new Response("Seite nicht gefunden", { status: 404 });
  } catch (error) {
    console.error("Fehler im Router:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
}