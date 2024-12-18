/**
 * Erstellt eine Response mit dem übergebenen Inhalt, Status und Content-Type.
 * @param {string} content - Der Inhalt der Response.
 * @param {number} status - Der Statuscode der Response.
 * @param {string} content_type - Der Content-Type der Response.
 * @returns {Response} Die erstellte Response.
 */
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
