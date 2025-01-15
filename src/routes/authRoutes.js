import { login, logout } from "../controllers/authController.js";
import { requireAuth } from "../utils/authMiddleware.js";
import { render } from "../services/render.js";
import { index } from "../controllers/controller.js";

export default [
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/login" }),
        handler: async () => {
            return new Response(await render("login.html"), {
                headers: { "Content-Type": "text/html" },
            });
        },
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/login" }),
        handler: login,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/logout" }),
        handler: requireAuth(async () => {
            return logout();
        }),
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/dashboard" }),
        handler: requireAuth(async (req) => {
            return index(req);
        }),
    },
];
