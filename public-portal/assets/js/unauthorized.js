/* =====================================================
   Unauthorized Page Controller

   File       : unauthorized.js
   Version    : 1.0.0
   Status     : ACTIVE
   Governance : LOCKED

   PURPOSE

   Handles user actions on the
   Unauthorized Access page.

   Responsibilities

   - Sign Out
   - Public Website Navigation

   Non-Responsibilities

   - Authentication
   - Authorization
   - Entitlement Resolution
   - Credential Rendering

   Change History

   v1.0.0
   -----------------------------------------
   - Initial implementation
   - Sign-out workflow
   - Unauthorized page actions

===================================================== */

(function () {

  "use strict";

  const btnSignOut =
    document.getElementById(
      "btnSignOut"
    );

  if (!btnSignOut) {
    return;
  }

  btnSignOut.addEventListener(
    "click",
    async () => {

      try {

        await firebase.auth().signOut();

        window.location.href = "/";

      } catch (err) {

        console.error(
          "[Unauthorized] Sign out failed",
          err
        );

      }

    }
  );

})();