/* =====================================================
   🔷 FIREBASE CORE (FINAL STABLE + ROLE SUPPORT)
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
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================================================
   🔐 ADMIN ACCESS CONTROL
   ===================================================== */

const ADMIN_ACCESS = {
  "dileep@agileai.university": "super_admin",
  "laau.aaiu@gmail.com": "admin"
};

/* =====================================================
   🔐 ACCESS HELPERS
   ===================================================== */

export function normalizeEmail(email) {
  return email?.trim().toLowerCase() || "";
}

export function isAdmin(email) {
  return !!ADMIN_ACCESS[normalizeEmail(email)];
}

export function getUserRole(email) {
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
   🔷 INITIALIZE (SAFE - NO DUPLICATE INIT)
   ===================================================== */

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/* =====================================================
   🔷 PROVIDER
   ===================================================== */

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

/* =====================================================
   🔷 LOGIN (ROBUST WITH FALLBACK)
   ===================================================== */

export async function login() {
  try {
    console.log("🚀 Popup login attempt");
    await signInWithPopup(auth, provider);

  } catch (error) {
    console.warn("⚠️ Popup blocked → using redirect");

    await signInWithRedirect(auth, provider);
  }
}

/* =====================================================
   🔷 HANDLE REDIRECT RESULT (RUNS ON LOAD)
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
   🔷 EXPORT AUTH LISTENER
   ===================================================== */

export { onAuthStateChanged };