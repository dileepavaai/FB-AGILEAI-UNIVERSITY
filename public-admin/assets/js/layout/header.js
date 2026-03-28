/* =====================================================
   🔷 CENTRALIZED HEADER (WITH ROLE + THEME SUPPORT)
   ===================================================== */

export function loadHeader(user = null, role = null) {

  const email = user?.email || "Checking authentication...";

  // 🔷 ROLE BADGE LOGIC
  let roleBadgeHTML = "";

  if (role === "super_admin") {
    roleBadgeHTML = `<span class="role-badge super">SUPER ADMIN</span>`;
  } else if (role === "admin") {
    roleBadgeHTML = `<span class="role-badge admin">ADMIN</span>`;
  }

  const showLogout = user ? "inline-block" : "none";
  const showWarning = user ? "" : "hidden";

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
     🔗 LOAD THEME SYSTEM (SAFE, ROOT PATH, ONCE)
     ===================================================== */

  if (!window.__themeLoaded) {

    const script = document.createElement("script");

    // ✅ CRITICAL FIX: absolute path (works on all pages)
    script.src = "/assets/js/theme-toggle.js";

    script.defer = true;

    script.onload = () => {
      console.log("✅ Theme system loaded");
    };

    script.onerror = () => {
      console.error("❌ Failed to load theme-toggle.js");
    };

    document.body.appendChild(script);

    window.__themeLoaded = true;
  }
}