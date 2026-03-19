document.addEventListener("DOMContentLoaded", function () {
  const el = document.getElementById("header");
  if (!el) return;

  el.innerHTML = `
    <header class="site-header">

      <!-- LEFT: BRAND + SYSTEM -->
      <div class="nav-left">
        <div class="brand">
          <a href="/" class="brand-link">Agile AI Academy</a>
          <span class="brand-sub">Capability System</span>
        </div>
      </div>

      <!-- RIGHT: NAV + CONTROLS -->
      <div class="nav-right">

        <!-- NAVIGATION -->
        <nav class="site-nav" id="site-nav">
          <a href="/aipa.html">AIPA</a>
          <a href="/aaia.html">AAIA</a>
          <a href="https://spec.agileai.university">Registry</a>
          <a href="/contact.html">Apply</a>
        </nav>

        <!-- THEME TOGGLE -->
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
          <span class="icon-light">☀️</span>
          <span class="icon-dark">🌙</span>
        </button>

        <!-- MOBILE MENU BUTTON -->
        <button id="menu-toggle" class="menu-toggle" aria-label="Menu">
          ☰
        </button>

      </div>

    </header>
  `;

  /* ==============================
     MOBILE MENU TOGGLE
  ============================== */
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("site-nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("active");
    });
  }
});