/* =========================================================
   AgileAI Public Surface — Theme Controller v6.3
   - Fixes system-mode resolution
   - Resolves to real dark/light before applying
   - No CSS dependency break
   - Fully compatible with:
       header.js v5.2
       footer.js v2.0
       site.css v6.2+
       Institutional Motion System
   Production Safe + Idempotent
========================================================= */

(function () {

  const STORAGE_KEY = "aa_theme";
  const root = document.documentElement;
  const prefersDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  let initialized = false;

  /* =========================================================
     Utilities
  ========================================================== */

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY) || "system";
  }

  function saveTheme(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
  }

  function getSystemResolvedTheme() {
    return prefersDarkQuery.matches ? "dark" : "light";
  }

  function resolveTheme(mode) {
    if (mode === "system") {
      return getSystemResolvedTheme();
    }
    return mode;
  }

  function applyTheme(mode) {

    const resolved = resolveTheme(mode);

    // IMPORTANT FIX:
    // We apply resolved value to CSS
    root.setAttribute("data-theme", resolved);

    updateButton(mode); // Button still shows logical mode
  }

  function nextMode(current) {
    if (current === "light") return "dark";
    if (current === "dark") return "system";
    return "light";
  }

  /* =========================================================
     Button State
  ========================================================== */

  function updateButton(mode) {

    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    if (!btn.dataset.bound) {
      btn.addEventListener("click", toggleTheme);
      btn.dataset.bound = "true";
    }

    btn.classList.add("theme-icon-fade");

    setTimeout(() => {

      if (mode === "light") {
        btn.textContent = "🌞";
        btn.title = "Theme: Light";
      } else if (mode === "dark") {
        btn.textContent = "🌙";
        btn.title = "Theme: Dark";
      } else {
        btn.textContent = "🖥️";
        btn.title = "Theme: System";
      }

      btn.classList.remove("theme-icon-fade");

    }, 120);
  }

  /* =========================================================
     Toggle Logic
  ========================================================== */

  function toggleTheme(e) {

    const current = getSavedTheme();
    const next = nextMode(current);

    saveTheme(next);
    applyTheme(next);

    triggerRipple(e);
  }

  /* =========================================================
     Ripple Effect
  ========================================================== */

  function triggerRipple(event) {

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
     Reading Progress
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
     System Theme Listener
  ========================================================== */

  prefersDarkQuery.addEventListener("change", () => {
    if (getSavedTheme() === "system") {
      applyTheme("system");
    }
  });

  /* =========================================================
     Header Injection Observer
  ========================================================== */

  function observeForHeaderButton() {

    const observer = new MutationObserver(() => {

      const btn = document.getElementById("theme-toggle");

      if (btn) {
        updateButton(getSavedTheme());
        observer.disconnect();
      }

    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /* =========================================================
     Initialization
  ========================================================== */

  function init() {

    if (initialized) return;
    initialized = true;

    applyTheme(getSavedTheme());

    const btn = document.getElementById("theme-toggle");

    if (!btn) {
      observeForHeaderButton();
    } else {
      updateButton(getSavedTheme());
    }

    initReadingProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
