import {
    renderAboutPage,
    renderChroniclePage,
    renderColophonPage,
    renderContactPage,
    renderDocumentationPage,
    renderPricesPage,
    renderTimelinePage,
} from "../controllers/staticController.js";

export default [
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
        pattern: new URLPattern({ pathname: "/documentation" }),
        handler: renderDocumentationPage,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/colophon" }),
        handler: renderColophonPage,
    },
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/timeline" }),
        handler: renderTimelinePage,
    },
];
