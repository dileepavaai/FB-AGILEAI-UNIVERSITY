(function () {
  const STORAGE_KEY = "aa_theme";

  function getSystemPreference() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyTheme(theme) {
    if (theme === "system") {
      document.documentElement.setAttribute(
        "data-theme",
        getSystemPreference()
      );
    } else {
      document.documentElement.setAttribute("data-theme", theme);
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
    const current = localStorage.getItem(STORAGE_KEY) || "system";

    let next;
    if (current === "light") next = "dark";
    else if (current === "dark") next = "system";
    else next = "light";

    saveTheme(next);
    applyTheme(next);
  }

  // expose for header button
  window.AATheme = {
    toggle: toggleTheme,
    init: initTheme
  };

  initTheme();
})();
