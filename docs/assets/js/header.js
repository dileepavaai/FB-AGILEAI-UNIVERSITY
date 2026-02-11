document.getElementById("header").innerHTML = `
  <header>
    <div class="header-inner">
      <div class="brand">
        <a href="index.html">AgileAI Foundation & Agile AI University</a>
      </div>
      <nav>
        <a href="index.html">Home</a>
        <a href="start-here.html">Start Here</a>
        <a href="core-concepts.html">Core Concepts</a>
        <a href="myths-and-misconceptions.html">Myths</a>
        <a href="sitemap.html">Sitemap</a>
      </nav>
    </div>
  </header>
`;

/* =========================
   Active Link Detection
========================= */

const currentPage = window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll("header nav a").forEach(link => {
  const linkPage = link.getAttribute("href");
  if (linkPage === currentPage) {
    link.classList.add("active");
  }
});
