"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const http = require("node:http");
const express = require("express");
const { createDelRouter, grantId, VERSION } = require("../router");

const ORIGIN = "https://lab.laau.university";
const UID = "firebase-learner-01";
const COURSE = "DEL-PILOT";
const ENTRY = "environments/classic-agile/index.html";
const CONTENT = "/del/content/" + COURSE + "/" + ENTRY;
const NOW = Date.UTC(2026, 8, 23, 12);
class Timestamp { constructor(ms) { this.ms = ms; } toMillis() { return this.ms; } }

function grant(overrides = {}) {
    return { schema: 1, uid: UID, courseId: COURSE, role: "learner", status: "active", expiresAt: new Timestamp(NOW + 3600000), ...overrides };
}

function fixture() {
    const bodies = {
        [ENTRY]: '<!doctype html><html><head><base href="https://unsafe.invalid/"><link href="/assets/css/lab.css"></head><body><h1>Private pilot scenario</h1><a href="/environments/classic-agile/">Case</a><script src="./assets/js/scenario.js"></script><a href="https://lab.laau.university/scenario-packs/aipa/briefing.html">Unpublished</a></body></html>',
        "environments/classic-agile/assets/js/scenario.js": 'const next = "/environments/classic-agile/outcomes/"; const leave = "/";',
        "assets/css/lab.css": '.background { background-image: url(/assets/images/preview.png) }',
        "del-storage.js": "window.LAAUDelStorage = {};",
        "environments/other/index.html": "<html><body>Other course private content</body></html>"
    };
    return {
        bodies,
        catalog: { schema: 1, courses: [
            { id: COURSE, title: "DEL pilot", description: "Preview; no curriculum completion", published: true, prefixes: ["environments/classic-agile/", "assets/css/", "del-storage.js"], entry: ENTRY },
            { id: "OTHER", title: "Other course", published: true, prefixes: ["environments/other/"], entry: "environments/other/index.html" },
            { id: "AIPA", title: "AIPA", published: false }
        ] },
        manifest: { schema: 1, files: Object.entries(bodies).map(([name, body]) => ({ path: name, sha256: crypto.createHash("sha256").update(body).digest("hex") })) }
    };
}

async function harness(t, changes = {}) {
    const data = fixture();
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "laau-del-test-"));
    for (const [name, body] of Object.entries(data.bodies)) {
        await fs.promises.mkdir(path.dirname(path.join(root, name)), { recursive: true });
        await fs.promises.writeFile(path.join(root, name), body);
    }
    const state = {
        now: NOW,
        user: { uid: UID, email: "learner@example.test", email_verified: true, auth_time: NOW / 1000 },
        grants: new Map([[grantId(UID, COURSE), grant()]]), organizations: new Map(), reads: [],
        tokenCalls: [], cookieCalls: [], creates: [], revoked: false, dbFailure: false
    };
    const auth = {
        async verifySessionCookie(value, revoked) {
            state.cookieCalls.push({ value, revoked });
            if (state.revoked) throw new Error("auth/session-cookie-revoked");
            return { ...state.user };
        },
        async verifyIdToken(value, revoked) {
            state.tokenCalls.push({ value, revoked });
            if (state.tokenFailure) throw new Error("auth/id-token-expired");
            return { ...state.user };
        },
        async createSessionCookie(value, options) {
            state.creates.push({ value, options });
            return "verified-session-cookie-value";
        }
    };
    const db = { collection(name) {
        assert.ok(["del_access", "trainingOrganizations"].includes(name));
        return { doc(id) { return { async get() {
            state.reads.push({ collection: name, id });
            if (state.dbFailure) throw new Error("PERMISSION_DENIED");
            const record = (name === "del_access" ? state.grants : state.organizations).get(id);
            return { exists: record !== undefined, data: () => record };
        } }; } };
    } };
    const options = { admin: { auth: () => auth }, db, catalog: data.catalog, manifest: data.manifest, contentRoot: root, now: () => state.now, ...changes };
    const app = express();
    app.disable("x-powered-by");
    app.use("/del", createDelRouter(options));
    const server = await new Promise(resolve => { const service = app.listen(0, "127.0.0.1", () => resolve(service)); });
    const port = server.address().port;
    t.after(async () => {
        await new Promise(resolve => server.close(resolve));
        await fs.promises.rm(root, { recursive: true, force: true });
    });
    async function request(url, options = {}) {
        return new Promise((resolve, reject) => {
            const headers = { ...(options.auth === false ? {} : { Cookie: "__session=verified-session-cookie-value" }), ...options.headers };
            const req = http.request({ hostname: "127.0.0.1", port, path: url, method: options.method || "GET", headers }, res => {
                const chunks = [];
                res.on("data", chunk => chunks.push(chunk));
                res.on("end", () => {
                    const body = Buffer.concat(chunks).toString("utf8");
                    let json;
                    try { json = JSON.parse(body); } catch (_) { /* HTML and empty responses. */ }
                    resolve({ status: res.statusCode, headers: res.headers, body, json });
                });
            });
            req.on("error", reject);
            req.end(options.body);
        });
    }
    return { state, request, root, options, ...data };
}

