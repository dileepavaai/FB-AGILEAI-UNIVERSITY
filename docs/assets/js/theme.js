/* =========================================================
   AgileAI Learning Portal — Theme Controller (Stable v3)
   Deterministic • GitHub Pages Safe • Header Injection Safe
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "aa_theme";
  const root = document.documentElement;
  const MODES = ["light", "dark", "system"];

  function getSystemPreference() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(mode) {
    if (mode === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (mode === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      // system mode
      root.removeAttribute("data-theme");
    }
  }

  function updateButton(mode) {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

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
  }

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function saveTheme(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
  }

  function initTheme() {
    let saved = getSavedTheme();
    if (!MODES.includes(saved)) saved = "light";

    applyTheme(saved);
    updateButton(saved);
  }

  function cycleTheme() {
    let current = getSavedTheme();
    if (!MODES.includes(current)) current = "light";

    const index = MODES.indexOf(current);
    const next = MODES[(index + 1) % MODES.length];

    saveTheme(next);
    applyTheme(next);
    updateButton(next);
  }

  // Wait for full DOM (including injected header)
  window.addEventListener("load", function () {
    initTheme();

    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", cycleTheme);
    }
  });

})();
