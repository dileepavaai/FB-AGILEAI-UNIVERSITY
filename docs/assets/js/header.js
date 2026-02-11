/* =========================================================
   Global Header Injection
========================================================= */

document.getElementById("header").innerHTML = `
  <header>
    <div class="header-inner">
      <div class="brand">
        <a href="index.html">AgileAI Foundation & Agile AI University</a>
      </div>

      <nav class="main-nav">
        <a href="index.html">Home</a>
        <a href="start-here.html">Start Here</a>
        <a href="core-concepts.html">Core Concepts</a>
        <a href="myths-and-misconceptions.html">Myths</a>
        <a href="sitemap.html">Sitemap</a>
      </nav>

      <div class="theme-control">
        <button id="theme-toggle" aria-label="Toggle theme">
          ◐
        </button>
      </div>
    </div>
  </header>
`;


/* =========================================================
   Active Link Detection
========================================================= */

const currentPage =
  window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll("header nav a").forEach(link => {
  const linkPage = link.getAttribute("href");
  if (linkPage === currentPage) {
    link.classList.add("active");
  }
});


/* =========================================================
   Theme Toggle Wiring
   (Requires assets/js/theme.js loaded globally)
========================================================= */

const themeButton = document.getElementById("theme-toggle");

if (themeButton && window.AATheme) {
  themeButton.addEventListener("click", function () {
    window.AATheme.toggle();
  });
}
