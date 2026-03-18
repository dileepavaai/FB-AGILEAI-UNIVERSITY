document.addEventListener("DOMContentLoaded", function () {
  const el = document.getElementById("header");

  if (!el) return;

  el.innerHTML = `
    <header class="site-header">
      
      <!-- BRAND -->
      <div class="brand">
        <a href="/" class="brand-link">Agile AI Academy</a>
      </div>

      <!-- NAV -->
      <nav class="site-nav">
        <a href="/programs">Programs</a>
        <a href="/cohorts">Cohorts</a>
        <a href="/contact">Contact</a>
      </nav>

    </header>
  `;
});