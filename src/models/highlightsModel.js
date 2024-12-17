import { DB } from "https://deno.land/x/sqlite@v3.9.0/mod.ts";
import { connection, handleDatabaseError } from "../services/db.js";

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

export const index = () => {
    const db = connection();

    try {
        return db.query("SELECT * FROM highlights");
    } catch (error) {
        handleDatabaseError(error);
    }
};

export const show = (id) => {
    try {
        const db = connection();
        const result = db.query("SELECT * FROM highlights WHERE id = ?", [id]);
        return result[0] || null;
    } catch (error) {
        handleDatabaseError(error);
    }
};

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

export const destroy = (id) => {
    const db = connection();
    try {
        db.query(`DELETE FROM highlights WHERE id = ?`, [id]);
    } catch (error) {
        handleDatabaseError(error);
    }
};

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
