import { connection } from "../services/db.js";

// Benutzer anhand des Benutzernamens abrufen
export const getUserByUsername = (username) => {
  const db = connection();
  const user = db.query("SELECT * FROM users WHERE username = ?", [username]);
  if (user.length === 0) return null;
  const [result] = user;
  const [id, userUsername, passwordHash] = result;
  return {
    id,
    username: userUsername,
    passwordHash,
  };
};

// Benutzer anhand der ID abrufen
export const getUserById = (id) => {
  const db = connection();
  const user = db.query("SELECT * FROM users WHERE id = ?", [id]);
  if (user.length === 0) return null;
  const [result] = user;
  const [userId, username, passwordHash] = result;
  return {
    id: userId,
    username,
    passwordHash,
  };
};

// Neuen Benutzer hinzufügen
export const addUserToDB = (user) => {
  const db = connection();
  const { username, passwordHash } = user;
  db.query("INSERT INTO users (username, password_hash) VALUES (?, ?)", [
    username,
    passwordHash,
  ]);
};

// Benutzer anhand der ID löschen
export const deleteUserFromDB = (id) => {
  const db = connection();
  db.query("DELETE FROM users WHERE id = ?", [id]);
};

// Benutzerinformationen aktualisieren
export const updateUserInDB = (id, user) => {
  const db = connection();
  const { username, passwordHash } = user;
  db.query("UPDATE users SET username = ?, password_hash = ? WHERE id = ?", [
    username,
    passwordHash,
    id,
  ]);
};
