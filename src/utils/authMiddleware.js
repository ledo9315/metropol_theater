export const requireAuth = (handler) => async (req) => {
    const cookies = req.headers.get("Cookie") || "";
    const isLoggedIn = cookies.includes("session=valid");

    if (!isLoggedIn) {
        return new Response(null, {
            status: 302,
            headers: { Location: "/login" },
        });
    }

    return handler(req);
};