function noCache(response) {
    assert.match(response.headers["cache-control"], /private.*no-store/);
    assert.equal(response.headers["x-content-type-options"], "nosniff");
    assert.equal(response.headers["referrer-policy"], "no-referrer");
    assert.equal(response.headers["access-control-allow-origin"], undefined);
}

test("health is public, while missing, duplicate and malformed session cookies fail before Firestore", async t => {
    const h = await harness(t);
    const health = await h.request("/del/health", { auth: false });
    assert.equal(health.status, 200);
    assert.equal(health.json.version, VERSION);
    for (const headers of [{}, { Cookie: "__session=short" }, { Cookie: "__session=one-long-value; __session=second-long-value" }, { Cookie: "__session=%0a-malformed-session" }]) {
        const response = await h.request(CONTENT, { auth: false, headers });
        assert.equal(response.status, 401);
        assert.equal(response.json.error, "sign_in_required");
        assert.ok(!response.body.includes("Private pilot"));
        noCache(response);
    }
    assert.deepEqual(h.state.reads, []);
});

test("session exchange validates exact Origin, verified identity, revocation and recent auth_time", async t => {
    const h = await harness(t);
    const headers = { Origin: ORIGIN, Authorization: "Bearer firebase-id-token-value", "Content-Type": "application/json" };
    for (const origin of [undefined, "null", "https://evil.example", "https://lab.laau.university.evil.example", ORIGIN + "/"]) {
        const current = { ...headers };
        if (origin === undefined) delete current.Origin; else current.Origin = origin;
        const response = await h.request("/del/session", { method: "POST", auth: false, headers: current, body: "{}" });
        assert.equal(response.status, 403);
    }
    assert.deepEqual(h.state.tokenCalls, []);
    assert.equal((await h.request("/del/session", { method: "POST", headers: { ...headers, "Sec-Fetch-Site": "cross-site" } })).status, 403);
    h.state.user.auth_time -= 301;
    assert.equal((await h.request("/del/session", { method: "POST", headers, body: "{}" })).status, 401);
    h.state.user.auth_time = NOW / 1000 + 31;
    assert.equal((await h.request("/del/session", { method: "POST", headers, body: "{}" })).status, 401);
    h.state.user.auth_time = NOW / 1000;
    h.state.user.email_verified = false;
    assert.equal((await h.request("/del/session", { method: "POST", headers, body: "{}" })).status, 401);
    h.state.user.email_verified = true;
    const response = await h.request("/del/session", { method: "POST", headers, body: "{}" });
    assert.equal(response.status, 200);
    assert.deepEqual(response.json.user, { uid: UID, email: "learner@example.test" });
    const cookie = response.headers["set-cookie"][0];
    for (const expected of ["__session=", "Max-Age=3600", "Path=/", "HttpOnly", "Secure", "SameSite=Lax"]) assert.ok(cookie.includes(expected));
    assert.equal(cookie.includes("Domain="), false);
    assert.ok(h.state.tokenCalls.every(call => call.revoked === true));
    assert.deepEqual(h.state.creates[0].options, { expiresIn: 3600000 });
    noCache(response);
});

