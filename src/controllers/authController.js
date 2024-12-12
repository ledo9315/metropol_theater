import { getUserByUsername } from "../models/userModel.js";
import { compareSync } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

export const login = async (req) => {
  const body = await req.json();
  const { username, password } = body;

  const user = getUserByUsername(username);
  if (user.length > 0 && compareSync(password, user[0][2])) {
    return new Response(
      JSON.stringify({ token: "valid_token", message: "Login erfolgreich" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response("Invalid credentials", { status: 401 });
};
