import * as path from "https://deno.land/std@0.203.0/path/mod.ts";
import { contentType } from "https://deno.land/std@0.203.0/media_types/mod.ts";

function buildFullPath(base, pathname) {
    const decodedPath = decodeURI(pathname);
    return path.resolve(base, `.${decodedPath}`);  
}

function pathOk(fullPath, base) {
    return fullPath.startsWith(base) && !fullPath.includes("\0"); // Null-Byte Injection und Directory Traversal verhindern
}

async function openFile(fullPath) {
    try {
        const fileInfo = await Deno.stat(fullPath);
        if (!fileInfo.isFile) return undefined;
        return await Deno.open(fullPath, { read: true });
    } catch {
        return undefined;
    }
}

export async function serveStatic(req, publicDir) {
    const url = new URL(req.url);
    const base = path.resolve(publicDir);
    const fullPath = buildFullPath(base, url.pathname);

    if (!pathOk(fullPath, base)) {
        return new Response("403 Forbidden", { status: 403 });
    }

    const file = await openFile(fullPath);
    if (!file) {
        return new Response("404 Not Found", { status: 404 });
    }

    const ext = path.extname(fullPath);
    const mimeType = contentType(ext) || "application/octet-stream";

    return new Response(file.readable, {
        status: 200,
        headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=3600",
        },
    });
}
