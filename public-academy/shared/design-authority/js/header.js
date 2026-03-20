document.addEventListener("DOMContentLoaded", function () {
  const el = document.getElementById("header");
  if (!el) return;

  // Prevent duplicate injection (safety)
  if (document.getElementById("site-header")) return;

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
     SCROLL INTELLIGENCE (HEADER)
  ============================== */
  const header = document.getElementById("site-header");

  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  }

  /* ==============================
     SCROLL REVEAL (FINAL LAYER)
  ============================== */
  const revealElements = document.querySelectorAll(
    ".section, .card, .hero h1, .hero p, .cta-group"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px" // smoother trigger before full visibility
      }
    );

    revealElements.forEach((el) => {
      el.classList.add("reveal");
      observer.observe(el);
    });
  } else {
    // fallback (older browsers)
    revealElements.forEach((el) => {
      el.classList.add("reveal-visible");
    });
  }

});