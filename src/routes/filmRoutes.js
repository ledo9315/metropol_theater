import {
    add,
    create,
    createHighlight,
    destroy,
    edit,
    index,
    renderHighlightForm,
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
        method: "POST",
        pattern: new URLPattern({ pathname: "/films/:id/delete" }),
        handler: destroy,
    },

    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/films/:id" }),
        handler: show,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/highlights/add" }),
        handler: createHighlight,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/highlights/add" }),
        handler: renderHighlightForm,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/dashboard" }),
        handler: index,
    },
];
