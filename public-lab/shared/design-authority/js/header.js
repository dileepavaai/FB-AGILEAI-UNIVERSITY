/* ==========================================================
   AgileAI Shared Header Engine
   Version: v4.1
   Status: STABILIZED
   Architecture: Config-Driven Shared Institutional Header
   Scope: Structural Injection Controller Only

   Governance Notes:
   - Navigation defined per-surface via window.SURFACE_CONFIG
   - No analytics logic
   - No surface-specific branching
   - No hardcoded institutional navigation
   - Shared runtime-safe injection model
   - Compatible with shared design authority architecture

   v4.1 Changes:
   - Fixed runtime injection targeting mismatch
   - Updated container targeting:
       #header → #site-header
   - Added explicit runtime safety logging
   - Improved structural comments
   - Preserved existing interaction behavior
   - No visual/layout behavior changes

   Safety Model:
   - If SURFACE_CONFIG missing → safe fallback
   - If #site-header missing → controlled abort
   - Navigation rendering isolated
   - Mobile navigation state self-contained
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ======================================================
     CORE REFERENCES
  ====================================================== */

  const body = document.body;

  const currentPath = window.location.pathname
    .replace(/\/+$/, "")
    .replace(/\/index\.html$/, "") || "/";

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
      brandLabel = config.brand.label || brandLabel;
      brandHref = config.brand.href || brandHref;
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

      const isExternal = item.external === true;

      const target = isExternal
        ? `target="_blank" rel="noopener"`
        : "";

      const dataPath = item.dataPath
        ? `data-path="${item.dataPath}"`
        : "";

      return `
        <li role="none">
          <a role="menuitem"
             href="${item.href}"
             ${dataPath}
             ${target}>
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
            ${buildNavHTML(navigation)}
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

  /* ======================================================
     HEADER INJECTION TARGET
     v4.1 FIX:
     Corrected container selector mismatch
  ====================================================== */

  const headerContainer = document.getElementById("site-header");

  if (!headerContainer) {

    console.error(
      "AgileAI Header Engine: #site-header container not found"
    );

    return;
  }

  /* ======================================================
     HEADER RENDER
  ====================================================== */

  headerContainer.innerHTML = headerHTML;

  console.log(
    "AgileAI Header Engine v4.1 initialized successfully"
  );

  /* ======================================================
     ACTIVE NAVIGATION STATE
  ====================================================== */

  const navLinks = headerContainer.querySelectorAll(
    ".main-nav a[data-path]"
  );

  navLinks.forEach(link => {

    const linkPath = link.getAttribute("data-path");

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

  const hamburger = headerContainer.querySelector(
    ".nav-hamburger"
  );

  const nav = headerContainer.querySelector(
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

    hamburger.addEventListener("click", function () {

      const isOpen = body.classList.contains(
        "nav-open"
      );

      isOpen
        ? closeMobileNav()
        : openMobileNav();

    });
  }

  /* ======================================================
     OUTSIDE CLICK CLOSE
  ====================================================== */

  document.addEventListener("click", function (e) {

    if (!body.classList.contains("nav-open")) {
      return;
    }

    if (!e.target.closest(".site-header")) {
      closeMobileNav();
    }
  });

  /* ======================================================
     ESCAPE KEY CLOSE
  ====================================================== */

  document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {
      closeMobileNav();
    }
  });

  /* ======================================================
     DESKTOP RESET
  ====================================================== */

  window.addEventListener("resize", function () {

    if (window.innerWidth >= 769) {
      closeMobileNav();
    }
  });

  /* ======================================================
     LIFECYCLE EVENT
  ====================================================== */

  document.dispatchEvent(
    new Event("headerInjected")
  );

});