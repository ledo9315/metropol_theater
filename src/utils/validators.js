export const validateFilmData = (formData) => {
    const errors = {};
    let hasErrors = false;

    const title = formData.get("title");
    const duration = formData.get("duration");
    const description = formData.get("description");
    const productionCountry = formData.get("production_country");
    const productionYear = formData.get("production_year");
    const fsk = formData.get("fsk");

    // Validierungen
    if (!title || title.trim() === "" || title.length < 3) {
        errors.title = "Bitte geben Sie einen Titel ein. (mind. 3 Zeichen)";
        hasErrors = true;
    }

    if (!duration || isNaN(duration) || duration <= 0) {
        errors.duration =
            "Bitte geben Sie eine gültige Länge (in Minuten) ein.";
        hasErrors = true;
    }

    if (!description || description.trim() === "" || description.length < 10) {
        errors.description =
            "Bitte geben Sie eine Beschreibung ein. (mind. 10 Zeichen)";
        hasErrors = true;
    }

    if (!productionCountry || productionCountry.trim() === "") {
        errors.production_country = "Bitte geben Sie ein Produktionsland ein.";
        hasErrors = true;
    }

    if (
        !productionYear ||
        isNaN(productionYear) ||
        productionYear < 1900 ||
        productionYear > new Date().getFullYear()
    ) {
        errors.production_year =
            "Bitte geben Sie ein gültiges Produktionsjahr zwischen 1900 und dem aktuellen Jahr ein.";
        hasErrors = true;
    }

    if (!fsk || !["0", "6", "12", "16", "18"].includes(fsk)) {
        errors.fsk = "Bitte wählen Sie eine gültige FSK-Freigabe.";
        hasErrors = true;
    }

    return { errors, hasErrors };
};
