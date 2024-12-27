export const validateFilmData = (formValues) => {
    const errors = {};
    let hasErrors = false;

    console.log("formValues aus validator", formValues);

    const title = formValues.title;
    const duration = formValues.duration;
    const productionCountry = formValues.production_country;
    const productionYear = formValues.production_year;
    const fsk = formValues.fsk;
    const description = formValues.description;
    const producer = formValues.producer;
    const director = formValues.director;
    const genres = formValues.genres || [];
    const showDates = formValues.show_dates || [];
    const showTimes = formValues.show_times || [];
    const isOriginalVersions = formValues.is_original_versions || [];
    const is3D = formValues.is_3d || [];

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

    if (
        !productionCountry || productionCountry.trim() === "" ||
        productionCountry.length < 3
    ) {
        errors.productionCountry =
            "Bitte geben Sie ein Produktionsland ein. (mind. 3 Zeichen)";
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

    // Validierung für jedes Genre
    const genreErrors = [];
    genres.forEach((genre, index) => {
        if (!genre || genre.trim() === "" || genre.length < 3) {
            genreErrors[index] = `Genre #${
                index + 1
            } muss mindestens 3 Zeichen enthalten.`;
            hasErrors = true;
        }
    });

    if (genreErrors.length > 0) {
        errors.genres = genreErrors;
    }

    if (!director || director.trim() === "" || director.length < 3) {
        errors.director =
            "Bitte geben Sie einen Regisseur ein. (mind. 3 Zeichen)";
        hasErrors = true;
    }

    const producerErrors = [];
    producer.forEach((producer, index) => {
        if (!producer || producer.trim() === "" || producer.length < 3) {
            producerErrors[index] = `Produzent #${
                index + 1
            } muss mindestens 3 Zeichen enthalten.`;
            hasErrors = true;
        }
    });

    if (producerErrors.length > 0) {
        errors.producers = producerErrors;
    }

    const showDateErrors = [];
    showDates.forEach((date, index) => {
        if (!date || date.trim() === "") {
            showDateErrors[index] = `Datum #${
                index + 1
            } muss ein gültiges Datum enthalten.`;
            hasErrors = true;
        }
    });

    if (showDateErrors.length > 0) {
        errors.showDates = showDateErrors;
    }

    return { errors, hasErrors };
};

export const validateHighlightData = (formValues) => {
    const errors = {};
    let hasErrors = false;

    const title = formValues.title;
    const description = formValues.description;

    if (!title || title.trim() === "" || title.length < 3) {
        errors.title = "Bitte geben Sie einen Titel ein. (mind. 3 Zeichen)";
        hasErrors = true;
    }

    if (!description || description.trim() === "" || description.length < 10) {
        errors.description =
            "Bitte geben Sie eine Beschreibung ein. (mind. 10 Zeichen)";
        hasErrors = true;
    }

    return { errors, hasErrors };
};
