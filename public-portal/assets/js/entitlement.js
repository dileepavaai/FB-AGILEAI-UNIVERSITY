/* =====================================================
   User Entitlement Resolution

   Version : Phase-6.7
   Status  : ACTIVE

   Change History

   Phase-6.7
   -----------------------------------------
   - Replaced authState.token dependency
   - Uses Firebase getIdToken() directly
   - Prevents stale or missing token issues
   - Aligns entitlement resolution with
     Firebase authentication lifecycle

   Phase-6.6
   -----------------------------------------
   - API-driven entitlement resolution
   - Deterministic event emission
   - Resolver-led architecture

===================================================== */

(function () {
  "use strict";

  /* =====================================================
     🔒 SINGLE GLOBAL STATE (AUTHORITATIVE)
     ===================================================== */
  window.execEntitlement = {
    checked: false,
    entitled: false,
    student: false,
    expired: false,
    email: null,
    plan: null,
    source: null,
    validUntil: null
  };

  /* =====================================================
     FINALIZE + EMIT (ORDER GUARANTEED)
     ===================================================== */
  function finalizeAndEmit(portalData) {
    console.assert(
      Array.isArray(portalData.credentials),
      "[Entitlement Invariant] credentials missing at finalize"
    );

    window.portalEntitlementData = portalData;
    window.execEntitlement.checked = true;

    document.dispatchEvent(new Event("entitlements:ready"));

    if (portalData.credentials.length > 0) {
      document.dispatchEvent(new Event("credentials:ready"));
    }
  }

  /* =====================================================
     API ENDPOINT (LOCKED)
     ===================================================== */
  const RESOLVE_API =
    "https://asia-south1-fb-agileai-university.cloudfunctions.net/resolvePortalEntitlements";

  /* =====================================================
     AUTH READINESS — SINGLE SOURCE OF TRUTH
     ===================================================== */
  if (!(window.__AAIU_AUTH_READY__ instanceof Promise)) {
    console.error("[Entitlement] Auth readiness contract missing");

    finalizeAndEmit({
      checked: true,
      email: null,
      executiveEntitlement: null,
      userEntitlements: null,
      credentials: []
    });

    return;
  }

  window.__AAIU_AUTH_READY__.then(async (authState) => {
    const user = authState?.user;

    // Reset authoritative flags per auth cycle
    Object.assign(window.execEntitlement, {
      checked: false,
      entitled: false,
      student: false,
      expired: false,
      email: null,
      plan: null,
      source: null,
      validUntil: null
    });

    if (!user) {
      window.execEntitlement.source = "none";

      finalizeAndEmit({
        checked: true,
        email: null,
        executiveEntitlement: null,
        userEntitlements: null,
        credentials: []
      });

      return;
    }

    try {
      const email = user.email?.toLowerCase() || null;
      window.execEntitlement.email = email;

      /* -------------------------------------------------
        PHASE-6.7
        Obtain fresh Firebase ID token directly from
        authenticated user.

        Rationale:
        Avoids dependency on authState.token and
        ensures entitlement API always receives a
        current Firebase token.
      ------------------------------------------------- */

      const token =
        await user.getIdToken();

      if (!token) {
        throw new Error(
          "Unable to obtain Firebase ID token"
        );
      }

      const res = await fetch(RESOLVE_API, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error(`Entitlement API failed (${res.status})`);
      }

      const data = await res.json();

      const executive = data.executiveEntitlement;
      const userEntitlements = data.userEntitlements;
      const credentials = Array.isArray(data.credentials)
        ? data.credentials
        : [];

      /* -------------------------------------------------
         PAID EXECUTIVE — ALWAYS WINS
         ------------------------------------------------- */
      if (executive && executive.entitled === true) {
        window.execEntitlement.entitled = true;
        window.execEntitlement.student = true;
        window.execEntitlement.plan = "executive_paid";
        window.execEntitlement.source = "executiveEntitlements";
        window.execEntitlement.validUntil =
          executive.validUntil ? new Date(executive.validUntil) : null;

        finalizeAndEmit({
          checked: true,
          email,
          executiveEntitlement: {
            ...executive,
            validUntil: window.execEntitlement.validUntil
          },
          userEntitlements: null,
          credentials
        });

        console.log("[Entitlement] Resolved (PAID)", window.execEntitlement);
        return;
      }

      /* -------------------------------------------------
         TRIAL / USER ENTITLEMENTS
         ------------------------------------------------- */
      if (userEntitlements) {
        const now = Date.now();

        const trialActive =
          userEntitlements.plan === "trial" &&
          userEntitlements.trial_end?.toMillis &&
          now <= userEntitlements.trial_end.toMillis();

        window.execEntitlement.plan = userEntitlements.plan;
        window.execEntitlement.source = "user_entitlements";
        window.execEntitlement.student =
          trialActive &&
          userEntitlements.entitlements?.student_portal === true;
        window.execEntitlement.entitled =
          trialActive &&
          userEntitlements.entitlements?.executive_insight === true;
        window.execEntitlement.expired =
          userEntitlements.plan === "trial" && !trialActive;
      }

      finalizeAndEmit({
        checked: true,
        email,
        executiveEntitlement: null,
        userEntitlements,
        credentials
      });

      console.log("[Entitlement] Resolved", window.execEntitlement);

    } catch (err) {
      console.error("[Entitlement] Resolution failed", err);

      finalizeAndEmit({
        checked: true,
        email: user.email || null,
        executiveEntitlement: null,
        userEntitlements: null,
        credentials: []
      });
    }
  });
})();
