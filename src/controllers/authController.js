import { findUserByUsername, validatePassword } from "../models/userModel.js";
import { render } from "../services/render.js";
import * as userModel from "../models/userModel.js";
import { generateCsrfToken } from "../utils/generateCsrfToken.js";

export const login = async (req) => {
  const body = await req.formData();
  const username = body.get("username");
  const password = body.get("password");

  const user = await findUserByUsername(username);

  if (!user) {
    return new Response(
      await render("login.html", {
        error: "Benutzername oder Passwort falsch",
      }),
      {
        status: 401,
        headers: { "Content-Type": "text/html" },
      },
    );
  }

  const isValidPassword = await validatePassword(password, user.password);

  if (!isValidPassword) {
    return new Response(
      await render("login.html", {
        error: "Benutzername oder Passwort falsch",
      }),
      {
        status: 401,
        headers: { "Content-Type": "text/html" },
      },
    );
  }

  const csrfToken = generateCsrfToken();

  await userModel.updateSessionToken(user.id, csrfToken);

  // Erfolgreich eingeloggt: Setze Session-Cookie
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/dashboard?section=movies-section&message=${
        encodeURIComponent("Erfolgreich eingeloggt!")
      }`,
      "Set-Cookie":
        `session=${csrfToken}; HttpOnly; Path=/; Max-Age=1200; Secure`, // 20 Minuten
    },
  });
};

export const logout = () => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/login?message=${
        encodeURIComponent("Erfolgreich ausgeloggt!")
      }`,
      "Set-Cookie": `session=; HttpOnly; Path=/; Max-Age=0`, // Lösche Cookie
    },
  });
};
