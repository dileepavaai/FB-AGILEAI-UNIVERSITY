/* =========================================================
   RUNTIME CHECK REGISTRY
   Scope: Runtime & SDK Governance (Observational)
   Enforcement: NONE (Non-blocking)
   Authority: governance/runtime-governance.md
========================================================= */

const { corsPreflightCheck } = require("./runtime-self-check.js");

/**
 * 🔒 REGISTRY RULES (LOCKED)
 *
 * 1. Declarative only
 * 2. No mutations
 * 3. No enforcement
 * 4. Phase is informational
 * 5. Severity is advisory
 */

const RUNTIME_CHECKS = Object.freeze([
  Object.freeze({
    id: "CORS_PREFLIGHT_PORTAL_RESOLVER",
    description:
      "Validate CORS preflight handling for resolvePortalEntitlements endpoint",
    phase: "Phase-3",
    severity: "WARN",
    run: corsPreflightCheck,
  }),
]);

function getRegisteredChecks() {
  return [...RUNTIME_CHECKS];
}

module.exports = {
  getRegisteredChecks,
};
