/* =========================================================
   Global Header Injection
   AgileAI Public Surface — Stabilized Version
========================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {

    const headerContainer = document.getElementById("header");
    if (!headerContainer) return;

    /* =====================================================
       Inject Header Markup
    ===================================================== */

    headerContainer.innerHTML = `
      <header>
        <div class="header-inner">

          <div class="brand">
            <a href="index.html">
              AgileAI Foundation & Agile AI University
            </a>
          </div>

          <nav class="main-nav">
            <a href="index.html">Home</a>
            <a href="start-here.html">Start Here</a>
            <a href="core-concepts.html">Core Concepts</a>
            <a href="myths-and-misconceptions.html">Myths</a>
            <a href="sitemap.html">Sitemap</a>
          </nav>

          <div class="theme-control">
            <button id="theme-toggle"
                    aria-label="Toggle theme"
                    title="Toggle theme">
              ◐
            </button>
          </div>

        </div>
      </header>
    `;

    /* =====================================================
       Active Link Detection
    ===================================================== */

    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll("header nav a").forEach(function (link) {
      const linkPage = link.getAttribute("href");
      if (linkPage === currentPage) {
        link.classList.add("active");
      }
    });

    /* =====================================================
       Theme Toggle Wiring
       Requires assets/js/theme.js loaded in <head>
    ===================================================== */

    const themeButton = document.getElementById("theme-toggle");

    if (themeButton && window.AATheme && typeof window.AATheme.toggle === "function") {
      themeButton.addEventListener("click", function () {
        window.AATheme.toggle();
      });
    }

  });

})();
