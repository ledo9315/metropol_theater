import {
    renderAboutPage,
    renderChroniclePage,
    renderContactPage,
    renderFilmDetailPage,
    renderFilmRemoveForm,
    renderPricesPage,
} from "../controllers/controller.js";
import { homePage } from "../controllers/filmController.js";

export default [
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/" }),
        handler: homePage,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/about" }),
        handler: renderAboutPage,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/prices" }),
        handler: renderPricesPage,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/contact" }),
        handler: renderContactPage,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/chronicle" }),
        handler: renderChroniclePage,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/film" }),
        handler: renderFilmDetailPage,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/film_remove_form" }),
        handler: renderFilmRemoveForm,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/film_remove_form/:id" }),
        handler: renderFilmRemoveForm,
    },
];
