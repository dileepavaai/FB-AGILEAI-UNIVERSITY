document.addEventListener("DOMContentLoaded", function () {

  const toggle = document.getElementById("theme-toggle");
  const body = document.body;

  // =========================================
  // LOAD SAVED THEME
  // =========================================
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  }

  // =========================================
  // TOGGLE THEME
  // =========================================
  if (toggle) {
    toggle.addEventListener("click", function () {

      body.classList.toggle("dark-mode");

      if (body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.setItem("theme", "light");
      }

    });
  }

});