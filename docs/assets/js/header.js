/* =========================================================
   Global Header Injection
   (Structured Nav + Theme-Aware + Icon Sync v3)
========================================================= */

document.getElementById("header").innerHTML = `
  <header>
    <div class="header-inner">
      <div class="brand">
        <a href="index.html">AgileAI Foundation & Agile AI University</a>
      </div>

      <nav class="main-nav">
        <ul>
          <li><a href="index.html">Home</a></li>
          <li><a href="start-here.html">Start Here</a></li>
          <li><a href="core-concepts.html">Core Concepts</a></li>
          <li><a href="myths-and-misconceptions.html">Myths</a></li>
          <li><a href="sitemap.html">Sitemap</a></li>
        </ul>
      </nav>

      <div class="theme-control">
        <button id="theme-toggle" aria-label="Toggle theme"></button>
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
   THEME ICON CONTROL
========================================================= */

const themeButton = document.getElementById("theme-toggle");
const STORAGE_KEY = "aa_theme";

function updateThemeIcon() {
  const saved = localStorage.getItem(STORAGE_KEY) || "system";

  themeButton.classList.remove("theme-icon-fade");
  void themeButton.offsetWidth; // force reflow
  themeButton.classList.add("theme-icon-fade");

  if (saved === "light") {
    themeButton.textContent = "🌞";
  } else if (saved === "dark") {
    themeButton.textContent = "🌙";
  } else {
    themeButton.textContent = "🖥️";
  }
}
