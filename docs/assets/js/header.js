/* =========================================================
   Global Header Injection
   Institutional Navigation v4.3.5 — Stable + Mobile Enhanced
========================================================= */

const headerContainer = document.getElementById("header");

if (headerContainer) {

  headerContainer.innerHTML = `
    <header class="site-header">
      <div class="header-inner">

        <div class="brand">
          <a href="index.html">AgileAI Foundation & Agile AI University</a>
        </div>

        <!-- Subtle Institutional Toggle Icon -->
        <button class="mobile-menu-toggle" aria-label="Open navigation" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav class="main-nav" aria-label="Primary Navigation">
          <ul>

            <li>
              <a href="index.html">Home</a>
            </li>

            <li class="dropdown">
              <a href="#" aria-haspopup="true" aria-expanded="false">
                Intellectual Foundation
              </a>
              <ul class="dropdown-menu">
                <li><a href="intellectual-foundation/capability-architecture.html">Capability Architecture</a></li>
                <li><a href="intellectual-foundation/agile-ai-ecosystem.html">Agile AI Ecosystem</a></li>
                <li><a href="intellectual-foundation/myths-framework.html">Myth Framework</a></li>
                <li><a href="intellectual-foundation/mindset-transition.html">Mindset Transition</a></li>
              </ul>
            </li>

            <li class="dropdown">
              <a href="#" aria-haspopup="true" aria-expanded="false">
                Programs
              </a>
              <ul class="dropdown-menu">
                <li>
                  <a href="aipa/index.html">
                    AIPA — Artificial Intelligence Professional Agilist
                  </a>
                </li>
              </ul>
            </li>

            <li>
              <a href="https://verify.agileai.university" target="_blank" rel="noopener">
                Verification
              </a>
            </li>

            <li>
              <a href="governance/index.html">Governance</a>
            </li>

          </ul>
        </nav>

        <div class="nav-backdrop"></div>

        <div class="theme-control">
          <button id="theme-toggle" aria-label="Toggle theme"></button>
        </div>

      </div>
    </header>
  `;

  /* =========================================================
     Active Link Detection
  ========================================================= */

  const currentPath = window.location.pathname.replace(/\/$/, "");

  document.querySelectorAll(".main-nav a").forEach(link => {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("http") || href === "#") return;

    const normalizedHref = href.replace("index.html", "").replace(/\/$/, "");

    if (currentPath.endsWith(normalizedHref)) {
      link.classList.add("active");

      const parentDropdown = link.closest(".dropdown");
      if (parentDropdown) {
        const parentAnchor = parentDropdown.querySelector(":scope > a");
        if (parentAnchor) parentAnchor.classList.add("active");
      }
    }
  });

  /* =========================================================
     Scroll-Aware Header
  ========================================================= */

  const siteHeader = document.querySelector(".site-header");

  function getScrollThreshold() {
    return Math.min(window.innerHeight * 0.04, 60);
  }

  function handleHeaderScroll() {
    if (window.scrollY > getScrollThreshold()) {
      siteHeader.classList.add("scrolled");
    } else {
      siteHeader.classList.remove("scrolled");
    }
  }

  handleHeaderScroll();
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });
}


/* =========================================================
   Mobile Navigation Controller
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  const toggle = document.querySelector(".mobile-menu-toggle");
  const nav = document.querySelector(".main-nav");
  const backdrop = document.querySelector(".nav-backdrop");
  const body = document.body;

  if (!toggle || !nav || !backdrop) return;

  function openNav() {
    nav.classList.add("open");
    toggle.classList.add("active");
    toggle.setAttribute("aria-expanded", "true");
    body.classList.add("nav-open");
    backdrop.classList.add("active");
  }

  function closeNav() {
    nav.classList.remove("open");
    toggle.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
    body.classList.remove("nav-open");
    backdrop.classList.remove("active");

    // Close all dropdowns
    nav.querySelectorAll(".dropdown").forEach(d => d.classList.remove("open"));
  }

  /* Toggle Main Menu */
  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    nav.classList.contains("open") ? closeNav() : openNav();
  });

  /* Tap Outside */
  backdrop.addEventListener("click", closeNav);

  /* Auto-close on link click */
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function () {
      if (window.innerWidth <= 768) {
        closeNav();
      }
    });
  });

  /* Dropdown toggle (mobile only) */
  nav.querySelectorAll(".dropdown > a").forEach(link => {
    link.addEventListener("click", function (e) {

      if (window.innerWidth <= 768) {
        e.preventDefault();

        const parent = this.parentElement;

        // Close other dropdowns
        nav.querySelectorAll(".dropdown").forEach(d => {
          if (d !== parent) d.classList.remove("open");
        });

        parent.classList.toggle("open");
      }

    });
  });

});
