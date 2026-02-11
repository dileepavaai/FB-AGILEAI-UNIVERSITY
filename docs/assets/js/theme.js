(function () {
  const STORAGE_KEY = "aa_theme";
  const root = document.documentElement;

  function getSystemPreference() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      // system mode → REMOVE attribute completely
      root.removeAttribute("data-theme");
    }
  }

  function saveTheme(theme) {
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function getSavedTheme() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function initTheme() {
    const saved = getSavedTheme();
    const theme = saved || "system";
    applyTheme(theme);
  }

  function toggleTheme() {
    const current = getSavedTheme() || "system";

    let next;
    if (current === "light") next = "dark";
    else if (current === "dark") next = "system";
    else next = "light";

    saveTheme(next);
    applyTheme(next);
  }

  window.AATheme = {
    toggle: toggleTheme,
    init: initTheme
  };

  initTheme();
})();
