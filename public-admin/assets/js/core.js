/* =====================================================
   🔷 FIREBASE CORE (RBAC ENABLED + BACKWARD SAFE)
   -----------------------------------------------------
   Version: v3.0.0 (RBAC + Fallback Stable)
   Date: 2026-03-30

   CHANGE TYPE:
   - Non-breaking upgrade
   - Added Firestore-based role system
   - Retained email-based fallback

   FEATURES:
   - Role resolution (Firestore + fallback)
   - Admin/trainer separation ready
   - Future RBAC extensibility
===================================================== */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

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


/* =====================================================
   🔐 LEGACY ADMIN ACCESS (FALLBACK ONLY)
   ===================================================== */

const ADMIN_ACCESS = {
  "dileep@agileai.university": "super_admin",
  "laau.aaiu@gmail.com": "admin"
};


/* =====================================================
   🔐 HELPERS
   ===================================================== */

export function normalizeEmail(email) {
  return email?.trim().toLowerCase() || "";
}

export function isAdmin(email) {
  return !!ADMIN_ACCESS[normalizeEmail(email)];
}

export function getLegacyRole(email) {
  return ADMIN_ACCESS[normalizeEmail(email)] || null;
}


/* =====================================================
   🔷 FIREBASE CONFIG
   ===================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyCti7ubJjnU8LJTghNaXhaSZzqCpozkeXg",
  authDomain: "fb-agileai-university.firebaseapp.com",
  projectId: "fb-agileai-university",
  storageBucket: "fb-agileai-university.appspot.com",
  messagingSenderId: "458881040066",
  appId: "1:458881040066:web:c832c420f9b4282e76c55b"
};


/* =====================================================
   🔷 INIT (SAFE)
   ===================================================== */

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


/* =====================================================
   🔐 🔥 ROLE RESOLUTION (PRIMARY LOGIC)
===================================================== */

export async function getUserRole(uid, email) {

  try {
    // 🔍 1. CHECK FIRESTORE (PRIMARY SOURCE)
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const role = snap.data().role;

      if (role) {
        console.log("✅ Role (Firestore):", role);
        return role;
      }
    }

    // 🔁 2. FALLBACK TO EMAIL-BASED ROLE
    const fallbackRole = getLegacyRole(email);

    if (fallbackRole) {
      console.log("⚠️ Role (Fallback):", fallbackRole);
      return fallbackRole;
    }

    // ❌ 3. NO ROLE
    console.warn("❌ No role found");
    return null;

  } catch (err) {
    console.error("🔥 Role fetch error:", err);

    // 🔁 SAFE FALLBACK
    return getLegacyRole(email);
  }
}


/* =====================================================
   🔷 PROVIDER
   ===================================================== */

const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account"
});


/* =====================================================
   🔷 LOGIN (ROBUST)
   ===================================================== */

export async function login() {
  try {
    console.log("🚀 Popup login attempt");
    await signInWithPopup(auth, provider);

  } catch (error) {
    console.warn("⚠️ Popup blocked → redirect");
    await signInWithRedirect(auth, provider);
  }
}


/* =====================================================
   🔷 REDIRECT HANDLER
   ===================================================== */

getRedirectResult(auth)
  .then((result) => {
    if (result?.user) {
      console.log("✅ Redirect login success:", result.user.email);
    }
  })
  .catch((error) => {
    console.error("🔥 Redirect login error:", error);
  });


/* =====================================================
   🔷 LOGOUT
   ===================================================== */

export async function logout() {
  await signOut(auth);
}


/* =====================================================
   🔷 EXPORT LISTENER
   ===================================================== */

export { onAuthStateChanged };