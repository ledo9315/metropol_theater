import { saveFile } from "./fileUtils.js";

/**
 * Extrahiert die Daten eines Films aus einem Formular.
 *
 * @param {FormData} formData - Die Formulardaten.
 * @returns {Object} Die extrahierten Daten.
 */
export const extractFilmFormData = (formData) => ({
    title: formData.get("title")?.trim() || "",
    duration: formData.get("duration")?.trim() || "",
    production_country: formData.get("production_country")?.trim() || "",
    production_year: formData.get("production_year")?.trim() || "",
    fsk: formData.get("fsk")?.trim() || "",
    description: formData.get("description")?.trim() || "",
    producer: formData.getAll("producers").map((p) => p.trim()),
    director: formData.get("director")?.trim() || "",
    genres: formData.getAll("genres").map((g) => g.trim()),
    show_dates: formData.getAll("show_date[]").map((d) => d.trim()),
    show_times: formData.getAll("show_time[]").map((t) => t.trim()),
    is_original_versions: formData.getAll("is_original_versions[]").map((v) =>
        v.trim()
    ),
    is_3ds: formData.getAll("is_3ds[]").map((v) => v.trim()),
});

/**
 * Extrahiert die Daten eines Films aus einem Formular.
 *
 * @param {FormData} formData - Die Formulardaten.
 * @returns {Object} Die extrahierten Daten.
 */
export const extractShowtimes = (formValues) =>
    formValues.show_dates.map((date, index) => ({
        date,
        time: formValues.show_times[index],
        isOriginalVersion: formValues.is_original_versions[index] === "1",
        is3D: formValues.is_3ds[index] === "1",
    }));

export const buildFilmObject = (formValues, directorId, countryId) => ({
    title: formValues.title,
    duration: parseInt(formValues.duration, 10),
    production_year: parseInt(formValues.production_year, 10),
    rating: formValues.fsk,
    description: formValues.description,
    poster: formValues.poster,
    trailer: formValues.trailer,
    trailer_poster: formValues.trailer_poster,
    createdAt: new Date(),
    director_id: directorId,
    country_id: countryId,
});

/**
 * Prüft, ob ein Film bereits existiert und speichert ihn falls nicht.
 * @param {FormData} formData - Die Formulardaten.
 * @returns {Object} Die extrahierten Daten.
 */
export const uploadFiles = async (formData, formValues, existingFilm) => {
    // Poster
    const poster = formData.get("poster");
    if (poster instanceof File && poster.size > 0) {
        formValues.poster = await saveFile(poster, "uploads/posters");
    } else {
        formValues.poster = existingFilm[6];
    }

    // Trailer
    const trailer = formData.get("trailer");
    if (trailer instanceof File && trailer.size > 0) {
        formValues.trailer = await saveFile(trailer, "uploads/trailers");
    } else {
        console.log("Vorhandener Trailer:", existingFilm[7]);
        formValues.trailer = existingFilm[7];
    }

    // Trailer Poster
    const trailerPoster = formData.get("trailer_poster");
    if (trailerPoster instanceof File && trailerPoster.size > 0) {
        formValues.trailer_poster = await saveFile(
            trailerPoster,
            "uploads/trailer_poster",
        );
    } else {
        formValues.trailer_poster = existingFilm[8];
    }
};
