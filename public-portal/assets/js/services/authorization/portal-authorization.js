/* =========================================================
   Portal Authorization Service
   File: portal-authorization.js

   Version : 2.0.1
   Status  : DIAGNOSTIC
   Governance : LOCKED

   PURPOSE

   Authoritative portal access decision.

   INPUT
   - Resolver output only

   OUTPUT
   - true  = access granted
   - false = access denied

   NO UI LOGIC
   NO REDIRECTS
   NO FIRESTORE
   NO SIDE EFFECTS

   ========================================================= */

(function () {

  "use strict";

  window.authorizePortalAccess = function (state) {

    console.group(
      "[Portal Authorization]"
    );

    console.log(
      "[Authorization Input]",
      state
    );

    if (!state || typeof state !== "object") {

      console.warn(
        "[Authorization Result] DENIED - Invalid State"
      );

      console.groupEnd();

      return false;
    }

    console.log(
      "[Authorization State]",
      {
        executiveAccess:
          state.executiveInsight?.hasAccess || false,

        portalAccess:
          state.portalAccess?.hasAccess || false,

        portalType:
          state.portalAccess?.type || null,

        credentialCount:
          Array.isArray(
            state.visibleCredentials
          )
            ? state.visibleCredentials.length
            : 0
      }
    );

    /* -----------------------------------------------------
       EXECUTIVE ACCESS
       ----------------------------------------------------- */

    if (
      state.executiveInsight?.hasAccess === true
    ) {

      console.log(
        "[Authorization Result] GRANTED - Executive"
      );

      console.groupEnd();

      return true;
    }

    /* -----------------------------------------------------
       PORTAL ACCESS
       ----------------------------------------------------- */

    if (
      state.portalAccess?.hasAccess === true
    ) {

      console.log(
        "[Authorization Result] GRANTED - Portal"
      );

      console.groupEnd();

      return true;
    }

    /* -----------------------------------------------------
       DEFAULT DENY
       ----------------------------------------------------- */

    console.warn(
      "[Authorization Result] DENIED"
    );

    console.groupEnd();

    return false;
  };

})();