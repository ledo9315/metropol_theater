import { connection } from "../services/db.js";

// Benutzer anhand des Benutzernamens finden
export const findUserByUsername = async (username) => {
  const db = connection();
  try {
    const result = [
      ...db.query(
        "SELECT id, username, password FROM users WHERE username = ?",
        [
          username,
        ],
      ),
    ];
    if (result.length > 0) {
      return {
        id: result[0][0],
        username: result[0][1],
        password: result[0][2],
      };
    }
    console.log("Benutzer nicht gefunden");
    return null;
  } catch (error) {
    console.error("Fehler beim Abrufen des Benutzers:", error);
    return null;
  }
};

// Passwort validieren
export const validatePassword = async (password, passwordHash) => {
  const bcrypt = await import("https://deno.land/x/bcrypt@v0.4.1/mod.ts");
  return bcrypt.compare(password, passwordHash);
};

// Finde Benutzer anhand des Session-Tokens
export const findBySessionToken = async (sessionToken) => {
  const db = connection();
  const query = `
      SELECT id, username FROM users WHERE session_token = ? LIMIT 1;
  `;
  const result = [...db.query(query, [sessionToken])];
  return result.length > 0 ? result[0] : null;
};

// Speichere oder aktualisiere den Session-Token
export const updateSessionToken = async (userId, sessionToken) => {
  const db = connection();
  const query = `
      UPDATE users SET session_token = ? WHERE id = ?;
  `;
  db.query(query, [sessionToken, userId]);
};
