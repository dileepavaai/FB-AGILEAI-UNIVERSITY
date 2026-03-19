document.addEventListener("DOMContentLoaded", function () {
  const el = document.getElementById("header");
  if (!el) return;

  el.innerHTML = `
    <header class="site-header">

      <!-- LEFT: SYSTEM IDENTITY -->
      <div class="nav-left">
        <a href="/" class="brand-link">Agile AI</a>
        <span class="nav-divider">|</span>
        <span class="nav-system">Capability System</span>
      </div>

      <!-- RIGHT: CONTROLS -->
      <div class="nav-right">

        <!-- NAVIGATION -->
        <nav class="site-nav" id="site-nav">
          <a href="/aipa.html">AIPA</a>
          <a href="/aaia.html">AAIA</a>
          <a href="https://spec.agileai.university">Registry</a>
          <a href="/contact.html">Apply</a>
        </nav>

        <!-- MOBILE MENU BUTTON -->
        <button id="menu-toggle" class="menu-toggle">☰</button>

        <!-- THEME TOGGLE -->
        <button id="theme-toggle" class="theme-toggle">◐</button>

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