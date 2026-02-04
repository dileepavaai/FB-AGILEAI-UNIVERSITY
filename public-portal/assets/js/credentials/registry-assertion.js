/* =========================================================
   Credential Registry Assertion Guard — Phase-R1
   SYSTEM · GOVERNANCE · FAIL-LOUD / RENDER-SAFE
   READ-ONLY · IDEMPOTENT · EVENT-SIGNALING
   ========================================================= */

(function () {
  "use strict";

  if (window.__credentialRegistryAssertionRan) return;
  window.__credentialRegistryAssertionRan = true;

  const CONTEXT = window.__AAIU_CONTEXT || "unknown";

  function fail(message) {
    console.error(
      "[Credential Registry Assertion FAILED]",
      message
    );
  }

  function warn(message) {
    console.warn(
      "[Credential Registry Assertion]",
      message
    );
  }

  /* =====================================================
     REGISTRY PRESENCE
     ===================================================== */

  if (!window.AAIU_CREDENTIAL_REGISTRY) {
    fail("window.AAIU_CREDENTIAL_REGISTRY is missing.");
    signalReady(false);
    return;
  }

  const registry = window.AAIU_CREDENTIAL_REGISTRY;

  if (
    typeof registry !== "object" ||
    Array.isArray(registry)
  ) {
    fail("Registry must be a plain object.");
    signalReady(false);
    return;
  }

  /* =====================================================
     ENTRY VALIDATION (DISPLAY CONTRACT ONLY)
     ===================================================== */

  let validCount = 0;

  Object.keys(registry).forEach((key) => {
    const entry = registry[key];

    if (!entry || typeof entry !== "object") {
      fail(`Registry entry '${key}' is not an object.`);
      return;
    }

    if (!entry.code) {
      fail(
        `Registry entry '${key}' is missing required field: code`
      );
    }

    if (!entry.full_title) {
      fail(
        `Registry entry '${key}' is missing required field: full_title`
      );
    }

    if (!entry.display_name && !entry.full_name) {
      warn(
        `Registry entry '${key}' has no display_name or full_name (fallbacks will apply).`
      );
    }

    validCount++;
  });

  console.log(
    `[Credential Registry Assertion] OK (${validCount} credential(s)) · context=${CONTEXT}`
  );

  /* =====================================================
     READINESS SIGNAL (NON-BLOCKING)
     ===================================================== */

  signalReady(true);

  function signalReady(ok) {
    document.dispatchEvent(
      new CustomEvent("registry:ready", {
        detail: {
          ok,
          count: validCount,
          context: CONTEXT
        }
      })
    );
  }
})();
