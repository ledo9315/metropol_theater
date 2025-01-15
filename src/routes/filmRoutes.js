import {
    add,
    create,
    destroy,
    edit,
    remove,
    show,
    update,
} from "../controllers/filmController.js";
import { requireAuth } from "../utils/authMiddleware.js";

export default [
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/films/add" }),
        handler: requireAuth(async () => {
            return add();
        }),
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/films/add" }),
        handler: requireAuth(async (req) => {
            return create(req);
        }),
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/films/:id/edit" }),
        handler: requireAuth(async (req, params) => {
            return edit(req, params);
        }),
    },

    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/films/:id/edit" }),
        handler: requireAuth(async (req, params) => {
            return update(req, params);
        }),
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/films/:id/delete" }),
        handler: requireAuth(async (req, params) => {
            return remove(req, params);
        }),
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/films/:id/delete" }),
        handler: requireAuth(async (req, params) => {
            return destroy(req, params);
        }),
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/films/:id" }),
        handler: show,
    },
];
