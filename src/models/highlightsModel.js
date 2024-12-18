import { connection, handleDatabaseError } from "../services/db.js";

/**
 * Speichert ein neues Highlight in der Datenbank.
 *
 * @returns {Array} Ein Array mit allen Highlights.
 */
export const add = (image, description, title) => {
    const db = connection();
    try {
        db.query(
            "INSERT INTO highlights (highlight_image, description, highlight_title) VALUES (?,?,?)",
            [
                image,
                description,
                title,
            ],
        );
    } catch (error) {
        handleDatabaseError(error);
    }
};

/**
 * Ruft alle Highlights ab.
 *
 * @returns {Array} Ein Array mit allen Highlights.
 */
export const index = () => {
    const db = connection();

    try {
        return db.query("SELECT * FROM highlights");
    } catch (error) {
        handleDatabaseError(error);
    }
};

/**
 * Ruft ein einzelnes Highlight anhand seiner ID ab.
 *
 * @param {number} id - Die ID des Highlights.
 * @returns {object|null} Ein Objekt mit den Highlightdetails oder null, wenn kein Highlight gefunden wurde.
 */
export const show = (id) => {
    try {
        const db = connection();
        const result = db.query("SELECT * FROM highlights WHERE id = ?", [id]);
        return result[0] || null;
    } catch (error) {
        handleDatabaseError(error);
    }
};

/**
 * Aktualisiert ein Highlight in der Datenbank.
 *
 * @param {string} image - Das Bild des Highlights.
 * @param {string} description - Die Beschreibung des Highlights.
 * @param {string} title - Der Titel des Highlights.
 * @param {boolean} show_in_carousel - Die Sichtbarkeit des Highlights.
 * @param {number} id - Die ID des Highlights.
 * @returns {void}
 */
export const update = (image, description, title, show_in_carousel, id) => {
    const db = connection();
    try {
        db.query(
            `
      UPDATE 
        highlights 
      SET
        highlight_image = ?,
        description = ?,
        highlight_title = ?,
        show_in_carousel = ?
      WHERE id = ?;
      `,
            [image, description, title, show_in_carousel, id],
        );
    } catch (error) {
        handleDatabaseError(error);
    }
};

/**
 * Löscht ein Highlight aus der Datenbank.
 *
 * @param {number} id - Die ID des Highlights.
 * @returns {void}
 */
export const destroy = (id) => {
    const db = connection();
    try {
        db.query(`DELETE FROM highlights WHERE id = ?`, [id]);
    } catch (error) {
        handleDatabaseError(error);
    }
};

/**
 * Schaltet die Sichtbarkeit eines Highlights um.
 *
 * @param {number} id - Die ID des Highlights.
 * @param {number} value - Der neue Wert für die Sichtbarkeit.
 * @returns {void}
 */
export const updateVisibility = (id, value) => {
    const db = connection();

    try {
        console.log("ID: ", id, "New Visibility: ", value); // Logge die Werte
        db.query(`UPDATE highlights SET show_in_carousel = ? WHERE id = ?`, [
            value,
            id,
        ]);
        console.log("Update erfolgreich durchgeführt!");
    } catch (error) {
        console.error("Fehler beim Aktualisieren der Sichtbarkeit:", error);
        handleDatabaseError(error);
    }
};

/**
 * Ruft ein einzelnes Bild anhand seiner ID ab.
 *
 * @param {number} id - Die ID des Highlights.
 * @returns {void}
 */
export const showImage = (id) => {
    const db = connection();
    try {
        const result = db.query(
            "SELECT highlight_image FROM highlights WHERE id = ?",
            [id],
        );
        return result[0] || null;
    } catch (error) {
        handleDatabaseError(error);
    }
};

/**
 * Ruft die Sichtbarkeit eines Highlights ab.
 *
 * @param {number} id - Die ID des Highlights.
 * @returns {void}
 */
export const showVisible = (id) => {
    const db = connection();
    try {
        const result = db.query(
            "SELECT show_in_carousel FROM highlights WHERE id = ?",
            [id],
        );
        return result[0] || null;
    } catch (error) {
        handleDatabaseError(error);
    }
};
