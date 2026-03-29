/* =====================================================
   🔷 UNIVERSAL ADMIN CONTROLLER (NO FLICKER VERSION)
   Version: v2.1.0 (Centralized Module Loader Fix)
   ===================================================== */

import { auth, login, logout, isAdmin, getUserRole } from "./core.js";
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

  // 🔥 PREVENT FLICKER (LOCK UI)
  document.body.classList.add("app-loading");

  // 🔷 Load layout immediately
  loadHeader(null, null);
  loadFooter();

  // 🔷 Handle redirect login
  getRedirectResult(auth).catch(console.error);

  // 🔥 Wait for header injection
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
       🔐 AUTH STATE (NO FLICKER CONTROL)
       ============================================ */
    onAuthStateChanged(auth, async (user) => {

      // 🔴 NOT LOGGED IN
      if (!user) {
        loadHeader(null, null);

        if (loginView) loginView.style.display = "block";
        if (appView) appView.style.display = "none";
        if (nav) nav.style.display = "none";

        if (statusEl) statusEl.innerText = "Please sign in.";

        document.body.classList.remove("app-loading");
        return;
      }

      // 🔴 NOT ADMIN
      if (!isAdmin(user.email)) {
        alert("Not authorized.");
        await logout();

        document.body.classList.remove("app-loading");
        return;
      }

      // 🟢 VALID ADMIN
      const role = getUserRole(user.email);

      // 🔥 LOAD HEADER WITH ROLE
      loadHeader(user, role);
      bindLogout();

      // 🔷 UI STATE
      if (statusEl) statusEl.innerText = user.email;
      if (nav) nav.style.display = "block";
      if (warning) warning.classList.remove("hidden");

      if (loginView) loginView.style.display = "none";
      if (appView) appView.style.display = "block";

      // 🔥 SIDEBAR ACTIVE
      highlightActiveSidebar();

      /* ============================================
         📦 MODULE LOADER (FIXED — CENTRALIZED)
         ============================================ */
      if (moduleName) {
        try {
          const modulePath = `/assets/js/${moduleName}`;
          console.log("📦 Loading module:", modulePath);

          await import(modulePath);

        } catch (err) {
          console.error("❌ Module load failed:", moduleName, err);
        }
      }

      // 🔥 RELEASE UI LOCK (MOST IMPORTANT LINE)
      document.body.classList.remove("app-loading");

    });

  }, 50);
}