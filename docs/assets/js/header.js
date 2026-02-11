/* =========================================================
   Global Header Injection
   (Theme-Aware + Icon Sync v3 — Structure Aligned)
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
