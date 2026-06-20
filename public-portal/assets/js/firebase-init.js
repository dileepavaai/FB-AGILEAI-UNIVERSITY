/* ==========================================================
   Agile AI University Portal
   Firebase Auth Service

   File: firebase-init.js
   Version: 1.0.0
   Status: ACTIVE
========================================================== */

(function () {

"use strict";

window.__AAIU_AUTH_READY__ =
new Promise((resolve) => {

  try {

    if (!firebase.apps.length) {

      firebase.initializeApp({
        apiKey: "AIzaSyCti7ubJjnU8LJTghNaXhaSZzqCpozkeXg",
        authDomain: "fb-agileai-university.firebaseapp.com",
        projectId: "fb-agileai-university",
        storageBucket: "fb-agileai-university.appspot.com",
        messagingSenderId: "458881040066",
        appId: "1:458881040066:web:c832c420f9b4282e76c55b"
      });

    }

    const auth = firebase.auth();

    window.AAIUAuth = {

      async signInWithGoogle() {

        const provider =
          new firebase.auth.GoogleAuthProvider();

        return auth.signInWithPopup(provider);

      },

      async sendEmailLink(email) {

        throw new Error(
          "Email Link Sign-In not yet implemented."
        );

      },

      async completeEmailLinkSignIn() {

        return null;

      }

    };

    resolve({
      auth,
      user: auth.currentUser
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