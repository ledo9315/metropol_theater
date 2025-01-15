import { connection } from "../services/db.js";

// Benutzer anhand des Benutzernamens finden
export const findUserByUsername = async (username) => {
  const db = connection();
  try {
    const result = [
      ...db.query("SELECT username, password FROM users WHERE username = ?", [
        username,
      ]),
    ];
    if (result.length > 0) {
      return { username: result[0][0], password: result[0][1] };
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
