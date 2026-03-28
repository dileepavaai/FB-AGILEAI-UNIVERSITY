/* =====================================================
   🔷 FIREBASE CORE (SHARED ACROSS MODULES)
   ===================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
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

export function isAdmin(email) {
  return !!ADMIN_ACCESS[email?.trim().toLowerCase()];
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
   🔷 INITIALIZE
   ===================================================== */

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

/* =====================================================
   🔷 AUTH HELPERS (OPTIONAL FOR NOW)
   ===================================================== */

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account"
});

export async function login() {
  await signInWithPopup(auth, provider);
}

export async function logout() {
  await signOut(auth);
}

export { onAuthStateChanged };