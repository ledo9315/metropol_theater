import router from "./router.js";
import { serveStatic } from "./services/serveStatic.js";

const baseDir = "./public";

export default async function handleRequest(req) {
  try {
    // Versuche, eine statische Datei auszuliefern
    const staticResponse = await serveStatic(req, baseDir);
    if (staticResponse && staticResponse.status === 200) {
      return staticResponse;
    }

    // Delegiere an den Router
    return await router(req);
  } catch (error) {
    console.error("Fehler bei der Anfrageverarbeitung:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
}
