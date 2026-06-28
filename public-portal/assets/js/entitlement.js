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

function finalizeAndEmit(
    portalData,
    authenticatedUser = null
) {

    console.assert(
        Array.isArray(portalData.credentials),
        "[Entitlement Invariant] credentials missing at finalize"
    );

    window.portalEntitlementData =
    Object.freeze({
        ...portalData
    });

    window.execEntitlement.checked =
        true;

    /* =====================================================
       GOVERNED RESOLUTION
    ===================================================== */

    if (
        typeof window.resolvePortalEntitlements ===
        "function"
    ) {

        const resolvedState =
            window.resolvePortalEntitlements({

                executiveEntitlement:
                    portalData.executiveEntitlement,

                userEntitlements:
                    portalData.userEntitlements,

                credentials:
                    portalData.credentials,

                authenticatedUser:
                    authenticatedUser

            });

        if (
            typeof window.publishPortalEntitlements ===
            "function"
        ) {

            window.publishPortalEntitlements(
                resolvedState
            );

            console.info(
                "[Entitlement] Shared portal state published"
            );

        }

    }

    document.dispatchEvent(
        new Event("entitlements:ready")
    );

    if (
        Array.isArray(portalData.credentials) &&
        portalData.credentials.length > 0
    ) {

        document.dispatchEvent(
            new Event("credentials:ready")
        );

    }

}

  /* =====================================================
     API ENDPOINT (LOCKED)
     ===================================================== */
  const RESOLVE_API =
      window.AAIU_CONFIG?.ENTITLEMENT_API ||
      "https://cloud-run-portal-458881040066.asia-south1.run.app/portal/resolve-entitlements";

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

        }, null);

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

      }, null);

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

      console.log(
  "[ENTITLEMENT API]",
  RESOLVE_API
);

    const res = await fetch(RESOLVE_API, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log(
      "[ENTITLEMENT STATUS]",
      res.status
    );

      if (!res.ok) {
        throw new Error(`Entitlement API failed (${res.status})`);
      }

      const data = await res.json();

      console.log(
          "[Entitlement API Response]",
          JSON.stringify(data, null, 2)
        );

      console.log(
          "[User Entitlements]",
          data.userEntitlements
        );

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
        }, user);

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
      }, user);

      console.log("[Entitlement] Resolved", window.execEntitlement);

    } catch (err) {
      console.error("🚨 ENTITLEMENT FAILURE 🚨", err);

      finalizeAndEmit({
        checked: true,
        email: user.email || null,
        executiveEntitlement: null,
        userEntitlements: null,
        credentials: []
      }, user);
    }
  });
})();
