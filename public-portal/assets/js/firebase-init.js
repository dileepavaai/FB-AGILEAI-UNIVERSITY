/* ==========================================================
   Agile AI University Portal
   Firebase Auth Service

   File: firebase-init.js
   Version: 1.2.0
   Status: ACTIVE

   Authentication Providers

   • Google Sign-In
   • Email Magic Link Sign-In

   Governance

   • Authentication Service Only
   • No Portal Authorization Logic
   • No Entitlement Logic
   • No Credential Logic

   Change History

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
  "[AAIU Auth] Firebase Auth Service v1.2.0 initializing"
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

    const auth = firebase.auth();

    /* ======================================================
       AUTH SERVICE API
    ====================================================== */

    window.AAIUAuth = {

      /* ====================================================
         Google Sign-In
      ==================================================== */

      async signInWithGoogle() {

        const provider =
          new firebase.auth.GoogleAuthProvider();

        return auth.signInWithPopup(
          provider
        );

      },

      /* ====================================================
         Email Magic Link
      ==================================================== */

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

          email = window.prompt(
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

    const unsubscribe =
      auth.onAuthStateChanged((user) => {

        unsubscribe();

        console.log(
          "[AAIU Auth] Auth ready:",
          user?.email || "anonymous"
        );

        resolve({
          auth,
          user
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