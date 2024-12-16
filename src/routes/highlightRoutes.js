import {
    add,
    create,
    destroy,
    edit,
    remove,
    update,
} from "../controllers/highlightsController.js";

export default [
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/highlights/add" }),
        handler: create,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/highlights/add" }),
        handler: add,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/highlights/:id/edit" }),
        handler: edit,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/highlights/:id/edit" }),
        handler: update,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/highlights/:id/delete" }),
        handler: remove,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/highlights/:id/delete" }),
        handler: destroy,
    },
];
