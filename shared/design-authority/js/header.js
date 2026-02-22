/* ==========================================================
   AgileAI Shared Header Controller
   Governance Baseline: v2.0
   Current Version: v2.2 (Structural Hardening Lock)
   Status: LOCKED
   Scope: Shared Design Authority Layer

   Governance Rules:
   - No structural DOM changes without version bump
   - No navigation logic mutation without governance review
   - Surface-specific menus must rely on data-surface attribute
   - Active state detection must remain data-path based
   - Mobile behavior must remain CSS-driven (no layout overrides)
   - Theme control markup must remain consistent across surfaces
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const body = document.body;
  const surface = body.getAttribute("data-surface") || "";
  const currentPath = window.location.pathname.replace(/\/$/, "");

  let headerHTML = "";


  /* =====================================================
     CERTS SURFACE — Minimal Governance Menu
  ===================================================== */

  if (surface === "certs") {

    headerHTML = `
      <header class="site-header">
        <div class="header-inner">

          <div class="brand">
            <a href="https://agileai.university">
              Agile AI University
            </a>
          </div>

          <button class="nav-hamburger"
                  type="button"
                  aria-label="Toggle Navigation"
                  aria-expanded="false"
                  aria-controls="primary-navigation">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav class="main-nav"
               id="primary-navigation"
               aria-hidden="true">
            <ul class="nav-tree" role="menubar">

              <li role="none">
                <a role="menuitem"
                   href="/verify.html"
                   data-path="/verify.html">
                   Verification
                </a>
              </li>

              <li role="none">
                <a role="menuitem"
                   href="https://agileai.university/credentials/framework.html">
                   Credential Framework
                </a>
              </li>

              <li role="none">
                <a role="menuitem"
                   href="https://agileai.university/governance/">
                   Governance
                </a>
              </li>

              <li role="none">
                <a role="menuitem"
                   href="https://agileai.university/contact/">
                   Contact
                </a>
              </li>

            </ul>
          </nav>

          <div class="theme-control">
            <button id="theme-toggle"
                    type="button"
                    aria-label="Toggle Theme">
              <span class="theme-icon">☀</span>
            </button>
          </div>

        </div>
      </header>
    `;

  } else {

  /* =====================================================
     DEFAULT SURFACE — Institutional Public Menu
  ===================================================== */

    headerHTML = `
      <header class="site-header">
        <div class="header-inner">

          <div class="brand">
            <a href="https://agileai.foundation"
               target="_blank"
               rel="noopener">
              Agile AI Foundation
            </a>
            <span class="brand-separator"> &amp; </span>
            <a href="https://agileai.university">
              Agile AI University
            </a>
          </div>

          <button class="nav-hamburger"
                  type="button"
                  aria-label="Toggle Navigation"
                  aria-expanded="false"
                  aria-controls="primary-navigation">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav class="main-nav"
               id="primary-navigation"
               aria-hidden="true">
            <ul class="nav-tree" role="menubar">

              <li role="none">
                <a role="menuitem"
                   href="/"
                   data-path="/">
                   Home
                </a>
              </li>

              <li role="none">
                <a role="menuitem"
                   href="/verification/"
                   data-path="/verification">
                   Verification
                </a>
              </li>

              <li role="none">
                <a role="menuitem"
                   href="/governance/"
                   data-path="/governance">
                   Governance
                </a>
              </li>

              <li role="none">
                <a role="menuitem"
                   href="/contact/"
                   data-path="/contact">
                   Contact
                </a>
              </li>

            </ul>
          </nav>

          <div class="theme-control">
            <button id="theme-toggle"
                    type="button"
                    aria-label="Toggle Theme">
              <span class="theme-icon">☀</span>
            </button>
          </div>

        </div>
      </header>
    `;
  }


  /* =====================================================
     INJECTION SAFETY
  ===================================================== */

  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  headerContainer.innerHTML = headerHTML;


  /* =====================================================
     ACTIVE STATE DISCIPLINE (Data-Path Based)
  ===================================================== */

  const navLinks = headerContainer.querySelectorAll(".main-nav a[data-path]");

  navLinks.forEach(link => {
    const linkPath = link.getAttribute("data-path");

    if (
      currentPath === linkPath ||
      currentPath.startsWith(linkPath + "/")
    ) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });


  /* =====================================================
     MOBILE NAVIGATION CONTROLLER
  ===================================================== */

  const hamburger = headerContainer.querySelector(".nav-hamburger");
  const nav = headerContainer.querySelector(".main-nav");
  const toggles = headerContainer.querySelectorAll(".nav-toggle");

  function closeMobileNav() {
    body.classList.remove("nav-open");
    if (hamburger) hamburger.setAttribute("aria-expanded", "false");
    if (nav) nav.setAttribute("aria-hidden", "true");
  }

  function openMobileNav() {
    body.classList.add("nav-open");
    if (hamburger) hamburger.setAttribute("aria-expanded", "true");
    if (nav) nav.setAttribute("aria-hidden", "false");
  }

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      const isOpen = body.classList.contains("nav-open");
      isOpen ? closeMobileNav() : openMobileNav();
    });
  }


  /* =====================================================
     SUBMENU ACCORDION
  ===================================================== */

  toggles.forEach(toggle => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      const parent = this.parentElement;
      const isOpen = parent.classList.contains("is-open");
      parent.classList.toggle("is-open");
      this.setAttribute("aria-expanded", String(!isOpen));
    });
  });


  /* =====================================================
     GLOBAL CLOSE CONTROLS
  ===================================================== */

  document.addEventListener("click", function (e) {
    if (!body.classList.contains("nav-open")) return;
    if (!e.target.closest(".site-header")) {
      closeMobileNav();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMobileNav();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 769) {
      closeMobileNav();
      headerContainer.querySelectorAll(".nav-item.is-open")
        .forEach(item => item.classList.remove("is-open"));
    }
  });


  /* =====================================================
     THEME SAFETY EVENT (DO NOT REMOVE)
  ===================================================== */

  document.dispatchEvent(new Event("headerInjected"));

});