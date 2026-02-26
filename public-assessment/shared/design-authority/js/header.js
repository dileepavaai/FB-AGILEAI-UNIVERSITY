/* ==========================================================
   AgileAI Shared Header Engine
   Version: v4.0 (Config-Driven Architecture)
   Scope: Structural Controller Only
   Navigation defined per-surface via window.SURFACE_CONFIG

   Safety Model:
   - If SURFACE_CONFIG missing → safe minimal fallback
   - No analytics logic
   - No surface branching
   - No hardcoded navigation
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

  const body = document.body;
  const currentPath = window.location.pathname
    .replace(/\/+$/, "")
    .replace(/\/index\.html$/, "") || "/";

  const config = window.SURFACE_CONFIG || null;

  let brandLabel = "Agile AI University";
  let brandHref = "/";
  let navigation = [];

  // Safe Fallback (Option B)
  if (config && typeof config === "object") {
    if (config.brand) {
      brandLabel = config.brand.label || brandLabel;
      brandHref = config.brand.href || brandHref;
    }
    if (Array.isArray(config.navigation)) {
      navigation = config.navigation;
    }
  }

  function buildNavHTML(navItems) {
    return navItems.map(item => {
      const isExternal = item.external === true;
      const target = isExternal ? `target="_blank" rel="noopener"` : "";
      const dataPath = item.dataPath ? `data-path="${item.dataPath}"` : "";

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

  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  headerContainer.innerHTML = headerHTML;

  /* =====================================================
     ACTIVE STATE
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
     MOBILE NAV
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

  document.dispatchEvent(new Event("headerInjected"));

});