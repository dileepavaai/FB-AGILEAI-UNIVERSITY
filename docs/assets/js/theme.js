/* =========================================================
   AgileAI Public Surface — Theme Controller v7.2
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

  let initialized = false;
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
    updateButton(mode);
  }

  function toggleTheme(e) {
    const current = getSavedTheme();
    const next = current === "light" ? "dark" : "light";

    saveTheme(next);
    applyTheme(next);
    triggerRipple(e);
  }

  /* =========================================================
     BUTTON STATE (Deterministic Safe Binding)
  ========================================================== */

  function updateButton(mode) {

    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    if (!buttonBound) {
      btn.addEventListener("click", toggleTheme);
      buttonBound = true;
    }

    if (mode === "dark") {
      btn.textContent = "🌙";
      btn.title = "Switch to Light Mode";
    } else {
      btn.textContent = "☀️";
      btn.title = "Switch to Dark Mode";
    }
  }

  /* =========================================================
     SAFE HEADER BIND RETRY
  ========================================================== */

  function ensureButtonBinding() {

    const btn = document.getElementById("theme-toggle");

    if (btn) {
      updateButton(getSavedTheme());
      return;
    }

    // Retry once after header injection delay
    setTimeout(() => {
      const retryBtn = document.getElementById("theme-toggle");
      if (retryBtn) {
        updateButton(getSavedTheme());
      }
    }, 50);
  }

  /* =========================================================
     RIPPLE EFFECT
  ========================================================== */

  function triggerRipple(event) {

    if (!event) return;

    const btn = event.currentTarget;
    if (!btn) return;

    const circle = document.createElement("span");
    circle.className = "ripple";

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    circle.style.width = circle.style.height = size + "px";
    circle.style.left = event.clientX - rect.left - size / 2 + "px";
    circle.style.top = event.clientY - rect.top - size / 2 + "px";

    btn.appendChild(circle);

    setTimeout(() => circle.remove(), 600);
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

    if (initialized) return;
    initialized = true;

    const saved = getSavedTheme();
    root.setAttribute("data-theme", saved);

    ensureButtonBinding();
    initReadingProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
