/* ==========================================================
   Agile AI University
   Shared Institutional Header Engine

   File:
   /shared/design-authority/js/header.js

   Version:
   v7.2

   Status:
   STABILIZED

   Architecture:
   Config-Driven Shared Institutional Shell

   Scope:
   Shared Header Injection Runtime

   ==========================================================

   GOVERNANCE CONTEXT

   This shared runtime engine provides the canonical
   institutional header experience across Agile AI
   University hosting surfaces.

   Supported Surfaces:
   - Institutional Site
   - Knowledge Surface
   - Leadership Lab
   - Portal
   - Environment Ecosystems
   - Future Institutional Surfaces

   ==========================================================

   ARCHITECTURAL PRINCIPLES

   - Shared design authority architecture
   - Config-driven institutional navigation
   - Surface-isolated runtime behavior
   - Runtime-safe injection lifecycle
   - Mobile-safe navigation orchestration
   - Accessibility-aware navigation controls
   - Independent hosting surface compatibility
   - No hardcoded institutional branching
   - No analytics dependencies
   - No footer coupling

   ==========================================================

   REQUIRED RUNTIME STRUCTURE

   Required Injection Mount:
   - #site-header

   Required Runtime Config:
   - window.SURFACE_CONFIG

   Optional Runtime Features:
   - data-path active navigation detection
   - external navigation targeting
   - mobile navigation orchestration

   ==========================================================

   SAFETY MODEL

   - Safe fallback if SURFACE_CONFIG missing
   - Controlled abort if #site-header missing
   - Navigation rendering isolated per surface
   - Mobile navigation state self-contained
   - Runtime-safe navigation initialization
   - No destructive DOM operations

   ==========================================================

   VERSION HISTORY

   v7.2
   - Institutional shell architecture stabilized
   - Shared hosting surface alignment standardized
   - Runtime-safe navigation lifecycle preserved
   - Environment ecosystem compatibility verified
   - Governance documentation expanded
   - Canonical institutional shell terminology aligned

   v4.1
   - Fixed container selector mismatch
   - #header → #site-header migration
   - Runtime injection safety improvements

========================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ======================================================
     CORE REFERENCES
  ====================================================== */

  const body = document.body;

  const currentPath = window.location.pathname
    .replace(/\/+$/, "")
    .replace(/\/index\.html$/, "")
    || "/";

  /* ======================================================
     SURFACE CONFIG
  ====================================================== */

  const config = window.SURFACE_CONFIG || null;

  let brandLabel = "Agile AI University";
  let brandHref = "/";
  let navigation = [];

  /* ======================================================
     SAFE CONFIG FALLBACK
  ====================================================== */

  if (config && typeof config === "object") {

    if (config.brand) {

      brandLabel =
        config.brand.label || brandLabel;

      brandHref =
        config.brand.href || brandHref;
    }

    if (Array.isArray(config.navigation)) {
      navigation = config.navigation;
    }
  }

  /* ======================================================
     NAVIGATION HTML BUILDER
  ====================================================== */

  function buildNavHTML(navItems) {

    return navItems.map(item => {

      const isExternal =
        item.external === true;

      const target = isExternal
        ? `target="_blank" rel="noopener"`
        : "";

      const dataPath = item.dataPath
        ? `data-path="${item.dataPath}"`
        : "";

      return `
        <li role="none">
          <a
            role="menuitem"
            href="${item.href}"
            ${dataPath}
            ${target}
          >
            ${item.label}
          </a>
        </li>
      `;

    }).join("");
  }

  /* ======================================================
     HEADER TEMPLATE
  ====================================================== */

  const headerHTML = `
    <header class="site-header">

      <div class="header-inner">

        <div class="brand">

          <a href="${brandHref}">
            ${brandLabel}
          </a>

        </div>

        <button
          class="nav-hamburger"
          type="button"
          aria-label="Toggle Navigation"
          aria-expanded="false"
          aria-controls="primary-navigation"
        >

          <span></span>
          <span></span>
          <span></span>

        </button>

        <nav
          class="main-nav"
          id="primary-navigation"
          aria-hidden="true"
        >

          <ul
            class="nav-tree"
            role="menubar"
          >

            ${buildNavHTML(navigation)}

          </ul>

        </nav>

        <div class="theme-control">

          <button
            id="theme-toggle"
            type="button"
            aria-label="Toggle Theme"
          >

            <span class="theme-icon">
              ☀
            </span>

          </button>

        </div>

      </div>

    </header>
  `;

  /* ======================================================
     HEADER INJECTION TARGET
  ====================================================== */

  const headerContainer =
    document.getElementById("site-header");

  if (!headerContainer) {

    console.error(
      "Agile AI Header Engine: #site-header container not found"
    );

    return;
  }

  /* ======================================================
     HEADER RENDER
  ====================================================== */

  headerContainer.innerHTML =
    headerHTML;

  console.log(
    "Agile AI Header Engine v7.2 initialized successfully"
  );

  /* ======================================================
     ACTIVE NAVIGATION STATE
  ====================================================== */

  const navLinks =
    headerContainer.querySelectorAll(
      ".main-nav a[data-path]"
    );

  navLinks.forEach(link => {

    const linkPath =
      link.getAttribute("data-path");

    if (
      currentPath === linkPath ||
      currentPath.startsWith(linkPath + "/")
    ) {

      link.classList.add("is-active");

      link.setAttribute(
        "aria-current",
        "page"
      );
    }
  });

  /* ======================================================
     MOBILE NAVIGATION CONTROLLER
  ====================================================== */

  const hamburger =
    headerContainer.querySelector(
      ".nav-hamburger"
    );

  const nav =
    headerContainer.querySelector(
      ".main-nav"
    );

  function closeMobileNav() {

    body.classList.remove("nav-open");

    if (hamburger) {

      hamburger.setAttribute(
        "aria-expanded",
        "false"
      );
    }

    if (nav) {

      nav.setAttribute(
        "aria-hidden",
        "true"
      );
    }
  }

  function openMobileNav() {

    body.classList.add("nav-open");

    if (hamburger) {

      hamburger.setAttribute(
        "aria-expanded",
        "true"
      );
    }

    if (nav) {

      nav.setAttribute(
        "aria-hidden",
        "false"
      );
    }
  }

  /* ======================================================
     HAMBURGER INTERACTION
  ====================================================== */

  if (hamburger) {

    hamburger.addEventListener(
      "click",
      function () {

        const isOpen =
          body.classList.contains(
            "nav-open"
          );

        isOpen
          ? closeMobileNav()
          : openMobileNav();

      }
    );
  }

  /* ======================================================
     OUTSIDE CLICK CLOSE
  ====================================================== */

  document.addEventListener(
    "click",
    function (e) {

      if (
        !body.classList.contains(
          "nav-open"
        )
      ) {
        return;
      }

      if (
        !e.target.closest(
          ".site-header"
        )
      ) {

        closeMobileNav();
      }
    }
  );

  /* ======================================================
     ESCAPE KEY CLOSE
  ====================================================== */

  document.addEventListener(
    "keydown",
    function (e) {

      if (e.key === "Escape") {
        closeMobileNav();
      }
    }
  );

  /* ======================================================
     DESKTOP RESET
  ====================================================== */

  window.addEventListener(
    "resize",
    function () {

      if (window.innerWidth >= 769) {
        closeMobileNav();
      }
    }
  );

  /* ======================================================
     HEADER LIFECYCLE EVENT
  ====================================================== */

  document.dispatchEvent(
    new Event("headerInjected")
  );

});