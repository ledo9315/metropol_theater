import {
    add,
    create,
    destroy,
    edit,
    remove,
    toggleVisible,
    update,
} from "../controllers/highlightsController.js";
import { requireAuth } from "../utils/authMiddleware.js";

export default [
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/highlights/add" }),
        handler: requireAuth(async (req) => {
            return create(req);
        }),
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/highlights/add" }),
        handler: requireAuth(async () => {
            return add();
        }),
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/highlights/:id/edit" }),
        handler: requireAuth(async (req, params) => {
            return edit(req, params);
        }),
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/highlights/:id/edit" }),
        handler: requireAuth(async (req, params) => {
            return update(req, params);
        }),
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/highlights/:id/delete" }),
        handler: requireAuth(async (req, params) => {
            return remove(req, params);
        }),
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/highlights/:id/delete" }),
        handler: requireAuth(async (req, params) => {
            return destroy(req, params);
        }),
    },

    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/highlights/:id/toggle-visible" }),
        handler: requireAuth(async (req, params) => {
            return toggleVisible(req, params);
        }),
    },
];
