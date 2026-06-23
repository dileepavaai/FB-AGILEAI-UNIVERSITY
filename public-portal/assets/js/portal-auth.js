/* ============================================================
Agile AI University Portal
Portal Authentication Controller

File       : portal-auth.js
Version    : 1.2.0
Status     : ACTIVE
Governance : LOCKED
Owner      : Agile AI University

Responsibilities

* Google Sign-In
* Email Magic Link Sign-In
* Auth State Resolution
* Portal UI State Management

Dependencies

* firebase-init.js
* window.AAIUAuth

Design Principles

* UI Controller Only
* No Credential Logic
* No Entitlement Logic
* No Registry Logic
* Authentication Orchestration Only

Change History

## v1.2.0

* Fixed auth readiness consistency
* Added safe email validation
* Added governance logging
* Added user-visible diagnostics
* Added defensive null protection
* Preserved existing authentication flow

## v1.0.0

* Initial MVP implementation

============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

"use strict";

console.log(
"[Portal Auth] Controller v1.2.0 initializing"
);

/* ==========================================================
COMPLETE EMAIL LINK SIGN-IN
========================================================== */

try {

if (
  window.AAIUAuth &&
  typeof window.AAIUAuth.completeEmailLinkSignIn === "function"
) {

  await window.AAIUAuth.completeEmailLinkSignIn();

  console.log(
    "[Portal Auth] Email link completion processed"
  );

}

} catch (err) {

console.error(
  "[Portal Auth] Email link sign-in failed",
  err
);

}

/* ==========================================================
DOM REFERENCES
========================================================== */

const signedOutUI =
document.getElementById("signedOutUI");

const signedInUI =
document.getElementById("signedInUI");

const userName =
document.getElementById("userName");

const userEmail =
document.getElementById("userEmail");

const btnGoogle =
document.getElementById("btnGoogle");

const btnEmailLink =
document.getElementById("btnEmailLink");

const btnSignOut =
document.getElementById("btnSignOut");

const emailInput =
document.getElementById("emailInput");

const emailStatus =
document.getElementById("emailStatus");

/* ==========================================================
UI HELPERS
========================================================== */

function showSignedOut() {

  if (signedOutUI) {

    signedOutUI.hidden = false;
    signedOutUI.style.display = "block";

  }

  if (signedInUI) {

    signedInUI.hidden = true;
    signedInUI.style.display = "none";

  }

}

function showSignedIn(user) {

  if (signedOutUI) {

    signedOutUI.hidden = true;
    signedOutUI.style.display = "none";

  }

  if (signedInUI) {

    signedInUI.hidden = false;
    signedInUI.style.display = "block";

  }

  if (userName) {
    userName.textContent =
      user?.displayName ||
      user?.email ||
      "";
  }

  if (userEmail) {
    userEmail.textContent =
      user?.email ||
      "";
  }

}

/* ==========================================================
AUTH READINESS
========================================================== */

try {


if (window.__AAIU_AUTH_READY__) {

  const authState =
    await window.__AAIU_AUTH_READY__;

  if (authState?.user) {

    console.log(
      "[Portal Auth] Existing authenticated session found"
    );

    showSignedIn(authState.user);

  } else {

    showSignedOut();

  }

  firebase.auth().onAuthStateChanged(user => {

    if (user) {

      console.log(
        "[Portal Auth] Authenticated:",
        user.email
      );

      showSignedIn(user);

    } else {

      console.log(
        "[Portal Auth] Signed out"
      );

      showSignedOut();

    }

  });

} else {

  console.warn(
    "[Portal Auth] __AAIU_AUTH_READY__ not available"
  );

  showSignedOut();

}

} catch (err) {


console.error(
  "[Portal Auth] Auth initialization failed",
  err
);

showSignedOut();

}

/* ==========================================================
GOOGLE SIGN-IN
========================================================== */

if (btnGoogle) {

btnGoogle.addEventListener(
  "click",
  async () => {

    try {

      await window.AAIUAuth.signInWithGoogle();

    } catch (err) {

      console.error(
        "[Portal Auth] Google sign-in failed",
        err
      );

    }

  }
);

}

/* ==========================================================
EMAIL MAGIC LINK
========================================================== */

if (btnEmailLink) {

btnEmailLink.addEventListener(
  "click",
  async () => {

    try {

      const email =
        emailInput?.value?.trim();

      if (!email) {

        throw new Error(
          "Please enter your email address."
        );

      }

      await window.AAIUAuth.sendEmailLink(
        email
      );

      if (emailStatus) {

        emailStatus.style.color =
          "#15803d";

        emailStatus.textContent =
          "Login link sent. Check your email.";

      }

      console.log(
        "[Portal Auth] Login link sent",
        email
      );

    } catch (err) {

      console.error(
        "[Portal Auth] Email link failed",
        err
      );

      if (emailStatus) {

        emailStatus.style.color =
          "#b91c1c";

        emailStatus.textContent =
          err?.message ||
          err?.code ||
          "Unable to send login link.";

      }

    }

  }
);

}

/* ==========================================================
SIGN OUT
========================================================== */

if (btnSignOut) {

btnSignOut.addEventListener(
  "click",
  async () => {

    try {

      await firebase.auth().signOut();

      console.log(
        "[Portal Auth] Sign out successful"
      );

    } catch (err) {

      console.error(
        "[Portal Auth] Sign out failed",
        err
      );

    }

  }
);

}

console.log(
"[Portal Auth] Controller v1.2.0 ready"
);

});
