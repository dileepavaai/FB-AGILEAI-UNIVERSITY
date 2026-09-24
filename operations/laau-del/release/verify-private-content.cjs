#!/usr/bin/env node
"use strict";

// Release guard only: hash the exact bytes that the runtime will read. Never
// rewrite content, normalize line endings, or update the trusted manifest.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const EXTENSIONS = new Set([
    ".html", ".js", ".css", ".json", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".woff", ".woff2"
]);

function regularPath(filename, kind) {
    let info;
    try { info = fs.lstatSync(filename); }
    catch (error) { throw new Error(`Cannot inspect ${kind} ${filename}: ${error.code || error.message}`); }
    if (info.isSymbolicLink() || (kind === "directory" ? !info.isDirectory() : !info.isFile())) {
        throw new Error(`Expected a regular ${kind}, without symlinks: ${filename}`);
    }
    return info;
}

function directoryChain(directory) {
    const root = path.parse(directory).root;
    regularPath(root, "directory");
    let current = root;
    for (const segment of path.relative(root, directory).split(path.sep).filter(Boolean)) {
        current = path.join(current, segment);
        regularPath(current, "directory");
    }
}

function readRegularFile(filename) {
    const before = regularPath(filename, "file");
    let fd;
    try {
        // O_NOFOLLOW is an additional defense where the platform supports it;
        // explicit lstat checks also cover platforms without this flag.
        fd = fs.openSync(filename, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
        const opened = fs.fstatSync(fd);
        if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino) {
            throw new Error(`File changed while opening: ${filename}`);
        }
        return fs.readFileSync(fd);
    } finally {
        if (fd !== undefined) fs.closeSync(fd);
    }
}

function safeContentPath(value) {
    if (typeof value !== "string" || !value || value.length > 512 ||
        !/^[A-Za-z0-9_./-]+$/.test(value) || value.startsWith("/") || value.includes("//")) return false;
    const segments = value.split("/");
    if (segments.some(segment => !segment || segment.startsWith(".") || segment.endsWith(".") ||
        /(?:^|[-_])(?:legacy|archives?|backups?|secrets?|credentials?|node_modules)(?:$|[-_.])/i.test(segment) ||
        /^(?:package(?:-lock)?\.json|Dockerfile|manifest\.json|catalog\.json)$/i.test(segment) ||
        /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(segment))) return false;
    return EXTENSIONS.has(path.posix.extname(value).toLowerCase());
}

function record(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateManifest(manifest) {
    if (!record(manifest) || manifest.schema !== 1 || !Array.isArray(manifest.files) || !manifest.files.length ||
        Object.keys(manifest).some(key => !["schema", "files"].includes(key))) {
        throw new Error("Invalid DEL manifest schema: expected schema 1 and a nonempty files array");
    }
    const seen = new Set();
    for (const entry of manifest.files) {
        if (!record(entry) || Object.keys(entry).some(key => !["path", "sha256", "contentType"].includes(key)) ||
            !safeContentPath(entry.path) || typeof entry.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(entry.sha256) ||
            (entry.contentType !== undefined && (typeof entry.contentType !== "string" ||
                !/^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+(?:; charset=utf-8)?$/.test(entry.contentType)))) {
            throw new Error("Invalid DEL manifest file entry: expected a safe path, lowercase SHA-256 and valid metadata");
        }
        // Reject case aliases as well: the same release must work on Windows
        // staging hosts and case-sensitive container filesystems.
        const key = entry.path.toLowerCase();
        if (seen.has(key)) throw new Error(`Duplicate DEL manifest path: ${entry.path}`);
        seen.add(key);
    }
}

function verifyPrivateContent(delDirectory) {
    if (typeof delDirectory !== "string" || !delDirectory || delDirectory.includes("\0")) {
        throw new Error("A DEL directory is required");
    }
    const delRoot = path.resolve(delDirectory);
    directoryChain(delRoot);
    const manifestPath = path.join(delRoot, "manifest.json");
    let manifest;
    try { manifest = JSON.parse(readRegularFile(manifestPath).toString("utf8")); }
    catch (error) { throw new Error(`Cannot read DEL manifest: ${error.message}`); }
    validateManifest(manifest);

    const privateRoot = path.join(delRoot, "private");
    regularPath(privateRoot, "directory");
    let totalBytes = 0;
    for (const entry of manifest.files) {
        let filename = privateRoot;
        const segments = entry.path.split("/");
        for (let index = 0; index < segments.length; index++) {
            filename = path.join(filename, segments[index]);
            if (index < segments.length - 1) regularPath(filename, "directory");
        }
        const bytes = readRegularFile(filename);
        const actual = crypto.createHash("sha256").update(bytes).digest("hex");
        if (actual !== entry.sha256) {
            throw new Error(`SHA-256 mismatch for ${entry.path}: expected ${entry.sha256}, actual ${actual}`);
        }
        totalBytes += bytes.length;
    }
    return Object.freeze({ fileCount: manifest.files.length, totalBytes });
}

module.exports = { verifyPrivateContent };

if (require.main === module) {
    if (process.argv.length !== 3) {
        console.error("Usage: node verify-private-content.cjs <aau-backend/del>");
        process.exitCode = 2;
    } else {
        try {
            const result = verifyPrivateContent(process.argv[2]);
            console.log(`DEL private content verified: ${result.fileCount} files, ${result.totalBytes} raw bytes`);
        } catch (error) {
            console.error(`DEL private content verification failed: ${error.message}`);
            process.exitCode = 1;
        }
    }
}
