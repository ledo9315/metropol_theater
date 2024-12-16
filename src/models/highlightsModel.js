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

export const update = (image, description, title, id) => {
    const db = connection();
    try {
        db.query(
            `
      UPDATE 
        highlights 
      SET
        highlight_image = ?,
        description = ?,
        highlight_title = ?
      WHERE id = ?;
      `,
            [image, description, title, id],
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
