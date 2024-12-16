import { connection } from "../services/db.js";

export const add = (image, description, title) => {
    const db = connection();
    db.query(
        "INSERT INTO highlights (highlight_image, description, highlight_title) VALUES (?,?,?)",
        [
            image,
            description,
            title,
        ],
    );
};

export const index = () => {
    const db = connection();

    return db.query("SELECT * FROM highlights");
};

export const show = (id) => {
    const db = connection();
    const result = db.query("SELECT * FROM highlights WHERE id = ?", [id]);
    return result[0] || null;
};

export const update = (image, description, title, id) => {
    const db = connection();

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
};

export const destroy = (id) => {
    const db = connection();

    db.query(
        `
      DELETE FROM highlights WHERE id = ?
    `,
        [id],
    );
};
