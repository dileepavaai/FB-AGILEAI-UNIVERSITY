document.addEventListener("DOMContentLoaded", function () {

  // Restore saved theme before injection
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  fetch("/assets/partials/header.html")
    .then(response => response.text())
    .then(data => {

      const container = document.getElementById("site-header");
      if (!container) return;

      container.innerHTML = data;

      bindHeaderInteractions();
      bindThemeToggle();

      document.dispatchEvent(new Event("headerInjected"));

    })
    .catch(error => {
      console.error("Header injection failed:", error);
    });

});


/* =======================================================
   MOBILE NAVIGATION
======================================================= */

function bindHeaderInteractions() {

  const hamburger = document.querySelector(".hamburger");
  const navList = document.querySelector(".nav-list");

  if (!hamburger || !navList) return;

  hamburger.addEventListener("click", function () {

    const isOpen = navList.classList.toggle("mobile-open");

    document.body.classList.toggle("menu-open", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen);

  });

  const submenuParents = document.querySelectorAll(".has-submenu > a");

  submenuParents.forEach(link => {

    link.addEventListener("click", function (e) {

      if (window.innerWidth <= 768) {

        e.preventDefault();
        this.parentElement.classList.toggle("submenu-open");

      }

    });

  });

  window.addEventListener("resize", function () {

    if (window.innerWidth > 768) {
      navList.classList.remove("mobile-open");
      document.body.classList.remove("menu-open");
      hamburger.setAttribute("aria-expanded", "false");
    }

  });

}


/* =======================================================
   THEME TOGGLE (FIXED)
======================================================= */

function bindThemeToggle() {

  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  updateThemeIcon();

  toggle.addEventListener("click", function () {

    const currentTheme = document.documentElement.getAttribute("data-theme");

    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    updateThemeIcon();

  });

}


function updateThemeIcon() {

  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  const currentTheme = document.documentElement.getAttribute("data-theme");

  toggle.textContent = currentTheme === "dark" ? "☀" : "☾";

}
