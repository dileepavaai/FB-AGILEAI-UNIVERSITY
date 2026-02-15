(function () {

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("aai-theme", next);
  }

  function initTheme() {
    const saved = localStorage.getItem("aai-theme");
    if (saved) {
      applyTheme(saved);
    }
  }

  document.addEventListener("headerInjected", function () {
    initTheme();
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", toggleTheme);
    }
  });

})();
