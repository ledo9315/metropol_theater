import { homepage } from "../controllers/controller.js";

export default [
    {
        method: "GET",
        pattern: new URLPattern({ pathname: "/" }),
        handler: homepage,
    },
];
