import * as highlightModel from "../models/highlightsModel.js";
import { saveFile } from "../utils/fileUtils.js";
import { validateHighlightData } from "../utils/validators.js";
import { render } from "../services/render.js";
import { deleteFile } from "../utils/fileUtils.js";

/**
 *  Erstellt ein neues Highlight basierend auf der Anfrage.
 *
 * @param {Request} req - Die eingehende Anfrage mit den Highlight-Daten.
 * @returns {Promise<Response>} Eine Weiterleitung zur Dashboard-Seite oder ein Validierungsfehler.
 */
export const add = async (req) => {
    try {
        const formData = await req.formData();
        const description = formData.get("description");
        const title = formData.get("highlight_title");
        let image = formData.get("highlight_image");

        const formValues = { title, description, image };

        const { errors, hasErrors } = validateHighlightData(formValues, true);

        console.log("formValues:", formValues);

        if (hasErrors) {
            console.log("Validierungsfehler:", errors);
            return new Response(
                render("add_highlight.html", { errors, formValues }),
                {
                    status: 400,
                    headers: { "Content-Type": "text/html" },
                },
            );
        }

        if (image instanceof File && image.size > 0) {
            image = await saveFile(image, "uploads/highlight_poster");
        }

        highlightModel.add(image, description, title);
        return new Response(null, { status: 201 });
    } catch (error) {
        console.error("Fehler beim Hinzufügen des Highlights:", error);
        throw new Error("Highlight konnte nicht hinzugefügt werden.");
    }
};

/**
 * Zeigt das Formular zum Bearbeiten eines Highlights an.
 *
 * @param {number} id - Die ID des zu bearbeitenden Highlights.
 * @returns {Promise<Response>} Eine HTML-Antwort mit dem Formular.
 */
export const index = async () => {
    try {
        const highlights = await highlightModel.index();

        return highlights.map((highlight) => ({
            id: highlight[0],
            image: highlight[1],
            description: highlight[2],
            title: highlight[3],
            showInCarousel: highlight[4],
        }));
    } catch (error) {
        console.error("Fehler beim Abrufen der Highlights:", error);
        throw new Error("Highlights konnten nicht abgerufen werden.");
    }
};

/**
 * Zeigt das Formular zum Bearbeiten eines Highlights an.
 *
 * @param {number} id - Die ID des zu bearbeitenden Highlights.
 * @returns {Promise<Response>} Eine HTML-Antwort mit dem Formular.
 */
export const show = async (id) => {
    try {
        const highlight = await highlightModel.show(id);

        if (!highlight) {
            console.warn(`Highlight mit ID ${id} nicht gefunden.`);
            return null;
        }

        return {
            id: highlight[0],
            image: highlight[1],
            description: highlight[2],
            title: highlight[3],
        };
    } catch (error) {
        console.error("Fehler beim Abrufen des Highlights:", error);
        throw new Error("Highlight konnte nicht abgerufen werden.");
    }
};

/**
 * Zeigt das Formular zum Bearbeiten eines Highlights an.
 *
 * @param {number} id - Die ID des zu bearbeitenden Highlights.
 * @param {Request} req - Die eingehende Anfrage mit den Highlight-Daten.
 * @returns {Promise<Response>} Eine HTML-Antwort mit dem Formular.
 */
export const update = async (id, req) => {
    try {
        const formData = await req.formData();
        const description = formData.get("description");
        const title = formData.get("highlight_title");
        const poster = await highlightModel.showImage(id);
        const visible = await highlightModel.showVisible(id);
        const formValues = { title, description };

        const { errors, hasErrors } = validateHighlightData(formValues, false);

        if (hasErrors) {
            console.log("Validierungsfehler:", errors);
            formValues.id = id;
            return new Response(
                render("edit_highlight.html", {
                    errors,
                    formValues,
                    poster: poster[0],
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "text/html" },
                },
            );
        }

        let image = formData.get("highlight_image");
        if (image instanceof File && image.size > 0) {
            image = await saveFile(image, "uploads/highlight_poster");
        } else {
            const existingHighlight = highlightModel.show(id);
            image = existingHighlight[1];
        }

        highlightModel.update(image, description, title, visible[0], id);
        return new Response(null, { status: 200 });
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Highlights:", error);
        throw new Error("Highlight konnte nicht aktualisiert werden.");
    }
};

/**
 * Löscht ein bestehendes Highlight.
 *
 * @param {number} id - Die ID des zu löschenden Highlights.
 * @returns {Promise<Response>} Eine leere Antwort oder ein Fehler.
 */
export const destroy = (id) => {
    try {
        const existingHighlight = show(id);
        if (!existingHighlight) {
            console.warn(`Highlight mit ID ${id} nicht gefunden.`);
            return new Response("Highlight nicht gefunden", { status: 404 });
        }

        const file = highlightModel.showImage(id);
        if (file) {
            deleteFile(file[0]);
        }

        highlightModel.destroy(id);

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error(
            `Fehler beim Löschen des Highlights mit ID ${id}:`,
            error,
        );
        throw new Error("Highlight konnte nicht gelöscht werden.");
    }
};

/**
 * Schaltet die Sichtbarkeit eines Highlights um.
 *
 * @param {number} id - Die ID des Highlights.
 * @param {Request} req - Die eingehende Anfrage mit den Daten.
 * @returns {Promise<Response>} Eine leere Antwort oder ein Fehler.
 */
export const toggleVisible = async (id, req) => {
    try {
        const formData = await req.formData();
        const visible = parseInt(formData.get("show_in_carousel"), 10);

        await highlightModel.updateVisibility(id, visible);

        const message = visible
            ? "Highlight eingeblendet"
            : "Highlight ausgeblendet";

        return new Response(null, {
            status: 302,
            headers: {
                Location: `/dashboard?section=highlights-section&message=${
                    encodeURIComponent(
                        message,
                    )
                }`,
            },
        });
    } catch (error) {
        console.error(
            "Fehler beim Umschalten der Sichtbarkeit des Highlights:",
            error,
        );
        throw new Error(
            "Sichtbarkeit des Highlights konnte nicht umgeschaltet werden.",
        );
    }
};
