/* =====================================================
   🌗 THEME SYSTEM — AAU ADMIN
   -----------------------------------------------------
   Version: v2.1.0 (FIXED INIT + DYNAMIC SAFE)

   FIXES:
   - Removed DOMContentLoaded dependency
   - Exposed initTheme globally
   - Works with dynamic header injection
   - Prevents double binding

   SCOPE:
   - Light / Dark only
===================================================== */

(function () {

  const STORAGE_KEY = "aau_admin_theme";

  /* ============================================
     🔹 APPLY THEME
     ============================================ */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  /* ============================================
     🔹 GET SAVED THEME
     ============================================ */
  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY) || "light";
  }

  /* ============================================
     🔹 SET THEME
     ============================================ */
  function setTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
    updateToggleUI(theme);
  }

  /* ============================================
     🔹 TOGGLE
     ============================================ */
  function toggleTheme() {
    const current = getSavedTheme();
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
  }

  /* ============================================
     🔹 BUTTON UI UPDATE
     ============================================ */
  function updateToggleUI(theme) {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    btn.textContent = theme === "dark" ? "🌙" : "🌞";
    btn.title = `Switch to ${theme === "dark" ? "light" : "dark"} mode`;
  }

  /* ============================================
     🔹 INIT (EXPORTED)
     ============================================ */
  function initTheme() {

    const saved = getSavedTheme();
    applyTheme(saved);
    updateToggleUI(saved);

    const btn = document.getElementById("themeToggle");

    // 🔥 Prevent multiple bindings
    if (btn && !btn.__themeBound) {
      btn.onclick = toggleTheme;
      btn.__themeBound = true;
    }
  }

  /* ============================================
     🌍 EXPOSE GLOBALLY (CRITICAL FIX)
     ============================================ */
  window.initTheme = initTheme;

})();