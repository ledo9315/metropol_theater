export const validateFilmData = (formValues, isAddPage = false) => {
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
    const is3D = formValues.is_3ds || [];
    const poster = formValues.poster;
    const trailer = formValues.trailer;
    const trailerPoster = formValues.trailer_poster;
    const isFilm3D = formValues.is_film_3d;
    const isFilmOriginalVersion = formValues.is_film_original_version;

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

    // Validierung für Checkboxen
    if (![true, false].includes(isFilm3D)) {
        errors.is_film_3d =
            "Bitte wählen Sie eine gültige Option für 3D (Ja oder Nein).";
        hasErrors = true;
    }

    if (![true, false].includes(isFilmOriginalVersion)) {
        errors.is_film_original_version =
            "Bitte wählen Sie eine gültige Option für Originalversion (Ja oder Nein).";
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
        if (!date || date.trim() === "" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            showDateErrors[index] = `Datum #${
                index + 1
            } muss ein gültiges Datum enthalten.`;
            hasErrors = true;
        }
    });

    if (showDateErrors.length > 0) {
        errors.showDates = showDateErrors;
    }

    const showTimeErrors = [];
    const uniqueShowtimes = new Set();

    showTimes.forEach((time, index) => {
        // Prüfen, ob die Spielzeit angegeben wurde und im richtigen Format ist (HH:MM)
        if (!time || !/^\d{2}:\d{2}$/.test(time) || time.trim() === "") {
            showTimeErrors[index] = `Spielzeit #${
                index + 1
            } muss im Format HH:MM sein.`;
            hasErrors = true;
        } else {
            // Falls gültig, prüfen, ob die Kombination aus Datum und Zeit einzigartig ist
            const dateTimeKey = `${showDates[index]} ${time}`;
            if (uniqueShowtimes.has(dateTimeKey)) {
                showTimeErrors[index] =
                    `Die Kombination aus Datum und Spielzeit #${
                        index + 1
                    } ist doppelt.`;
                hasErrors = true;
            } else {
                uniqueShowtimes.add(dateTimeKey);
            }
        }
    });

    // Zu den Fehlern hinzufügen, falls welche existieren
    if (showTimeErrors.length > 0) {
        errors.showTimes = showTimeErrors;
    }

    const isOriginalVersionErrors = [];
    isOriginalVersions.forEach((version, index) => {
        if (!["0", "1"].includes(version)) {
            isOriginalVersionErrors[index] = `OV-Option #${
                index + 1
            } ist ungültig (muss 0 oder 1 sein).`;
            hasErrors = true;
        }
    });

    if (isOriginalVersionErrors.length > 0) {
        errors.isOriginalVersions = isOriginalVersionErrors;
    }

    const is3DErrors = [];
    is3D.forEach((is3D, index) => {
        if (!["0", "1"].includes(is3D)) {
            is3DErrors[index] = `3D-Option #${
                index + 1
            } ist ungültig (muss 0 oder 1 sein).`;
            hasErrors = true;
        }
    });

    if (is3DErrors.length > 0) {
        errors.is3D = is3DErrors;
    }

    // Validierung nur für `add.html`
    if (isAddPage) {
        if (!poster) {
            errors.poster = "Bitte laden Sie ein Poster hoch.";
            hasErrors = true;
        }

        if (!trailer) {
            errors.trailer = "Bitte laden Sie einen Trailer hoch.";
            hasErrors = true;
        }

        if (!trailerPoster) {
            errors.trailer_poster = "Bitte laden Sie ein Trailer-Poster hoch.";
            hasErrors = true;
        }
    }

    return { errors, hasErrors };
};

export const validateHighlightData = (formValues, isAddPage = false) => {
    const errors = {};
    let hasErrors = false;

    const title = formValues.title;
    const description = formValues.description;
    const image = formValues.image;

    if (!title || title.trim() === "" || title.length < 3) {
        errors.title = "Bitte geben Sie einen Titel ein. (mind. 3 Zeichen)";
        hasErrors = true;
    }

    if (!description || description.trim() === "" || description.length < 10) {
        errors.description =
            "Bitte geben Sie eine Beschreibung ein. (mind. 10 Zeichen)";
        hasErrors = true;
    }

    if (isAddPage) {
        if (!image) {
            errors.image = "Bitte laden Sie ein Bild hoch.";
            hasErrors = true;
        }
    }

    return { errors, hasErrors };
};
