export const extractFilmFormData = (formData) => ({
    title: formData.get("title"),
    duration: formData.get("duration"),
    production_country: formData.get("production_country"),
    production_year: formData.get("production_year"),
    fsk: formData.get("fsk"),
    description: formData.get("description"),
    producer: formData.get("producer"),
    director: formData.get("director"),
    genres: formData.getAll("genres"),
    show_dates: formData.getAll("show_date[]"),
    show_times: formData.getAll("show_time[]"),
    is_original_versions: formData.getAll("is_original_version[]"),
    is_3ds: formData.getAll("is_3d[]"),
});

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
    producer: formValues.producer,
    createdAt: new Date(),
    director_id: directorId,
    country_id: countryId,
});
