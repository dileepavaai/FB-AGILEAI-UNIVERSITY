/* =========================================================
   AgileAI Public Surface — Theme Controller v7.3
   Hardened Institutional Baseline (Light / Dark Only)
   - Deterministic header-safe binding
   - No observers
   - No media queries
   - Idempotent
   - Reading Progress Included
   Production Safe
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
    root.setAttribute("data-theme", mode);
  }

  function toggleTheme() {
    const current = getSavedTheme();
    const next = current === "light" ? "dark" : "light";

    saveTheme(next);
    applyTheme(next);
    updateButton(next);
  }

  /* =========================================================
     BUTTON BINDING (Header Safe)
  ========================================================== */

  function updateButton(mode) {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    btn.textContent = mode === "dark" ? "🌙" : "☀️";
    btn.title = mode === "dark"
      ? "Switch to Light Mode"
      : "Switch to Dark Mode";
  }

  function tryBindButton() {

    if (buttonBound) return;

    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    btn.addEventListener("click", toggleTheme);
    updateButton(getSavedTheme());

    buttonBound = true;
  }

  /* =========================================================
     READING PROGRESS
  ========================================================== */

  function initReadingProgress() {

    if (document.getElementById("reading-progress")) return;

    const bar = document.createElement("div");
    bar.id = "reading-progress";
    document.body.appendChild(bar);

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress =
        docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

      bar.style.width = progress + "%";
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
  }

  /* =========================================================
     INIT
  ========================================================== */

  function init() {

    const saved = getSavedTheme();
    applyTheme(saved);

    initReadingProgress();

    // Try binding immediately
    tryBindButton();

    // Safety retry for header injection timing
    const interval = setInterval(() => {
      tryBindButton();
      if (buttonBound) clearInterval(interval);
    }, 50);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
