import {
    add,
    create,
    destroy,
    edit,
    filmsByDate,
    getProgramOverview,
    index,
    show,
    update,
} from "../controllers/filmController.js";

export default [
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/api/program-overview" }),
        handler: getProgramOverview, // API für die nächsten 5 Tage
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/api/films" }),
        handler: filmsByDate, // API für Filme an einem bestimmten Datum
    },
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
        method: "GET",
        pattern: new URLPattern({ pathname: "/dashboard" }),
        handler: index,
    },
];
