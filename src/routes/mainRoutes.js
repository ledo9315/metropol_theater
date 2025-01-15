import { homePage, index } from "../controllers/controller.js";

export default [
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/" }),
        handler: homePage,
    },
    // {
    //     method: "GET",
    //     pattern: new URLPattern({ pathname: "/dashboard" }),
    //     handler: index,
    // },
];
