import {
    add,
    create,
    createHighlight,
    destroy,
    destroyHighlight,
    edit,
    editHighlight,
    index,
    renderFilmRemoveForm,
    renderHighlightForm,
    renderHighlightRemoveForm,
    show,
    update,
    updateHighlight,
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
        handler: renderFilmRemoveForm,
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
        pattern: new URLPattern({ pathname: "/highlights/:id/edit" }),
        handler: editHighlight,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/highlights/:id/edit" }),
        handler: updateHighlight,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/highlights/:id/delete" }),
        handler: renderHighlightRemoveForm,
    },
    {
        method: "POST",
        pattern: new URLPattern({ pathname: "/highlights/:id/delete" }),
        handler: destroyHighlight,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/dashboard" }),
        handler: index,
    },
];
