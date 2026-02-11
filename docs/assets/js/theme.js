/* =========================================================
   AgileAI Public Surface — Theme Controller v5 (Robust)
   Fully resilient across injected headers & all pages
========================================================= */

(function () {

  const STORAGE_KEY = "aa_theme";
  const root = document.documentElement;
  const prefersDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");

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

    triggerRipple(e);
  }

  /* =========================
     Ripple
  ========================= */

  function triggerRipple(event) {
    const btn = event.currentTarget;
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

  /* =========================
     Attach Button Safely
  ========================= */

  function attachButtonListener() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return false;

    btn.addEventListener("click", toggleTheme);
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
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + "%";
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
  }

  /* =========================
     Init
  ========================= */

  function init() {

    // Apply saved theme immediately
    applyTheme(getSavedTheme());

    // Try attaching button
    if (!attachButtonListener()) {

      // Retry if header is injected later
      const observer = new MutationObserver(() => {
        if (attachButtonListener()) {
          observer.disconnect();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    initReadingProgress();
  }

  document.addEventListener("DOMContentLoaded", init);

})();
