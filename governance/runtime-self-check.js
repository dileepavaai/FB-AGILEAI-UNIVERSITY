/**
 * 🔒 Runtime Self-Check — GOVERNED
 * Non-blocking, diagnostic only
 */

"use strict";

const fs = require("fs");
const path = require("path");

const manifestPath = path.join(__dirname, "runtime-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function fail(msg) {
  console.error("❌ [RUNTIME CHECK FAILED]", msg);
}

function warn(msg) {
  console.warn("⚠️ [RUNTIME CHECK WARNING]", msg);
}

function ok(msg) {
  console.log("✅", msg);
}

/* -----------------------------------------
   Node Runtime
----------------------------------------- */
const nodeVersion = process.versions.node;
ok(`Node runtime detected: ${nodeVersion}`);

if (!nodeVersion.startsWith("20.")) {
  warn("Node runtime is not 20.x (cloud runtime governs production)");
}

/* -----------------------------------------
   Backend Dependencies
----------------------------------------- */
const pkg = require("../functions/package.json");

function checkDep(name, expected) {
  const actual = pkg.dependencies?.[name];
  if (!actual) return fail(`${name} missing`);
  if (!actual.includes(expected))
    fail(`${name} mismatch (expected ${expected}, got ${actual})`);
  else ok(`${name} = ${actual}`);
}

checkDep("firebase-functions", manifest.backend.cloudFunctions.firebaseFunctions);
checkDep("firebase-admin", manifest.backend.cloudFunctions.firebaseAdmin);
checkDep("razorpay", manifest.backend.dependencies.razorpay);

/* -----------------------------------------
   Frontend Firebase SDK (informational)
----------------------------------------- */
ok("Frontend Firebase SDK governed externally (HTML / scripts)");

console.log("🔒 Runtime self-check complete");
