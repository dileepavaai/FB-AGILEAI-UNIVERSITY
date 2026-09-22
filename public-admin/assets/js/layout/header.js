/* =====================================================
   🔷 CENTRALIZED HEADER (ROLE + THEME — FINAL STABLE)
   -----------------------------------------------------
   Version: 20260922-admin-logo-1
   Date: 2026-09-22

   CHANGE TYPE:
   - Safe full replacement
   - Backward compatible

   FIXES:
   - Theme now initializes after load (CRITICAL FIX)
   - Eliminates “theme loaded but not applied” issue
   - Prevents race condition across pages

   NOTES:
   - Uses relative path (aligned with architecture)
   - Does NOT break existing admin-app flow
===================================================== */

export function loadHeader(user = null, role = null) {

  // Shared branding styles load once, including after auth re-renders the header.
  if (!document.getElementById("laauAdminHeaderBranding")) {
    const stylesheet = document.createElement("link");
    stylesheet.id = "laauAdminHeaderBranding";
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/assets/css/admin-header-branding.css?v=20260922-admin-logo-1";
    document.head.appendChild(stylesheet);
  }

  const email = user?.email || "Checking authentication...";

  /* =====================================================
     🔷 ROLE BADGE LOGIC
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
    <header class="topbar laau-admin-header">
      <h1 class="laau-admin-brand">
        <a class="laau-admin-brand-link" href="/index.html" aria-label="LAAU Admin">
          <img class="laau-admin-brand-logo"
               src="/assets/images/LAAU-Logo.png?v=20260922-admin-logo-1"
               alt="LAAU" width="140" height="70" />
          <span class="laau-admin-brand-label" aria-hidden="true">Admin</span>
        </a>
      </h1>

      <div class="user">

        <!-- 🌗 THEME TOGGLE -->
        <button id="themeToggle" title="Toggle Theme" aria-label="Toggle Theme">
          🌗
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
     🌗 LOAD + INIT THEME SYSTEM (CRITICAL FIX)
     ===================================================== */

  function initThemeSafely() {
    if (window.initTheme) {
      window.initTheme();
    } else {
      console.warn("⚠️ initTheme() not available");
    }
  }

  // 🔥 If already loaded → just init
  if (window.__themeLoaded) {
    initThemeSafely();
    return;
  }

  // 🔥 Load script first time
  const script = document.createElement("script");
  script.src = "/assets/js/theme-toggle.js";
  script.defer = true;

  script.onload = () => {
    console.log("✅ Theme system loaded");

    // 🔥 CRITICAL: Initialize AFTER load
    setTimeout(initThemeSafely, 50);
  };

  script.onerror = () => {
    console.error("❌ Failed to load theme-toggle.js");
  };

  document.head.appendChild(script);

  window.__themeLoaded = true;
}
