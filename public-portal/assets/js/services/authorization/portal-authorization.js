/* =========================================================
   Portal Authorization Service
   File: portal-authorization.js

   Version : 2.0.0
   Status  : ACTIVE
   Governance : LOCKED

   PURPOSE

   Authoritative portal access decision.

   INPUT
   - Resolver output only

   OUTPUT
   - true  = access granted
   - false = access denied

   RULES

   Executive users:
   - Allowed

   Student Portal users:
   - Allowed

   All others:
   - Denied

   NO UI LOGIC
   NO REDIRECTS
   NO FIRESTORE
   NO SIDE EFFECTS

   Resolver remains the single source of truth.
   ========================================================= */

(function () {

  "use strict";

  window.authorizePortalAccess = function (state) {

    if (!state || typeof state !== "object") {
      return false;
    }

    /* -----------------------------------------------------
       EXECUTIVE ACCESS
       ----------------------------------------------------- */

    if (
      state.executiveInsight?.hasAccess === true
    ) {
      return true;
    }

    /* -----------------------------------------------------
       PORTAL ACCESS
       ----------------------------------------------------- */

    if (
      state.portalAccess?.hasAccess === true
    ) {
      return true;
    }

    /* -----------------------------------------------------
       DEFAULT DENY
       ----------------------------------------------------- */

    return false;
  };

})();