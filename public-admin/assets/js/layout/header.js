/* =====================================================
   🔷 CENTRALIZED HEADER (ROLE + THEME — STABLE)
   -----------------------------------------------------
   Version: v2.1.0
   Date: 2026-03-29

   CHANGE TYPE:
   - Safe full replacement
   - Backward compatible

   IMPROVEMENTS:
   - Fixed theme script loading (no race condition)
   - Removed absolute path dependency
   - Corrected role badge mapping
   - Improved stability across pages
===================================================== */

export function loadHeader(user = null, role = null) {

  const email = user?.email || "Checking authentication...";

  /* =====================================================
     🔷 ROLE BADGE LOGIC (FIXED CLASS MAPPING)
     ===================================================== */
  let roleBadgeHTML = "";

  if (role === "super_admin") {
    roleBadgeHTML = `<span class="role-badge role-super_admin">SUPER ADMIN</span>`;
  } else if (role === "admin") {
    roleBadgeHTML = `<span class="role-badge role-admin">ADMIN</span>`;
  }

  const showLogout = user ? "inline-block" : "none";
  const showWarning = user ? "" : "hidden";

  /* =====================================================
     🔷 HEADER TEMPLATE
     ===================================================== */
  const header = `
    <header class="topbar">
      <h1>Agile AI University – Admin</h1>

      <div class="user">

        <!-- 🌗 THEME TOGGLE -->
        <button id="themeToggle" title="Toggle Theme" aria-label="Toggle Theme">
          🌞
        </button>

        <span id="status">${email}</span>
        ${roleBadgeHTML}

        <button id="logoutBtn" style="display:${showLogout};">
          Logout
        </button>
      </div>
    </header>

    <div id="adminWarning" class="admin-warning ${showWarning}">
      ⚠️ Restricted Admin Area — All actions are logged and audited.
    </div>
  `;

  document.getElementById("headerContainer").innerHTML = header;

  /* =====================================================
     🌗 LOAD THEME SYSTEM (SAFE + ONCE + NO FLICKER)
     ===================================================== */

  if (!window.__themeLoaded) {

    const script = document.createElement("script");

    // ✅ RELATIVE PATH (CRITICAL FOR YOUR SETUP)
    script.src = "./assets/js/theme-toggle.js";

    script.defer = true;

    script.onload = () => {
      console.log("✅ Theme system loaded");
    };

    script.onerror = () => {
      console.error("❌ Failed to load theme-toggle.js");
    };

    // ✅ LOAD IN HEAD (BETTER TIMING)
    document.head.appendChild(script);

    window.__themeLoaded = true;
  }
}