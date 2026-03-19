document.addEventListener("DOMContentLoaded", function () {
  const el = document.getElementById("header");
  if (!el) return;

  el.innerHTML = `
    <header class="site-header" id="site-header">

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
          <a href="/aipa.html" data-link="aipa">AIPA</a>
          <a href="/aaia.html" data-link="aaia">AAIA</a>
          <a href="https://spec.agileai.university" data-link="registry">Registry</a>
          <a href="/contact.html" data-link="contact">Apply</a>
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

  /* ==============================
     ACTIVE NAV HIGHLIGHT
  ============================== */
  const path = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll(".site-nav a");

  navLinks.forEach(link => {
    const key = link.getAttribute("data-link");

    if (
      (path.includes("aipa") && key === "aipa") ||
      (path.includes("aaia") && key === "aaia") ||
      (path.includes("contact") && key === "contact")
    ) {
      link.classList.add("active");
    }
  });

  /* ==============================
     SCROLL INTELLIGENCE (SAFE)
  ============================== */
  const header = document.getElementById("site-header");

  if (header) {
    let lastScroll = 0;

    window.addEventListener("scroll", () => {
      const currentScroll = window.scrollY;

      // Add "scrolled" state
      if (currentScroll > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      lastScroll = currentScroll;
    });
  }

});