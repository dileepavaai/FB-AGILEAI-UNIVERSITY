/* =========================================================
   AgileAI Public Surface — Theme Controller v5.1
   Injection Safe + Idempotent + Ripple Hardened
========================================================= */

(function () {

  const STORAGE_KEY = "aa_theme";
  const root = document.documentElement;
  const prefersDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  let listenerAttached = false;

  /* =========================
     Helpers
  ========================= */

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY) || "system";
  }

  function saveTheme(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
  }

  function applyTheme(mode) {
    root.setAttribute("data-theme", mode);
    updateButton(mode);
  }

  /* =========================
     Icon + Tooltip
  ========================= */

  function updateButton(mode) {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

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

  /* =========================
     Rotation Logic
  ========================= */

  function nextMode(current) {
    if (current === "light") return "dark";
    if (current === "dark") return "system";
    return "light";
  }

  function toggleTheme(e) {
    const current = getSavedTheme();
    const next = nextMode(current);

    saveTheme(next);
    applyTheme(next);

    if (e) triggerRipple(e);
  }

  /* =========================
     Ripple (Hardened)
  ========================= */

  function triggerRipple(event) {
    const btn = event.currentTarget;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const circle = document.createElement("span");
    circle.className = "ripple";

    const size = Math.max(rect.width, rect.height);

    circle.style.width = circle.style.height = size + "px";

    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;

    circle.style.left = x - rect.left - size / 2 + "px";
    circle.style.top = y - rect.top - size / 2 + "px";

    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  }

  /* =========================
     Attach Button Safely
  ========================= */

  function attachButtonListener() {
    const btn = document.getElementById("theme-toggle");
    if (!btn || listenerAttached) return false;

    btn.addEventListener("click", toggleTheme);
    listenerAttached = true;

    // Sync icon after injection
    updateButton(getSavedTheme());

    return true;
  }

  /* =========================
     Live System Detection
  ========================= */

  prefersDarkQuery.addEventListener("change", () => {
    if (getSavedTheme() === "system") {
      applyTheme("system");
    }
  });

  /* =========================
     Reading Progress
  ========================= */

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

  /* =========================
     Init
  ========================= */

  function init() {

    applyTheme(getSavedTheme());

    if (!attachButtonListener()) {

      const observer = new MutationObserver(() => {
        if (attachButtonListener()) {
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    initReadingProgress();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
