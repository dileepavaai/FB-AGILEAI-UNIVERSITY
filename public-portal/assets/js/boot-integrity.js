/* =========================================================
   Portal Boot Integrity — Phase-1.7.3 (DEV-ONLY, GOVERNED)
   FINAL · LOCKED · PRODUCTION-SAFE (OBSERVATIONAL ONLY)

   PURPOSE:
   - Verify boot sequence completed
   - Detect regressions WITHOUT blocking UI
   - Tolerate async resolver + auth ordering
   - Never gate credential or executive visibility
   ========================================================= */

(function () {
  "use strict";

  const isDev =
    location.hostname === "localhost" ||
    location.hostname.endsWith(".web.app") ||
    new URLSearchParams(location.search).has("dev");

  let evaluated = false;
  let evaluationScheduled = false;
  let authReadyObserved = false;

  let credentialsObserved = false;
  let credentialsRendered = false;

  /* =====================================================
     ENTRYPOINTS — EVENT-AWARE
     ===================================================== */

  document.addEventListener("entitlements:ready", attemptEvaluate);

  document.addEventListener("credentials:ready", () => {
    credentialsObserved = true;
    attemptEvaluate();
  });

  document.addEventListener("credentials:rendered", () => {
    credentialsRendered = true;
    attemptEvaluate();
  });

  if (window.portalEntitlementData?.checked === true) {
    attemptEvaluate();
  }

  /* =====================================================
     AUTH READINESS (OBSERVATIONAL · NON-BLOCKING)
     ===================================================== */

  if (window.__AAIU_AUTH_READY__ instanceof Promise) {
    window.__AAIU_AUTH_READY__
      .then(() => {
        authReadyObserved = true;
        attemptEvaluate();
      })
      .catch(() => {
        authReadyObserved = true; // even failure is a resolved state
        attemptEvaluate();
      });
  } else {
    authReadyObserved = true; // legacy / unexpected, tolerate
  }

  /* =====================================================
     SAFE EVALUATION GATE (ASYNC-TOLERANT)
     ===================================================== */
  function attemptEvaluate() {
    if (evaluated || evaluationScheduled) return;
    if (!window.__dashboardGatingRan) return;
    if (!authReadyObserved) return;

    evaluationScheduled = true;
    setTimeout(evaluateIntegrity, 0);
  }

  /* =====================================================
     CORE EVALUATION (NON-BLOCKING)
     ===================================================== */
  function evaluateIntegrity() {
    if (evaluated) return;
    evaluated = true;

    const warnings = [];
    const errors = [];

    /* 1️⃣ AUTH / ENTITLEMENT */
    if (window.execEntitlement?.checked !== true) {
      warnings.push(
        "Auth resolution not confirmed at integrity check (async tolerated)"
      );
    }

    /* 2️⃣ ENTITLEMENT DATA */
    if (window.portalEntitlementData?.checked !== true) {
      warnings.push(
        "portalEntitlementData not finalized at integrity check"
      );
    }

    /* 3️⃣ RESOLVER */
    if (typeof window.resolvePortalEntitlements !== "function") {
      errors.push("resolvePortalEntitlements is missing");
    }

    if (!window.__resolverInvoked) {
      warnings.push(
        "Resolver not invoked yet at integrity check (async tolerated)"
      );
    }

    /* 4️⃣ DASHBOARD GATING */
    if (!window.__dashboardGatingRan) {
      errors.push("dashboard-gating.js did not execute");
    }

    /* 5️⃣ CREDENTIAL OBSERVATION */
    const hasCredentials =
      window.portalEntitlementData?.credentials?.length > 0;

    if (
      hasCredentials &&
      !credentialsObserved &&
      !credentialsRendered
    ) {
      warnings.push(
        "Credentials exist but not yet observed/rendered"
      );
    }

    /* 6️⃣ EXECUTIVE INSIGHT BINDING */
    const execSection =
      document.getElementById("exec-insight-section");
    const daysEl =
      document.getElementById("exec-days-remaining");

    if (
      execSection &&
      !execSection.classList.contains("hidden") &&
      (!daysEl || !daysEl.textContent?.trim())
    ) {
      warnings.push(
        "Executive Insight visible before days-remaining bound (async tolerated)"
      );
    }

    /* 7️⃣ AUTH PROVIDER INTEGRITY (EMAIL-FIRST, LEGACY OK) */
    if (window.firebase?.auth?.().currentUser) {
      const providers =
        firebase.auth().currentUser.providerData?.map(
          p => p.providerId
        ) || [];

      const STRICT_ALLOWED = ["password", "emailLink"];
      const LEGACY_ALLOWED = ["google.com"];

      const invalidProviders = providers.filter(
        p =>
          !STRICT_ALLOWED.includes(p) &&
          !LEGACY_ALLOWED.includes(p)
      );

      if (invalidProviders.length > 0) {
        errors.push(
          `Disallowed auth provider(s): ${invalidProviders.join(", ")}`
        );
      }

      if (providers.some(p => LEGACY_ALLOWED.includes(p))) {
        warnings.push(
          "Legacy auth provider detected (allowed, deprecated)"
        );
      }
    }

    /* =====================================================
       RESULT (OBSERVATIONAL ONLY)
       ===================================================== */
    if (errors.length > 0) {
      console.error("[PORTAL BOOT INTEGRITY FAILED]", errors);
      if (isDev) showBadge("Portal Integrity FAILED", false);
      return;
    }

    if (warnings.length > 0) {
      console.warn("[PORTAL BOOT INTEGRITY WARNINGS]", warnings);
      if (isDev) showBadge("Portal Integrity WARN", "warn");
      return;
    }

    console.log("[PORTAL BOOT INTEGRITY] OK");
    if (isDev) showBadge("Portal Integrity OK", true);
  }

  /* =====================================================
     DEV BADGE (NON-INTRUSIVE)
     ===================================================== */
  function showBadge(text, state) {
    const badge = document.createElement("div");
    badge.textContent = text;

    const color =
      state === true
        ? "#0f9d58"
        : state === "warn"
        ? "#f9ab00"
        : "#d93025";

    badge.style.position = "fixed";
    badge.style.bottom = "12px";
    badge.style.right = "12px";
    badge.style.padding = "6px 10px";
    badge.style.fontSize = "12px";
    badge.style.fontFamily = "system-ui, sans-serif";
    badge.style.borderRadius = "6px";
    badge.style.zIndex = "9999";
    badge.style.pointerEvents = "none";
    badge.style.background = color;
    badge.style.color = "#fff";
    badge.style.boxShadow =
      "0 2px 6px rgba(0,0,0,0.2)";

    document.body.appendChild(badge);
  }
})();
