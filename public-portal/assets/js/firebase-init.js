/* ============================================================
Agile AI University Portal
Portal Authentication Controller

File       : portal-auth.js
Version    : 1.1.0
Status     : ACTIVE
Owner      : Agile AI University

Responsibilities:

* Google Sign-In
* Email Magic Link Sign-In
* Auth State Resolution
* Portal UI State Management

Dependencies:

* firebase-init.js

Last Updated:
2026-06-19
============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
"use strict";

/* ==========================================================
COMPLETE EMAIL LINK SIGN-IN (IF APPLICABLE)
========================================================== */
try {

if (window.AAIUAuth?.completeEmailLinkSignIn) {
  await window.AAIUAuth.completeEmailLinkSignIn();
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
  signedOutUI.style.display = "block";
}

if (signedInUI) {
  signedInUI.style.display = "none";
}

}

function showSignedIn(user) {

if (signedOutUI) {
  signedOutUI.style.display = "none";
}

if (signedInUI) {
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

if (window.AAIU_AUTH_READY) {

const authState =
  await window.__AAIU_AUTH_READY__;

if (authState?.user) {
  showSignedIn(authState.user);
} else {
  showSignedOut();
}

/* --------------------------------------------------------
   LIVE AUTH STATE SYNCHRONIZATION
   -------------------------------------------------------- */

firebase.auth().onAuthStateChanged(user => {

  if (user) {
    showSignedIn(user);
  } else {
    showSignedOut();
  }

});

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

      await window.AAIUAuth.sendEmailLink(
        email
      );

      if (emailStatus) {

        emailStatus.textContent =
          "Login link sent. Check your email.";

      }

    } catch (err) {

      console.error(
        "[Portal Auth] Email link failed",
        err
      );

      if (emailStatus) {

        emailStatus.textContent =
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

    } catch (err) {

      console.error(
        "[Portal Auth] Sign out failed",
        err
      );

    }

  }
);

}

});