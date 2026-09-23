"use strict";

const nodeFs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const express = require("express");

const VERSION = "20260923-del-1";
const SESSION_SECONDS = 3600;
const ORIGINS = new Set([
    "https://lab.laau.university",
    "https://lab.agileai.university",
    "https://agileai-lab.web.app",
    "https://agileai-lab.firebaseapp.com"
]);
const TYPES = Object.freeze({
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".woff": "font/woff",
    ".woff2": "font/woff2"
});

function safePath(value, directory = false) {
    if (typeof value !== "string" || !value || value.length > 512 ||
        !/^[A-Za-z0-9_./-]+$/.test(value) || value.startsWith("/") ||
        value.includes("//")) return false;
    const parts = (directory ? value.replace(/\/$/, "") : value).split("/");
    if (parts.some(part => !part || part.startsWith(".") ||
        /(?:^|[-_])(?:legacy|archives?|backups?|secrets?|credentials?|node_modules)(?:$|[-_.])/i.test(part) ||
        /^(?:package(?:-lock)?\.json|Dockerfile|manifest\.json|catalog\.json)$/i.test(part))) return false;
    return directory || Object.prototype.hasOwnProperty.call(TYPES, path.extname(value).toLowerCase());
}

function validUid(value) {
    return typeof value === "string" && value.length > 0 && value.length <= 128 &&
        value.trim() === value && !/[\u0000-\u001f\u007f]/.test(value);
}

function grantId(uid, courseId) {
    return crypto.createHash("sha256").update(uid + "\0" + courseId).digest("hex");
}

function coursePathAllowed(course, filename) {
    return course.prefixes.some(prefix => prefix.endsWith("/") ? filename.startsWith(prefix) : filename === prefix);
}

function readConfiguration(options, fileSystem) {
    const catalog = options.catalog || JSON.parse(fileSystem.readFileSync(path.join(__dirname, "catalog.json"), "utf8"));
    const manifest = options.manifest || JSON.parse(fileSystem.readFileSync(path.join(__dirname, "manifest.json"), "utf8"));
    if (!catalog || catalog.schema !== 1 || !Array.isArray(catalog.courses) ||
        !manifest || manifest.schema !== 1 || !Array.isArray(manifest.files)) {
        throw new Error("Invalid DEL content configuration");
    }
    const files = new Map();
    for (const item of manifest.files) {
        if (!item || !safePath(item.path) || !/^[a-f0-9]{64}$/.test(item.sha256) || files.has(item.path)) {
            throw new Error("Invalid DEL file manifest");
        }
        // MIME types are derived from the extension, never trusted from stored metadata.
        files.set(item.path, { sha256: item.sha256, contentType: TYPES[path.extname(item.path).toLowerCase()] });
    }
    const courses = new Map();
    for (const item of catalog.courses) {
        if (!item || !/^[A-Z][A-Z0-9-]{0,39}$/.test(item.id) || courses.has(item.id) ||
            typeof item.title !== "string" || !item.title.trim() || typeof item.published !== "boolean") {
            throw new Error("Invalid DEL course catalogue");
        }
        if (item.published && (!Array.isArray(item.prefixes) || !item.prefixes.length ||
            item.prefixes.some(prefix => !safePath(prefix, prefix.endsWith("/"))) ||
            !safePath(item.entry) || !files.has(item.entry) || !coursePathAllowed(item, item.entry))) {
            throw new Error("Invalid published DEL course");
        }
        courses.set(item.id, Object.freeze({
            id: item.id, title: item.title, description: typeof item.description === "string" ? item.description : "",
            published: item.published, prefixes: Object.freeze([...(item.prefixes || [])]), entry: item.entry
        }));
    }
    return { courses, files };
}

function identity(decoded) {
    if (!decoded || !validUid(decoded.uid) || decoded.email_verified !== true ||
        typeof decoded.email !== "string" || !decoded.email.trim() ||
        decoded.email.length > 320 || /[\r\n\u0000]/.test(decoded.email)) return null;
    return { uid: decoded.uid, email: decoded.email };
}

function sessionCookie(req) {
    const raw = req.headers.cookie;
    if (typeof raw !== "string" || raw.length > 20000) return null;
    const found = raw.split(";").map(value => value.trim()).filter(value => value.startsWith("__session="));
    if (found.length !== 1) return null;
    const value = found[0].slice("__session=".length);
    return /^[A-Za-z0-9_.-]{10,8192}$/.test(value) ? value : null;
}