test("logout is POST-only with Origin protection and expires the host-only cookie", async t => {
    const h = await harness(t);
    assert.equal((await h.request("/del/logout")).status, 404);
    assert.equal((await h.request("/del/logout", { method: "POST", headers: { Origin: "https://evil.example" } })).status, 403);
    const response = await h.request("/del/logout", { method: "POST", auth: false, headers: { Origin: ORIGIN } });
    assert.equal(response.status, 200);
    assert.match(response.headers["set-cookie"][0], /__session=; Max-Age=0; Path=\/; HttpOnly; Secure; SameSite=Lax/);
    assert.deepEqual(h.state.reads, []);
});

test("me reads only deterministic UID/course grants and never derives access from profile roles or unpublished entries", async t => {
    const h = await harness(t);
    h.state.user.admin = true;
    h.state.grants.set(grantId(UID, "AIPA"), grant({ courseId: "AIPA" }));
    h.state.grants.set(grantId("other-person", "OTHER"), grant({ uid: "other-person", courseId: "OTHER" }));
    const response = await h.request("/del/me");
    assert.equal(response.status, 200);
    assert.equal(response.json.courses.length, 1);
    assert.equal(response.json.courses[0].id, COURSE);
    assert.equal(response.json.courses[0].entryUrl, CONTENT);
    assert.deepEqual(h.state.reads, [COURSE, "OTHER"].map(id => ({ collection: "del_access", id: grantId(UID, id) })));
    assert.equal(h.state.cookieCalls[0].revoked, true);
    noCache(response);
});

test("malformed, wrong-owner, expired, revoked and wrong-course grants all deny content", async t => {
    const h = await harness(t);
    const invalid = [
        { schema: 2 }, { uid: "someone-else" }, { courseId: "OTHER" }, { status: "revoked" },
        { role: "admin" }, { expiresAt: new Timestamp(NOW) }, { expiresAt: new Timestamp(NaN) },
        { expiresAt: new Timestamp(9e15) }, { expiresAt: "2030-01-01" }, { expiresAt: { seconds: 2000000000 } },
        { role: "trainer" }, { role: "lto_admin", organizationId: "../OTHER" }
    ];
    for (const value of invalid) {
        h.state.grants.set(grantId(UID, COURSE), grant(value));
        const response = await h.request(CONTENT);
        assert.equal(response.status, 403, JSON.stringify(value));
        assert.ok(!response.body.includes("Private pilot"));
        noCache(response);
    }
    h.state.grants.clear();
    assert.equal((await h.request(CONTENT)).status, 403);
});

test("trainer and LTO content grants require a matching active organization on each request", async t => {
    const h = await harness(t);
    const organizationId = "ORG-LAAU-X7K4P2MN";
    for (const role of ["trainer", "lto_admin"]) {
        h.state.grants.set(grantId(UID, COURSE), grant({ role, organizationId }));
        h.state.organizations.clear();
        assert.equal((await h.request(CONTENT)).status, 403);
        h.state.organizations.set(organizationId, { organizationId, status: "active" });
        assert.equal((await h.request(CONTENT)).status, 200);
        h.state.organizations.set(organizationId, { organizationId, status: "suspended" });
        assert.equal((await h.request(CONTENT)).status, 403);
        h.state.organizations.set(organizationId, { organizationId: "OTHER", status: "active" });
        assert.equal((await h.request(CONTENT)).status, 403);
    }
});

