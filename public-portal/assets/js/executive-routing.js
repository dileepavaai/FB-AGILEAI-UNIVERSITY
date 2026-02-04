/* =========================================================
   Executive Insight Routing — Phase-8 (RESOLVER-LED · SAFE)
   PURPOSE:
   - Verify executive entitlement via resolver
   - Enforce validity window
   - WAIT for Firebase Auth readiness
   - Bridge identity → sessionStorage
   - Hand off access + metadata to Executive Insight
   - NO Firestore reads
   - NO report discovery logic
   ========================================================= */

(function () {
  "use strict";

  console.log("[Executive Routing] Initializing (Resolver-led)");

  /**
   * Public entry point (used by UI buttons / links)
   */
  window.openExecutiveInsight = function () {

    /* =====================================================
       STEP 0 — Ensure entitlement data resolved
       ===================================================== */
    if (
      !window.portalEntitlementData ||
      window.portalEntitlementData.checked !== true
    ) {
      alert("Please wait a moment while your access is verified.");
      return;
    }

    const data = window.portalEntitlementData;

    /* =====================================================
       STEP 1 — Resolve entitlement (SINGLE SOURCE OF TRUTH)
       ===================================================== */
    const entitlementState = window.resolvePortalEntitlements({
      executiveEntitlement: data.executiveEntitlement || null,
      userEntitlements: data.userEntitlements || null,
      credentials: data.credentials || [],
      authenticatedUser: {
        email: data.email
      }
    });

    console.log(
      "[Executive Routing] Resolved entitlement state",
      entitlementState
    );

    /* =====================================================
       STEP 2 — Executive entitlement check (ABSOLUTE)
       ===================================================== */
    if (entitlementState.executiveInsight.hasAccess !== true) {
      redirectToPayment();
      return;
    }

    const ent = data.executiveEntitlement;

    if (!ent || !ent.validUntil) {
      redirectToPayment();
      return;
    }

    const validUntil =
      ent.validUntil.toDate?.() || new Date(ent.validUntil);

    if (validUntil < new Date()) {
      alert(
        `Your Executive Insight access expired on ${validUntil.toLocaleDateString()}.\n\nPlease renew to continue.`
      );
      redirectToPayment();
      return;
    }

    /* =====================================================
       STEP 3 — WAIT FOR FIREBASE AUTH (CRITICAL · PRESERVED)
       ===================================================== */
    if (!window.firebase?.auth) {
      console.error("[Executive Routing] Firebase Auth not available");
      alert("Authentication not ready. Please refresh and try again.");
      return;
    }

    firebase.auth().onAuthStateChanged(function (user) {
      if (!user) {
        alert("Signing you in… please try again in a moment.");
        return;
      }

      /* =====================================================
         STEP 4 — SESSION + METADATA HANDOFF (LOCKED MODEL)
         ===================================================== */
      try {
        // 🔒 Access flags (LOCKED)
        sessionStorage.setItem("execInsightUnlocked", "true");
        sessionStorage.setItem("execInsightSource", "portal");

        // 🔒 Identity (Firebase is source of truth)
        const name =
          user.displayName ||
          user.email?.split("@")[0] ||
          "—";

        const email = user.email || "—";

        sessionStorage.setItem("participantName", name);
        sessionStorage.setItem("userEmail", email);

        // 🔒 Report metadata
        sessionStorage.setItem(
          "reportIssueDate",
          ent.reportIssuedAt
            ? new Date(ent.reportIssuedAt).toISOString()
            : new Date().toISOString()
        );

        sessionStorage.setItem(
          "assessmentVersion",
          ent.assessmentVersion || "v1.0"
        );

        console.log("[Executive Routing] Session hydrated", {
          name,
          email,
          validUntil: validUntil.toISOString()
        });

      } catch (e) {
        console.error("[Executive Routing] Session storage failed", e);
      }

      /* =====================================================
         STEP 5 — REDIRECT (CANONICAL · UNCHANGED)
         ===================================================== */
      window.location.href =
        "https://assessment.agileai.university/executive-insight.html?from=portal";
    });
  };

  function redirectToPayment() {
    window.location.replace(
      "https://assessment.agileai.university/exec-payment.html"
    );
  }
})();
