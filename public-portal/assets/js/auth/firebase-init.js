/* ==========================================================
   Agile AI University Portal
   Firebase Auth Service

   File: firebase-init.js
   Version: 1.3.0
   Status: ACTIVE

   Authentication Providers

   • Google Sign-In
   • Email Magic Link Sign-In

   Governance

   • Authentication Service Authority
   • Firebase Initialization Authority
   • Exposes Auth and Firestore Runtime Handles
   • No Portal Authorization Logic
   • No Entitlement Logic
   • No Credential Logic

   Change History

   v1.3.0
   • Added Firestore compat initialization
   • Exposes window.db for read-only portal services
   • Preserves auth readiness contract

   v1.2.0
   • Fixed auth readiness timing issue
   • Waits for Firebase auth restoration
   • Resolves __AAIU_AUTH_READY__ only after
     first auth state resolution
   • Added governance diagnostics

========================================================== */

(function () {

"use strict";

console.log(
  "[AAIU Auth] Firebase Auth Service v1.3.0 initializing"
);

window.__AAIU_AUTH_READY__ =
new Promise((resolve) => {

  try {

    /* ======================================================
       FIREBASE INITIALIZATION
    ====================================================== */

    if (!firebase.apps.length) {

      firebase.initializeApp({
        apiKey: "AIzaSyCti7ubJjnU8LJTghNaXhaSZzqCpozkeXg",
        authDomain: "fb-agileai-university.firebaseapp.com",
        projectId: "fb-agileai-university",
        storageBucket: "fb-agileai-university.appspot.com",
        messagingSenderId: "458881040066",
        appId: "1:458881040066:web:c832c420f9b4282e76c55b"
      });

      console.log(
        "[AAIU Auth] Firebase initialized"
      );

    }

    const auth =
      firebase.auth();

    /* ======================================================
       FIRESTORE INITIALIZATION
       Read service dependency for portal services
    ====================================================== */

    if (
      firebase.firestore &&
      typeof firebase.firestore === "function"
    ) {

      const db =
        firebase.firestore();

      window.db =
        db;

      console.log(
        "[AAIU Auth] Firestore ready"
      );

    } else {

      console.warn(
        "[AAIU Auth] Firestore compat SDK not loaded"
      );

    }

    /* ======================================================
       AUTH SERVICE API
    ====================================================== */

    window.AAIUAuth = {

      async signInWithGoogle() {

        const provider =
          new firebase.auth.GoogleAuthProvider();

        return auth.signInWithPopup(
          provider
        );

      },

      async sendEmailLink(email) {

        const actionCodeSettings = {

          url:
            "https://portal.agileai.university/",

          handleCodeInApp: true

        };

        await auth.sendSignInLinkToEmail(
          email,
          actionCodeSettings
        );

        window.localStorage.setItem(
          "aaiuEmailForSignIn",
          email
        );

      },

      async completeEmailLinkSignIn() {

        const currentUrl =
          window.location.href;

        if (
          !auth.isSignInWithEmailLink(
            currentUrl
          )
        ) {

          return null;

        }

        let email =
          window.localStorage.getItem(
            "aaiuEmailForSignIn"
          );

        if (!email) {

          email =
            window.prompt(
              "Please confirm your email address."
            );

        }

        if (!email) {

          return null;

        }

        const result =
          await auth.signInWithEmailLink(
            email,
            currentUrl
          );

        window.localStorage.removeItem(
          "aaiuEmailForSignIn"
        );

        return result;

      }

    };

    /* ======================================================
       AUTH READINESS CONTRACT
       WAIT FOR FIREBASE TO RESTORE SESSION
    ====================================================== */

    let authResolved =
      false;

    auth.onAuthStateChanged((user) => {

      if (authResolved) {
        return;
      }

      const emailLinkFlow =
        auth.isSignInWithEmailLink(
          window.location.href
        );

      if (!user && emailLinkFlow) {

        console.log(
          "[AAIU Auth] Waiting for email-link completion"
        );

        return;

      }

      authResolved =
        true;

      console.log(
        "[AAIU Auth] Auth ready:",
        user?.email || "anonymous"
      );

      resolve({
        auth,
        user,
        db: window.db || null
      });

    });

  } catch (err) {

    console.error(
      "[AAIU Auth] Initialization failed",
      err
    );

    resolve(null);

  }

});

})();