test("a revoked session, unverified email or malformed UID denies before grant lookup", async t => {
    const h = await harness(t);
    h.state.revoked = true;
    assert.equal((await h.request(CONTENT)).status, 401);
    h.state.revoked = false;
    h.state.user.email_verified = false;
    assert.equal((await h.request(CONTENT)).status, 401);
    h.state.user.email_verified = true;
    h.state.user.uid = "bad\0uid";
    assert.equal((await h.request(CONTENT)).status, 401);
    assert.deepEqual(h.state.reads, []);
    assert.ok(h.state.cookieCalls.every(call => call.revoked === true));
});

test("one course grant cannot read another course, unpublished topics or unmanifested files", async t => {
    const h = await harness(t);
    for (const [url, status] of [
        ["/del/content/OTHER/environments/other/index.html", 403],
        ["/del/content/AIPA/environments/classic-agile/index.html", 404],
        ["/del/content/UNKNOWN/environments/classic-agile/index.html", 404],
        ["/del/content/DEL-PILOT/environments/other/index.html", 404],
        ["/del/content/DEL-PILOT/environments/classic-agile/missing.html", 404],
        ["/del/content/DEL-PILOT/scenario-packs/aipa/briefing.html", 404]
    ]) {
        const response = await h.request(url);
        assert.equal(response.status, status, url);
        assert.ok(!response.body.includes("private content"));
    }
});

test("raw traversal, encoded separators, double encoding, hidden files and backups cannot bypass the manifest", async t => {
    const h = await harness(t);
    for (const part of [
        "environments/classic-agile/../../other/index.html",
        "environments/classic-agile/%2e%2e/other/index.html",
        "environments%2fclassic-agile/index.html",
        "environments%5cclassic-agile/index.html",
        "environments/classic-agile/%252e%252e/index.html",
        "environments/classic-agile//index.html",
        "environments/classic-agile/.env",
        "environments/classic-agile/assets/js/environment-monolith-backup.js",
        "environments/classic-agile/README.md"
    ]) {
        const response = await h.request("/del/content/DEL-PILOT/" + part);
        assert.equal(response.status, 404, part);
        assert.ok(!response.body.includes("Private pilot"));
    }
});

test("HTML, CSS and script paths stay in authorized course context; navigation returns to Lab", async t => {
    const h = await harness(t);
    const response = await h.request(CONTENT);
    assert.equal(response.status, 200);
    assert.match(response.body, /href="\/del\/content\/DEL-PILOT\/assets\/css\/lab.css"/);
    assert.match(response.body, /href="\/del\/content\/DEL-PILOT\/scenario-packs\/aipa\/briefing.html"/);
    assert.match(response.body, /src="\.\/assets\/js\/scenario.js"/);
    assert.match(response.body, /Return to your Lab workspace/);
    assert.ok(!response.body.includes("<base"));
    assert.ok(response.body.includes('window.__LAAU_DEL_SCOPE__="' + grantId(UID, COURSE) + '"'));
    assert.ok(response.body.indexOf("__LAAU_DEL_SCOPE__") < response.body.indexOf('src="./assets/js/scenario.js"'));
    assert.match(response.body, /src="\/del\/content\/DEL-PILOT\/del-storage.js"/);
    assert.equal((await h.request("/del/content/DEL-PILOT/del-storage.js")).status, 200);
    assert.equal((await h.request("/del/content/DEL-PILOT/del-storage.js/extra.js")).status, 404);
    assert.equal((await h.request("/del/content/DEL-PILOT/environments/classic-agile/")).status, 200);
    const script = await h.request("/del/content/DEL-PILOT/environments/classic-agile/assets/js/scenario.js");
    assert.match(script.body, /"\/del\/content\/DEL-PILOT\/environments\/classic-agile\/outcomes\/"/);
    assert.match(script.body, /leave = "\/"/);
    const css = await h.request("/del/content/DEL-PILOT/assets/css/lab.css");
    assert.match(css.body, /url\(\/del\/content\/DEL-PILOT\/assets\/images\/preview.png\)/);
});

