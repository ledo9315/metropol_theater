import * as path from "https://deno.land/std@0.203.0/path/mod.ts";
import { contentType } from "https://deno.land/std@0.203.0/media_types/mod.ts";

const ALLOWED_FILE_TYPES = {
    images: {
        types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        maxSize: 10 * 1024 * 1024,
    },
    videos: {
        types: ["video/mp4", "video/webm", "video/ogg"],
        maxSize: 20 * 1024 * 1024,
    },
};

/**
 * Validiert Datei-Typ und -Größe.
 * @param {File} file - Die zu prüfende Datei.
 * @returns {string} - Typ der Datei ("image" oder "video").
 */
function validateFile(file) {
    const mimeType = file.type || contentType(path.extname(file.name)) || "";

    for (
        const [category, { types, maxSize }] of Object.entries(
            ALLOWED_FILE_TYPES,
        )
    ) {
        if (types.includes(mimeType)) {
            if (file.size > maxSize) {
                throw new Error(
                    `${
                        category.charAt(0).toUpperCase() + category.slice(1)
                    }datei ist zu groß. Maximal ${
                        maxSize / (1024 * 1024)
                    } MB erlaubt.`,
                );
            }
            return category;
        }
    }

    throw new Error(
        "Ungültiges Dateiformat. Nur Bilder und Videos sind erlaubt.",
    );
}

/**
 * Speichert eine Datei sicher im Zielverzeichnis.
 * @param {File} file - Die Datei, die gespeichert werden soll.
 * @param {string} directory - Der Zielordner.
 * @returns {string} - Der Pfad der gespeicherten Datei.
 */
export const saveFile = async (file, directory) => {
    if (directory.includes("..")) {
        throw new Error("Ungültiges Zielverzeichnis.");
    }

    const fileType = validateFile(file); // Dateityp prüfen

    // Zielverzeichnis erstellen
    const safeDirectory = path.join("public", directory);
    await Deno.mkdir(safeDirectory, { recursive: true });

    // Sicheren Dateinamen generieren
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueName = `${Date.now()}-${safeName}`;
    const filePath = path.join(safeDirectory, uniqueName);

    // Datei speichern
    const arrayBuffer = await file.arrayBuffer();
    await Deno.writeFile(filePath, new Uint8Array(arrayBuffer));

    console.log(`Datei gespeichert: ${filePath} (Typ: ${fileType})`);
    return path.join(directory, uniqueName);
};

/**
 * Löscht eine Datei aus dem Dateisystem.
 *
 * @param {string} filePath - Der Pfad der zu löschenden Datei.
 */
export const deleteFile = async (filePath) => {
    const safePath = path.join("public", filePath);

    try {
        await Deno.remove(safePath);
        console.log(`Datei gelöscht: ${safePath}`);
    } catch (error) {
        console.error(`Fehler beim Löschen der Datei: ${safePath}`, error);
    }
};
