/* =====================================================
   🔷 FIREBASE CORE (RBAC ENABLED + BACKWARD SAFE)
   -----------------------------------------------------
   Version: v3.0.2
   Date: 2026-07-12

   CHANGE TYPE:
   - Non-breaking Storage routing correction
   - Preserves shared Firebase application reuse
   - Preserves Firestore-based role system
   - Preserves email-based role fallback
   - Explicitly binds Storage to the production bucket

   FEATURES:
   - Role resolution (Firestore + fallback)
   - Admin/trainer separation ready
   - Future RBAC extensibility
   - Explicit production Firebase Storage binding
   - Backward-safe shared Firebase app reuse
   - Storage initialization diagnostics

   CHANGE HISTORY:

   v3.0.2
   - Explicitly binds Firebase Storage to the production
     firebasestorage.app bucket
   - Prevents an earlier Firebase app initialization from routing
     Storage operations to the legacy appspot.com bucket
   - Preserves the existing shared Firebase app for Authentication
     and Firestore
   - Avoids creating a second Firebase authentication context
   - Adds separate diagnostics for the shared app bucket and active
     Storage bucket
   - Supports Admin credential asset upload and publication

   v3.0.1
   - Corrected Firebase Storage bucket configuration
   - Replaced legacy appspot.com configuration with
     firebasestorage.app
   - Aligned Admin Portal Storage configuration with Firebase SDK
     configuration
   - Preserved authentication, Firestore, RBAC, and fallback
     behaviour

   v3.0.0
   - Added Firestore-based role system
   - Retained email-based fallback
   - Added admin and trainer role separation foundation
   - Established backward-safe Firebase initialization
===================================================== */

import {
  initializeApp,
  getApps
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


/* =====================================================
   🔐 LEGACY ADMIN ACCESS
   FALLBACK ONLY
===================================================== */

const ADMIN_ACCESS = {
  "dileep@agileai.university":
    "super_admin",

  "laau.aaiu@gmail.com":
    "admin"
};


/* =====================================================
   🔐 HELPERS
===================================================== */

export function normalizeEmail(
  email
) {

  return String(
    email || ""
  )
    .trim()
    .toLowerCase();

}


export function isAdmin(
  email
) {

  return Boolean(
    ADMIN_ACCESS[
      normalizeEmail(
        email
      )
    ]
  );

}


export function getLegacyRole(
  email
) {

  return (
    ADMIN_ACCESS[
      normalizeEmail(
        email
      )
    ] ||
    null
  );

}


/* =====================================================
   🔷 FIREBASE CONFIGURATION
===================================================== */

const firebaseConfig = {

  apiKey:
    "AIzaSyCti7ubJjnU8LJTghNaXhaSZzqCpozkeXg",

  authDomain:
    "fb-agileai-university.firebaseapp.com",

  projectId:
    "fb-agileai-university",

  storageBucket:
    "fb-agileai-university.firebasestorage.app",

  messagingSenderId:
    "458881040066",

  appId:
    "1:458881040066:web:c832c420f9b4282e76c55b"

};


/* =====================================================
   🔷 AUTHORITATIVE STORAGE BUCKET
===================================================== */

const STORAGE_BUCKET_URL =
  "gs://fb-agileai-university.firebasestorage.app";


/* =====================================================
   🔷 FIREBASE APPLICATION INITIALIZATION
   BACKWARD SAFE
===================================================== */

const existingApps =
  getApps();

const app =
  existingApps.length > 0
    ? existingApps[0]
    : initializeApp(
        firebaseConfig
      );


/* =====================================================
   🔷 FIREBASE SERVICES
===================================================== */

export const auth =
  getAuth(
    app
  );


export const db =
  getFirestore(
    app
  );


/*
Firebase Storage is intentionally initialized with an explicit
bucket URL.

This prevents a previously initialized shared Firebase app from
routing Storage operations to an older appspot.com bucket.
*/

export const storage =
  getStorage(
    app,
    STORAGE_BUCKET_URL
  );


/* =====================================================
   🔎 INITIALIZATION DIAGNOSTICS
===================================================== */

console.info(
  "[FirebaseCore] Initialized:",
  {
    version:
      "v3.0.2",

    projectId:
      app?.options?.projectId ||
      "missing",

    appConfiguredBucket:
      app?.options?.storageBucket ||
      "missing",

    activeStorageBucket:
      storage?.app?.options?.projectId
        ? STORAGE_BUCKET_URL
        : "missing",

    reusedExistingApp:
      existingApps.length > 0
  }
);


/* =====================================================
   🔐 ROLE RESOLUTION
   PRIMARY: FIRESTORE
   FALLBACK: LEGACY EMAIL MAPPING
===================================================== */

export async function getUserRole(
  uid,
  email
) {

  try {

    if (uid) {

      const userRef =
        doc(
          db,
          "users",
          uid
        );

      const userSnapshot =
        await getDoc(
          userRef
        );

      if (
        userSnapshot.exists()
      ) {

        const role =
          userSnapshot
            .data()
            ?.role;

        if (role) {

          console.info(
            "[FirebaseCore] Role resolved from Firestore:",
            role
          );

          return role;

        }

      }

    }


    const fallbackRole =
      getLegacyRole(
        email
      );


    if (fallbackRole) {

      console.warn(
        "[FirebaseCore] Role resolved from legacy fallback:",
        fallbackRole
      );

      return fallbackRole;

    }


    console.warn(
      "[FirebaseCore] No role found."
    );

    return null;

  }
  catch (error) {

    console.error(
      "[FirebaseCore] Role resolution failed:",
      error
    );

    return getLegacyRole(
      email
    );

  }

}


/* =====================================================
   🔷 AUTHENTICATION PROVIDER
===================================================== */

const provider =
  new GoogleAuthProvider();


provider.setCustomParameters({
  prompt:
    "select_account"
});


/* =====================================================
   🔷 LOGIN
===================================================== */

export async function login() {

  try {

    console.info(
      "[FirebaseCore] Popup login started."
    );

    await signInWithPopup(
      auth,
      provider
    );

  }
  catch (error) {

    console.warn(
      "[FirebaseCore] Popup login failed; redirect login started.",
      error
    );

    await signInWithRedirect(
      auth,
      provider
    );

  }

}


/* =====================================================
   🔷 REDIRECT RESULT HANDLER
===================================================== */

getRedirectResult(
  auth
)
  .then(
    (result) => {

      if (
        result?.user
      ) {

        console.info(
          "[FirebaseCore] Redirect login successful:",
          result.user.email
        );

      }

    }
  )
  .catch(
    (error) => {

      console.error(
        "[FirebaseCore] Redirect login failed:",
        error
      );

    }
  );


/* =====================================================
   🔷 LOGOUT
===================================================== */

export async function logout() {

  await signOut(
    auth
  );

}


/* =====================================================
   🔷 EXPORT AUTH STATE LISTENER
===================================================== */

export {
  onAuthStateChanged
};