import {
    add,
    create,
    destroy,
    edit,
    remove,
    show,
    update,
} from "../controllers/filmController.js";

export default [
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/films/add" }),
        handler: add,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/films/add" }),
        handler: create,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/films/:id/edit" }),
        handler: edit,
    },

    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/films/:id/edit" }),
        handler: update,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/films/:id/delete" }),
        handler: remove,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/films/:id/delete" }),
        handler: destroy,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/films/:id" }),
        handler: show,
    },
];
