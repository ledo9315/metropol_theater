// utils/formatDate.js

/**
 * Formatiert ein Datum im Stil "TT MMM (Wochentag)" (z. B. "12 OKT (MO)").
 *
 * @param {string} dateString - Ein Datum im ISO-Format.
 * @returns {string} Formatiertes Datum.
 */
export const formatDateWithWeekday = (dateString) => {
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

/**
 * Extrahiert den Tag und den Wochentag aus einem Datum.
 *
 * @param {string} dateString - Ein Datum im ISO-Format.
 * @returns {Object} Objekt mit `day` und `weekday`.
 */
export const extractDayAndWeekday = (dateString) => {
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

/**
 * Formatiert ein Datum ins deutsche Lokaldatum im Stil "TT.MM.JJJJ".
 *
 * @param {string} dateString - Ein Datum im ISO-Format.
 * @returns {string} Formatiertes Datum.
 */
export const formatDateToGermanLocale = (dateString) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

/**
 * Gruppiert und sortiert Spielzeiten nach Datum.
 *
 * @param {Array} showtimes - Eine Liste von Spielzeiten.
 * @returns {Object} Gruppierte und sortierte Spielzeiten.
 */
export const groupAndSortShowtimes = (showtimes) => {
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
        return dateA - dateB; // Sortiere in aufsteigender Reihenfolge
    });

    // Konvertiere zurück zu einem Objekt
    const sortedGrouped = Object.fromEntries(sorted);

    return sortedGrouped;
};