function validGrant(snapshot, uid, courseId, now) {
    if (!snapshot || snapshot.exists !== true || typeof snapshot.data !== "function") return null;
    const value = snapshot.data();
    if (!value || value.schema !== 1 || value.uid !== uid || value.courseId !== courseId || value.status !== "active" ||
        !["learner", "trainer", "lto_admin"].includes(value.role)) return null;
    if (value.organizationId !== undefined &&
        (typeof value.organizationId !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(value.organizationId))) return null;
    if (value.role !== "learner" && !value.organizationId) return null;
    if (!value.expiresAt || typeof value.expiresAt.toMillis !== "function") return null;
    let expiry;
    try { expiry = value.expiresAt.toMillis(); } catch (_) { return null; }
    if (!Number.isFinite(expiry) || expiry <= now || expiry > 8640000000000000) return null;
    return { role: value.role, expiresAt: new Date(expiry).toISOString(), organizationId: value.organizationId };
}

function protectedUrl(url, prefix) {
    let value = url;
    for (const origin of ORIGINS) {
        if (value === origin) return "/";
        if (value.startsWith(origin + "/")) { value = value.slice(origin.length); break; }
    }
    if (!value.startsWith("/") || value.startsWith("//") || value === "/" || value.startsWith("/del/")) return value;
    return prefix + value.slice(1);
}