test("access is refreshed for every file and no conditional or range request can bypass expiry", async t => {
    const h = await harness(t);
    const response = await h.request(CONTENT, { headers: { Range: "bytes=0-2", "If-None-Match": "*", "If-Modified-Since": "Wed, 23 Sep 2037 12:00:00 GMT" } });
    assert.equal(response.status, 200);
    assert.match(response.body, /Private pilot scenario/);
    assert.equal(response.headers.etag, undefined);
    assert.equal(response.headers["content-range"], undefined);
    assert.equal(response.headers["accept-ranges"], "none");
    assert.match(response.headers["content-security-policy"], /frame-ancestors 'self'/);
    noCache(response);
    h.state.now += 3600000;
    const expired = await h.request(CONTENT, { headers: { "If-None-Match": "*" } });
    assert.equal(expired.status, 403);
    noCache(expired);
    assert.equal(h.state.cookieCalls.length, 2);
    assert.equal(h.state.reads.length, 2);
});

test("changed file bytes and symlink metadata fail closed without sending any private bytes", async t => {
    const h = await harness(t);
    const filename = path.join(h.root, ENTRY);
    await fs.promises.writeFile(filename, "SECRET changed bytes");
    const changed = await h.request(CONTENT);
    assert.equal(changed.status, 503);
    assert.ok(!changed.body.includes("SECRET"));
    // Inject only symlink metadata, so the same security test also runs on Windows
    // accounts without the operating-system privilege to create actual symlinks.
    const linkedFs = { ...fs, promises: { ...fs.promises, async lstat(name) {
        const info = await fs.promises.lstat(name);
        if (name.endsWith(path.join("environments", "classic-agile", "index.html"))) {
            return { isSymbolicLink: () => true, isDirectory: () => false, isFile: () => true };
        }
        return info;
    } } };
    const linkedHarness = await harness(t, { fs: linkedFs });
    const linked = await linkedHarness.request(CONTENT);
    assert.equal(linked.status, 503);
    assert.ok(!linked.body.includes("Private pilot"));
    noCache(linked);
});

test("database errors remain service failures rather than granting access or hiding a failure as no courses", async t => {
    const h = await harness(t);
    h.state.dbFailure = true;
    for (const endpoint of ["/del/me", CONTENT]) {
        const response = await h.request(endpoint);
        assert.equal(response.status, 503);
        assert.deepEqual(response.json, { error: "service_unavailable" });
        assert.ok(!response.body.includes("PERMISSION_DENIED"));
        noCache(response);
    }
});

test("invalid catalogues, unsafe manifest entries and duplicate file records cannot start a content router", () => {
    const data = fixture();
    const basics = { admin: { auth: () => ({}) }, db: {}, catalog: data.catalog, manifest: data.manifest };
    for (const name of ["../index.html", "environments/classic-agile/backup.js", "catalog.json", "secrets.json", "private/.env", "notes.md"]) {
        assert.throws(() => createDelRouter({ ...basics, manifest: { schema: 1, files: [{ path: name, sha256: "a".repeat(64) }] } }), /manifest/);
    }
    assert.throws(() => createDelRouter({ ...basics, manifest: { schema: 1, files: [data.manifest.files[0], data.manifest.files[0]] } }), /manifest/);
    assert.throws(() => createDelRouter({ ...basics, catalog: { schema: 1, courses: [{ ...data.catalog.courses[0], prefixes: ["environments/classic-agile"] }] } }), /published/);
    assert.throws(() => createDelRouter({ ...basics, catalog: { schema: 1, courses: [{ ...data.catalog.courses[0], entry: "environments/other/index.html" }] } }), /published/);
});

test("malformed JSON and oversized session bodies are rejected before any identity exchange", async t => {
    const h = await harness(t);
    const headers = { Origin: ORIGIN, Authorization: "Bearer firebase-id-token-value", "Content-Type": "application/json" };
    for (const body of ["{", JSON.stringify({ padding: "a".repeat(3000) })]) {
        const response = await h.request("/del/session", { method: "POST", headers, body });
        assert.equal(response.status, 400);
        assert.equal(response.json.error, "invalid_request");
    }
    assert.deepEqual(h.state.tokenCalls, []);
});
