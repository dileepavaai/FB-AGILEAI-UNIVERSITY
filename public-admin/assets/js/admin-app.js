/* =====================================================
   🔷 UNIVERSAL APP CONTROLLER (RBAC ENABLED)
   -----------------------------------------------------
   Version: v3.0.0 (RBAC + No Flicker Stable)
   Date: 2026-03-30

   CHANGE TYPE:
   - Non-breaking upgrade
   - Added role-based access control
   - Supports admin + trainer routing

   FEATURES:
   - Firestore role resolution
   - Page-level access enforcement
   - Centralized module loader
===================================================== */

import { auth, login, logout, getUserRole } from "./core.js";
import { loadHeader } from "./layout/header.js";
import { loadFooter } from "./layout/footer.js";
import { highlightActiveSidebar } from "./layout/sidebar.js";

import {
  onAuthStateChanged,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* =====================================================
   🚀 INIT APP
===================================================== */

export function initAdminApp(moduleName = null) {

  // 🔒 PREVENT FLICKER
  document.body.classList.add("app-loading");

  // 🔷 Load layout immediately
  loadHeader(null, null);
  loadFooter();

  // 🔷 Handle redirect login
  getRedirectResult(auth).catch(console.error);

  // 🔥 Wait for DOM/header
  setTimeout(() => {

    const statusEl = document.getElementById("status");
    const loginBtn = document.getElementById("loginBtn");
    const loginView = document.getElementById("loginView");
    const appView = document.getElementById("appView");
    const nav = document.getElementById("adminNav");
    const warning = document.getElementById("adminWarning");

    /* ============================================
       🔐 LOGIN
    ============================================ */
    loginBtn?.addEventListener("click", async () => {
      try {
        await login();
      } catch {
        const provider = new GoogleAuthProvider();
        await signInWithRedirect(auth, provider);
      }
    });

    /* ============================================
       🔓 LOGOUT
    ============================================ */
    function bindLogout() {
      const btn = document.getElementById("logoutBtn");
      if (!btn) return;

      btn.onclick = async () => {
        await logout();
        window.location.reload();
      };
    }

    /* ============================================
       🔐 AUTH STATE
    ============================================ */
    onAuthStateChanged(auth, async (user) => {

      /* 🔴 NOT LOGGED IN */
      if (!user) {
        loadHeader(null, null);

        if (loginView) loginView.style.display = "block";
        if (appView) appView.style.display = "none";
        if (nav) nav.style.display = "none";

        if (statusEl) statusEl.innerText = "Please sign in.";

        document.body.classList.remove("app-loading");
        return;
      }

      /* =====================================================
         🔐 ROLE RESOLUTION (NEW CORE LOGIC)
      ===================================================== */
      const role = await getUserRole(user.uid, user.email);

      if (!role) {
        alert("Access not configured.");
        await logout();
        document.body.classList.remove("app-loading");
        return;
      }

      const path = window.location.pathname;

      const isTrainerPage = path.includes("/trainer/");
      const isAdminPage = !isTrainerPage;

      /* =====================================================
         🚫 ACCESS CONTROL
      ===================================================== */

      // 🔴 Trainer trying to access admin
      if (isAdminPage && role === "trainer") {
        alert("Access denied.");
        window.location.href = "/trainer/trainer-dashboard.html";
        return;
      }

      // 🔴 Admin trying to access trainer (optional strict)
      if (isTrainerPage && role !== "trainer") {
        alert("Access denied.");
        window.location.href = "/index.html";
        return;
      }

      /* =====================================================
         🟢 VALID ACCESS
      ===================================================== */

      loadHeader(user, role);
      bindLogout();

      if (statusEl) statusEl.innerText = user.email;

      if (nav) nav.style.display = "block";
      if (warning && isAdminPage) warning.classList.remove("hidden");

      if (loginView) loginView.style.display = "none";
      if (appView) appView.style.display = "block";

      highlightActiveSidebar();

      /* =====================================================
         📦 MODULE LOADER (FIXED + SAFE)
      ===================================================== */
      if (moduleName) {
        try {
          const modulePath = `/assets/js/${moduleName}`;
          console.log("📦 Loading module:", modulePath);

          await import(modulePath);

        } catch (err) {
          console.error("❌ Module load failed:", moduleName, err);
        }
      }

      // 🔓 RELEASE UI LOCK
      document.body.classList.remove("app-loading");

    });

  }, 50);
}