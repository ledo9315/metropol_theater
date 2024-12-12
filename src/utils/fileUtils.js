/**
 * Hilfsfunktion zum Speichern von Dateien.
 * @param {File} file - Die Datei, die gespeichert werden soll.
 * @param {string} directory - Der Zielordner.
 * @returns {string} - Der Pfad der gespeicherten Datei.
 */
export const saveFile = async (file, directory) => {
    // Eindeutigen Dateinamen generieren
    const uniqueName = `${Date.now()}-${file.name}`;
    const filePath = `public/${directory}/${uniqueName}`;

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    await Deno.writeFile(filePath, uint8Array);
    console.log(`Datei gespeichert: ${filePath}`);

    // Speichere den eindeutigen Dateinamen für die DB
    return `${directory}/${uniqueName}`; // Beispiel: "uploads/posters/1733528099175-Film.jpg"
};

