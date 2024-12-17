import router from "./router.js";
import { serveStatic } from "./services/serveStatic.js";
import * as path from "https://deno.land/std@0.203.0/path/mod.ts";

const baseDir = path.resolve("./public");

export default async function handleRequest(req) {
  try {
    const staticResponse = await serveStatic(req, baseDir);
    if (staticResponse && staticResponse.status === 200) {
      return staticResponse;
    }

    return await router(req);
  } catch (error) {
    console.error("Fehler bei der Anfrageverarbeitung:", error);
    return new Response("Interner Serverfehler", { status: 500 });
  }
}
