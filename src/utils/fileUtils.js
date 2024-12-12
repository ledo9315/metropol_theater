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

export const uploadFiles = async (formData, formValues, existingFilm) => {
    // Poster
    const poster = formData.get("poster");
    if (poster instanceof File && poster.size > 0) {
        formValues.poster = await saveFile(poster, "uploads/posters");
    } else {
        formValues.poster = existingFilm[6]; // Vorhandenes Poster übernehmen
    }

    // Trailer
    const trailer = formData.get("trailer");
    if (trailer instanceof File && trailer.size > 0) {
        formValues.trailer = await saveFile(trailer, "uploads/trailers");
    } else {
        console.log("Vorhandener Trailer:", existingFilm[7]);
        formValues.trailer = existingFilm[7]; // Vorhandenes Trailer übernehmen
    }

    // Trailer Poster
    const trailerPoster = formData.get("trailer_poster");
    if (trailerPoster instanceof File && trailerPoster.size > 0) {
        formValues.trailer_poster = await saveFile(
            trailerPoster,
            "uploads/posters",
        );
    } else {
        formValues.trailer_poster = existingFilm[8]; // Vorhandenes Trailer-Poster übernehmen
    }
};
