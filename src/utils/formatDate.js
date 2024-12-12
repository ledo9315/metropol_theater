export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "short",
        weekday: "short",
    });

    const parts = formatter.formatToParts(date);
    const day = parts.find((p) => p.type === "day").value;
    const month = parts.find((p) => p.type === "month").value.toUpperCase();
    const weekday = parts.find((p) => p.type === "weekday").value.toUpperCase();

    return `${day} ${month} (${weekday})`;
};

export const formatDateforProgram = (dateString) => {
    const date = new Date(dateString);
    const formatter = new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        weekday: "short",
    });

    const parts = formatter.formatToParts(date);
    const day = parts.find((p) => p.type === "day").value;
    const weekday = parts.find((p) => p.type === "weekday").value.toUpperCase();

    return { day, weekday };
};

export const formatDateToLocaleString = (dateString) => {
    return dateString = new Date(dateString).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export const groupShowtimes = (showtimes) => {
    const grouped = showtimes.reduce(
        (acc, { date, time, isOriginalVersion, is3D }) => {
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push({ time, isOriginalVersion, is3D });
            return acc;
        },
        {},
    );

    const sorted = Object.entries(grouped).sort((a, b) => {
        const dateA = new Date(a[0]); // Konvertiere Schlüssel zurück zu Datum
        const dateB = new Date(b[0]);
        return dateB - dateA; // Sortiere in absteigender Reihenfolge
    });

    // Konvertiere zurück zu einem Objekt
    const sortedGrouped = Object.fromEntries(sorted);

    return sortedGrouped;
};
