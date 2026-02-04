(function () {
  "use strict";

  console.log("[Theme] Initializing theme controller");

  const STORAGE_KEY = "aai-theme";
  const DEFAULT_THEME = "light";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    const theme = stored || DEFAULT_THEME;
    applyTheme(theme);
  }

  function toggleTheme() {
    const current =
      document.documentElement.getAttribute("data-theme") ||
      DEFAULT_THEME;

    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    storeTheme(next);

    console.log("[Theme] Switched to", next);
    return next; // 🔑 important for header UI update
  }

  /* =====================================================
     🔒 GOVERNED PUBLIC API
     ===================================================== */

  window.ThemeController = {
    init: initTheme,
    toggle: toggleTheme
  };

  // 🔑 COMPATIBILITY ALIAS (INTENTIONAL · GOVERNED)
  // Header expects this exact function name
  window.toggleTheme = toggleTheme;

  // Auto-init on load
  initTheme();
})();
