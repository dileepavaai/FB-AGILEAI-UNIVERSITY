/* ==========================================================
   AgileAI Shared Header Controller
   Governance Baseline: v2.0
   Current Version: v2.6 (Verify Governance + Analytics Alignment)
   Status: LOCKED
   Scope: Shared Design Authority Layer

   Change Log v2.6:
   - Treat "verify" surface as Certs Governance Surface
   - Map "verify" to certs GA4 stream
   - No structural DOM changes
   - No navigation mutation
   - Analytics architecture preserved

   Governance Rules:
   - No structural DOM changes without version bump
   - No navigation logic mutation without governance review
   - Surface-specific menus must rely on data-surface attribute
   - Active state detection must remain data-path based
   - Mobile behavior must remain CSS-driven (no layout overrides)
   - Theme control markup must remain consistent across surfaces
   - Analytics injection must remain centralized and surface-bound
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const body = document.body;
  const surface = body.getAttribute("data-surface") || "";
  const currentPath = window.location.pathname.replace(/\/$/, "");

  let headerHTML = "";


  /* =====================================================
     CERTS SURFACE — Minimal Governance Menu
     Surfaces included:
     - certs
     - verify
  ===================================================== */

  if (surface === "certs" || surface === "verify") {

    headerHTML = `
      <header class="site-header">
        <div class="header-inner">

          <div class="brand">
            <a href="https://agileai.university/">
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

    headerHTML = `
      <header class="site-header">
        <div class="header-inner">

          <div class="brand">
            <a href="https://agileai.foundation/"
               target="_blank"
               rel="noopener">
              Agile AI Foundation
            </a>
            <span class="brand-separator"> &amp; </span>
            <a href="https://agileai.university/">
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
     ACTIVE STATE DISCIPLINE
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
    }
  });


  /* =====================================================
     INSTITUTIONAL ANALYTICS LAYER (STRICT MODE)
  ===================================================== */

  const STREAM_MAP = {
    site: "G-79KD6F56DX",
    portal: "G-T4MGDE3G63",
    certs: "G-72N0GHGF1P",
    verify: "G-72N0GHGF1P",  // ← aligned to certs stream
    education: "G-J84CWBF2C4",
    assessment: "G-3Y7V3S3HJY"
  };

  if (!surface || !STREAM_MAP[surface]) {
    console.error("[AAI Analytics] Invalid or missing data-surface. GA4 not initialized.");
  } else {

    const MEASUREMENT_ID = STREAM_MAP[surface];

    const scriptTag = document.createElement("script");
    scriptTag.async = true;
    scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(scriptTag);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", MEASUREMENT_ID, {
      send_page_view: true,
      surface: surface
    });

    window.AAI_Track = function (action, object, params = {}) {
      if (!action || !object) return;
      const eventName = `${action}_${object}`;
      gtag("event", eventName, {
        surface: surface,
        ...params
      });
    };

    console.info(`[AAI Analytics] Initialized | Surface: ${surface}`);
  }


  /* =====================================================
     THEME SAFETY EVENT (DO NOT REMOVE)
  ===================================================== */

  document.dispatchEvent(new Event("headerInjected"));

});