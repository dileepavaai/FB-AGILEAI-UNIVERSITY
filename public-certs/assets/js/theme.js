/* =========================================================
   AgileAI Public Surface — Theme Controller v8.0
   Institutional Production Baseline (Light / Dark Only)

   CHANGE LOG
   ---------------------------------------------------------
   v8.0 → Removed reading progress system
           Simplified surface behavior
           No visual injection side-effects

   DESIGN GUARANTEES
   ---------------------------------------------------------
   - Deterministic initialization
   - No polling loops
   - No MutationObservers
   - No media queries
   - Idempotent binding
   - Header-injection safe
   - Production safe for GitHub Pages
   - Attribute-minimal dark mode (no light attribute)
========================================================= */

(function () {

  const STORAGE_KEY = "aa_theme";
  const root = document.documentElement;

  let buttonBound = false;

  /* =========================================================
     THEME UTILITIES
  ========================================================== */

  function getSavedTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "dark" ? "dark" : "light";
  }

  function saveTheme(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
  }

  function applyTheme(mode) {
    if (mode === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function updateButton(mode) {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    const icon = btn.querySelector(".theme-icon");
    if (!icon) return;

    icon.textContent = mode === "dark" ? "🌙" : "☀";
    btn.title =
      mode === "dark"
        ? "Switch to Light Mode"
        : "Switch to Dark Mode";
  }

  function toggleTheme() {
    const current = getSavedTheme();
    const next = current === "light" ? "dark" : "light";

    saveTheme(next);
    applyTheme(next);
    updateButton(next);
  }

  /* =========================================================
     BUTTON BINDING (Deterministic + Idempotent)
  ========================================================== */

  function bindButtonIfPresent() {

    if (buttonBound) return;

    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    btn.addEventListener("click", toggleTheme);
    updateButton(getSavedTheme());

    buttonBound = true;
  }

  /* =========================================================
     INIT
  ========================================================== */

  function init() {

    // 1. Apply saved theme immediately (prevents flicker)
    const saved = getSavedTheme();
    applyTheme(saved);

    // 2. Bind button immediately if already injected
    bindButtonIfPresent();

    // 3. Re-attempt binding after header injection
    document.addEventListener("headerInjected", bindButtonIfPresent);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();