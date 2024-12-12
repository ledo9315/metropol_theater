export function createResponse(
    content,
    status = 200,
    content_type = "text/html",
) {
    return new Response(content, {
        status,
        headers: { "content-type": content_type },
    });
}
