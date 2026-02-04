/* =========================================================
   Dashboard Gating — Phase-9.3.15 (RESOLVER-LED, GOVERNED)
   FINAL · LOCKED · PRODUCTION-SAFE
   ========================================================= */

(function () {
  "use strict";

  console.log(
    "[Dashboard Gating] Initializing (Resolver-led · Phase-9.3.15)"
  );

  window.__dashboardGatingRan = true;

  let credentialsRendered = false;
  let credentialsObserved = false;
  let renderAttempted = false;

  let lastAuthUid = null;
  let resolverInvokedAfterAuth = false;

  function evaluateAndRender(reason) {
    const data = window.portalEntitlementData;
    if (!data || data.checked !== true) return;

    if (typeof window.resolvePortalEntitlements !== "function") {
      console.error("[Dashboard Gating] Resolver missing");
      return;
    }

    window.__resolverInvoked = true;

    const state = window.resolvePortalEntitlements({
      executiveEntitlement: data.executiveEntitlement || null,
      userEntitlements: data.userEntitlements || null,
      credentials: Array.isArray(data.credentials)
        ? data.credentials
        : [],
      authenticatedUser: data.email
        ? { email: data.email }
        : null
    });

    /* -------------------------------------------------------
       ✅ GOVERNED HANDOFF — EXPLICIT ENTITLEMENT PUBLICATION
       ------------------------------------------------------- */
    if (typeof window.publishPortalEntitlements === "function") {
      window.publishPortalEntitlements(state);
    }

    console.log(
      `[Dashboard Gating] Resolved entitlement state (${reason})`,
      state
    );

    console.assert(
      !Array.isArray(state.visibleCredentials) ||
        state.visibleCredentials.every(
          c => c && typeof c.program_code === "string"
        ),
      "[Dashboard Gating Invariant] visibleCredentials missing program_code"
    );

    /* -------------------------------------------------------
       EXECUTIVE INSIGHT
       ------------------------------------------------------- */
    const execSection =
      document.getElementById("exec-insight-section");
    const validUntilRow =
      document.getElementById("exec-valid-until-row");
    const validUntilEl =
      document.getElementById("exec-valid-until");
    const daysRemainingEl =
      document.getElementById("exec-days-remaining");

    if (state.executiveInsight?.hasAccess === true) {
      execSection?.classList.remove("hidden");
      validUntilRow?.classList.remove("hidden");

      const raw = state.executiveInsight.validUntil;
      const validUntilDate =
        raw?.toDate?.() || (raw ? new Date(raw) : null);

      if (validUntilEl) {
        validUntilEl.textContent = validUntilDate
          ? validUntilDate.toLocaleDateString()
          : "—";
      }

      if (daysRemainingEl && validUntilDate) {
        const daysRemaining = Math.max(
          0,
          Math.ceil(
            (validUntilDate - new Date()) / 86400000
          )
        );
        daysRemainingEl.textContent =
          `(${daysRemaining} days remaining)`;
      }
    } else {
      validUntilRow?.classList.add("hidden");
    }

    /* -------------------------------------------------------
       CREDENTIAL VISIBILITY
       ------------------------------------------------------- */
    if (
      Array.isArray(state.visibleCredentials) &&
      state.visibleCredentials.length > 0
    ) {
      document
        .getElementById("student-dashboard-section")
        ?.classList.remove("hidden");
    }

    /* -------------------------------------------------------
       CREDENTIAL RENDERING (ONCE)
       ------------------------------------------------------- */
    if (
      !credentialsRendered &&
      Array.isArray(state.visibleCredentials) &&
      state.visibleCredentials.length > 0 &&
      typeof window.renderCredentials === "function"
    ) {
      const container =
        document.getElementById("credentials-container");
      if (!container) return;

      renderAttempted = true;
      credentialsRendered = true;

      console.log(
        "[Dashboard Gating] Rendering credentials:",
        state.visibleCredentials.length
      );

      window.renderCredentials(state.visibleCredentials);
    }

    if (
      renderAttempted &&
      Array.isArray(state.visibleCredentials) &&
      state.visibleCredentials.length > 0
    ) {
      console.assert(
        credentialsObserved || credentialsRendered,
        "[BOOT-INTEGRITY] Credentials present but never observed or rendered"
      );
    }

    console.log("[Dashboard Gating] Evaluation complete");
  }

  if (window.__AAIU_AUTH_READY__ instanceof Promise) {
    window.__AAIU_AUTH_READY__.then(state => {
      const user = state?.user;
      if (!user) return;

      if (user.uid === lastAuthUid && resolverInvokedAfterAuth) {
        return;
      }

      lastAuthUid = user.uid;
      resolverInvokedAfterAuth = true;

      evaluateAndRender("auth-ready");
    });
  }

  document.addEventListener("entitlements:ready", () => {
    evaluateAndRender("entitlements");
  });

  document.addEventListener("credentials:ready", () => {
    credentialsObserved = true;
    credentialsRendered = false;
    evaluateAndRender("credentials");
  });

  document.addEventListener("DOMContentLoaded", () => {
    evaluateAndRender("dom");
  });

})();
