import handleRequest from "./src/app.js";
import { initConnection } from "./src/services/db.js";

/**
 * Initialisiert die Datenbankverbindung.
 */
initConnection("./data/cinema.db");

/**
 * Startet den HTTP-Server.
 */
try {
  const port = 8000;
  console.log(`Server wird auf Port ${port} gestartet...`);
  Deno.serve({ port }, handleRequest);
} catch (error) {
  console.error("Fehler beim Starten des Servers:", error);
}
