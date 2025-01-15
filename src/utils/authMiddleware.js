import * as userModel from "../models/userModel.js";

export const requireAuth = (handler) => async (...args) => {
    const [req] = args;
    const cookies = req.headers.get("Cookie") || "";
    const sessionToken = cookies
        .split(";")
        .find((cookie) => cookie.trim().startsWith("session="))
        ?.split("=")[1];

    if (!sessionToken) {
        return new Response(null, {
            status: 302,
            headers: { Location: "/login" },
        });
    }

    const user = await userModel.findBySessionToken(sessionToken);

    console.log("User:", user);

    if (!user) {
        return new Response(null, {
            status: 302,
            headers: { Location: "/login" },
        });
    }

    return handler(...args);
};