function rewriteContent(text, courseId, extension, uid) {
    const prefix = "/del/content/" + courseId + "/";
    // Existing relative links keep their directory semantics; absolute Lab paths stay inside this course.
    let output = text.replace(/(["'`])((?:https:\/\/(?:lab\.laau\.university|lab\.agileai\.university|agileai-lab\.(?:web\.app|firebaseapp\.com)))?\/(?!\/)[^"'`\s<>]*)/g,
        (_, quote, url) => quote + protectedUrl(url, prefix));
    if (extension === ".css" || extension === ".html") {
        output = output.replace(/url\(\s*(\/(?!\/)[^\s)'"<>]+)\s*\)/g,
            (_, url) => "url(" + protectedUrl(url, prefix) + ")");
    }
    if (extension === ".html") {
        output = output.replace(/<base\b[^>]*>/gi, "");
        const bootstrap = '<script>window.__LAAU_DEL_SCOPE__=' + JSON.stringify(grantId(uid, courseId)) + ';</script>' +
            '<script src="' + prefix + 'del-storage.js"></script>';
        if (/<head\b[^>]*>/i.test(output)) output = output.replace(/(<head\b[^>]*>)/i, "$1" + bootstrap);
        else if (/<body\b[^>]*>/i.test(output)) output = output.replace(/(<body\b[^>]*>)/i, "$1" + bootstrap);
        else output = bootstrap + output;
        const navigation = '<nav aria-label="Lab account" style="padding:12px 20px;background:#102d43;color:#fff"><a href="/" style="color:inherit">Return to your Lab workspace</a><span style="margin-left:16px">DEL pilot preview</span></nav>';
        output = output.replace(/(<body\b[^>]*>)/i, "$1" + navigation);
    }
    return output;
}

function createDelRouter(options) {
    if (!options || !options.admin || !options.db) throw new Error("DEL requires Firebase Authentication and Firestore");
    const { admin, db } = options;
    const fileSystem = options.fs || nodeFs;
    const contentRoot = path.resolve(options.contentRoot || path.join(__dirname, "private"));
    const now = options.now || Date.now;
    const { courses, files } = readConfiguration(options, fileSystem);
    const router = express.Router();
    const auth = admin.auth();
    const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
    const fail = (res, status, code) => res.status(status).json({ error: code });

    router.use((req, res, next) => {
        res.removeHeader("Access-Control-Allow-Origin");
        res.removeHeader("Access-Control-Allow-Credentials");
        res.removeHeader("Access-Control-Allow-Headers");
        res.removeHeader("Access-Control-Allow-Methods");
        res.set({
            "Cache-Control": "private, no-store, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
            "Vary": "Cookie, Origin",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "no-referrer",
            "X-Frame-Options": "SAMEORIGIN",
            "Accept-Ranges": "none",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; frame-src 'none'; frame-ancestors 'self'; object-src 'none'; base-uri 'none'; form-action 'self'"
        });
        // Conditional/range responses must never reuse a representation after access changes.
        delete req.headers["if-none-match"];
        delete req.headers["if-modified-since"];
        delete req.headers["if-range"];
        delete req.headers.range;
        next();
    });

    function originRequired(req, res, next) {
        if (!ORIGINS.has(req.headers.origin) ||
            (req.headers["sec-fetch-site"] && req.headers["sec-fetch-site"] !== "same-origin")) {
            return fail(res, 403, "origin_not_allowed");
        }
        next();
    }

    const authenticated = asyncRoute(async (req, res, next) => {
        const cookie = sessionCookie(req);
        if (!cookie) return fail(res, 401, "sign_in_required");
        try {
            req.delUser = identity(await auth.verifySessionCookie(cookie, true));
        } catch (_) { return fail(res, 401, "sign_in_required"); }
        if (!req.delUser) return fail(res, 401, "sign_in_required");
        next();
    });

    async function readGrant(uid, courseId) {
        const snapshot = await db.collection("del_access").doc(grantId(uid, courseId)).get();
        const grant = validGrant(snapshot, uid, courseId, now());
        if (grant && grant.role !== "learner") {
            const organization = await db.collection("trainingOrganizations").doc(grant.organizationId).get();
            if (!organization || organization.exists !== true) return null;
            const data = organization.data();
            if (!data || data.status !== "active" || data.organizationId !== grant.organizationId ||
                (data.organization_id !== undefined && data.organization_id !== grant.organizationId)) return null;
        }
        return grant;
    }

    router.get("/health", (req, res) => res.json({ service: "laau-del", version: VERSION, status: "ok" }));
    router.post("/session", originRequired, express.json({ limit: "2kb", strict: true }), asyncRoute(async (req, res) => {
        const match = /^Bearer ([A-Za-z0-9_.-]{10,16384})$/.exec(req.headers.authorization || "");
        if (!match) return fail(res, 401, "sign_in_required");
        let decoded;
        try { decoded = await auth.verifyIdToken(match[1], true); }
        catch (_) { return fail(res, 401, "sign_in_required"); }
        const user = identity(decoded);
        const seconds = Math.floor(now() / 1000);
        if (!user || !Number.isInteger(decoded.auth_time) || decoded.auth_time < seconds - 300 || decoded.auth_time > seconds + 30) {
            return fail(res, 401, "recent_sign_in_required");
        }
        const value = await auth.createSessionCookie(match[1], { expiresIn: SESSION_SECONDS * 1000 });
        if (typeof value !== "string" || !/^[A-Za-z0-9_.-]{10,8192}$/.test(value)) throw new Error("Invalid session result");
        res.set("Set-Cookie", "__session=" + value + "; Max-Age=" + SESSION_SECONDS + "; Path=/; HttpOnly; Secure; SameSite=Lax");
        return res.json({ user });
    }));
    router.post("/logout", originRequired, (req, res) => {
        res.set("Set-Cookie", "__session=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax");
        return res.status(200).json({ signedOut: true });
    });
    router.get("/me", authenticated, asyncRoute(async (req, res) => {
        const accessible = [];
        for (const course of courses.values()) {
            if (!course.published) continue;
            const grant = await readGrant(req.delUser.uid, course.id);
            if (!grant) continue;
            accessible.push({
                id: course.id, title: course.title, description: course.description,
                entryUrl: "/del/content/" + course.id + "/" + course.entry,
                role: grant.role, expiresAt: grant.expiresAt
            });
        }
        return res.json({ user: req.delUser, courses: accessible });
    }));
    router.get("/content/:courseId/*", authenticated, asyncRoute(async (req, res) => {
        const course = courses.get(req.params.courseId);
        if (!course || !course.published) return fail(res, 404, "content_not_found");
        if (!await readGrant(req.delUser.uid, course.id)) return fail(res, 403, "course_access_required");
        const rawPath = req.originalUrl.split("?")[0];
        if (/%(?:2f|5c|2e|25)/i.test(rawPath)) return fail(res, 404, "content_not_found");
        let requested = req.params[0];
        if (requested.endsWith("/")) requested += "index.html";
        if (!safePath(requested) || !coursePathAllowed(course, requested)) {
            return fail(res, 404, "content_not_found");
        }
        const entry = files.get(requested);
        if (!entry) return fail(res, 404, "content_not_found");
        // Every directory component is checked: an allowlisted name must not point through a symlink.
        let fullPath = contentRoot;
        const rootInfo = await fileSystem.promises.lstat(fullPath);
        if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) throw new Error("Invalid private root");
        const segments = requested.split("/");
        for (let i = 0; i < segments.length; i++) {
            fullPath = path.join(fullPath, segments[i]);
            const info = await fileSystem.promises.lstat(fullPath);
            if (info.isSymbolicLink() || (i === segments.length - 1 ? !info.isFile() : !info.isDirectory())) {
                throw new Error("Invalid private content path");
            }
        }
        const binary = await fileSystem.promises.readFile(fullPath);
        if (crypto.createHash("sha256").update(binary).digest("hex") !== entry.sha256) throw new Error("Private content integrity mismatch");
        const extension = path.extname(requested).toLowerCase();
        const body = [".html", ".css", ".js"].includes(extension)
            ? Buffer.from(rewriteContent(binary.toString("utf8"), course.id, extension, req.delUser.uid), "utf8") : binary;
        // Use end rather than Express send: no ETag, freshness or automatic 304 handling.
        res.status(200).set("Content-Type", entry.contentType).set("Content-Length", String(body.length));
        return res.end(body);
    }));
    router.use((req, res) => fail(res, 404, "not_found"));
    router.use((error, req, res, next) => {
        if (res.headersSent) return next(error);
        const malformed = error && (error.type === "entity.parse.failed" || error.type === "entity.too.large" || error instanceof URIError);
        return fail(res, malformed ? 400 : 503, malformed ? "invalid_request" : "service_unavailable");
    });
    return router;
}

module.exports = { createDelRouter, grantId, VERSION };
