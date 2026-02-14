/* =========================================================  
   Global Header Injection
   Institutional Navigation v5.6 (Viewport-Resilient Premium Build)
   - Early Theme Resolution
   - Viewport Edge Detection (Resize Safe)
   - Desktop Hover Intent Buffer
   - Scroll Shrink (80px)
   - Scroll Direction Hide/Show
   - Mobile Nav Stable
   - Active Detection
   - ARIA Support (Hardened)
   - Production Safe
========================================================= */

(function () {

  /* =========================================================
     EARLY THEME RESOLUTION
  ========================================================= */

  (function applyInitialTheme() {
    const savedTheme = localStorage.getItem("aa_theme") || "system";

    function resolveSystemTheme() {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    const finalTheme =
      savedTheme === "system" ? resolveSystemTheme() : savedTheme;

    document.documentElement.setAttribute("data-theme", finalTheme);
  })();


  /* =========================================================
     HEADER INJECTION
  ========================================================= */

  function injectHeader() {

    const headerContainer = document.getElementById("header");
    if (!headerContainer) return;
    if (headerContainer.dataset.injected === "true") return;

    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    headerContainer.innerHTML = `
      <header class="site-header">
        <div class="header-inner">

          <div class="brand">
            <a href="/index.html">AgileAI Foundation & Agile AI University</a>
          </div>

          <button class="mobile-menu-toggle"
                  aria-label="Open navigation"
                  aria-expanded="false"
                  aria-controls="primary-navigation">
            <span class="menu-icon"></span>
          </button>

          <nav class="main-nav"
               id="primary-navigation"
               aria-label="Primary Navigation">

            <ul role="menubar">

              <li role="none">
                <a role="menuitem" href="/index.html">Home</a>
              </li>

              <li class="dropdown" role="none">
                <a role="menuitem"
                   href="#"
                   aria-haspopup="true"
                   aria-expanded="false">
                  Intellectual Foundation
                  <span class="dropdown-arrow">▾</span>
                </a>
                <ul class="dropdown-menu" role="menu">
                  <li role="none"><a role="menuitem" href="/intellectual-foundation/capability-architecture.html">Capability Architecture</a></li>
                  <li role="none"><a role="menuitem" href="/intellectual-foundation/agile-ai-ecosystem.html">Agile AI Ecosystem</a></li>
                  <li role="none"><a role="menuitem" href="/intellectual-foundation/myths-framework.html">Myth Framework</a></li>
                  <li role="none"><a role="menuitem" href="/intellectual-foundation/mindset-transition.html">Mindset Transition</a></li>
                </ul>
              </li>

              <li class="dropdown" role="none">
                <a role="menuitem"
                   href="#"
                   aria-haspopup="true"
                   aria-expanded="false">
                  Programs
                  <span class="dropdown-arrow">▾</span>
                </a>
                <ul class="dropdown-menu" role="menu">
                  <li role="none">
                    <a role="menuitem" href="/aipa/index.html">
                      <span class="menu-title">AIPA</span>
                      <span class="menu-sub">
                        Artificial Intelligence Professional Agilist
                      </span>
                    </a>
                  </li>
                </ul>
              </li>

              <li role="none">
                <a role="menuitem"
                   href="https://verify.agileai.university"
                   target="_blank"
                   rel="noopener">
                  Verification
                </a>
              </li>

              <li role="none">
                <a role="menuitem" href="/governance/index.html">
                  Governance
                </a>
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

    headerContainer.dataset.injected = "true";

    const header = headerContainer.querySelector(".site-header");
    const toggle = headerContainer.querySelector(".mobile-menu-toggle");
    const nav = headerContainer.querySelector(".main-nav");
    const backdrop = headerContainer.querySelector(".nav-backdrop");
    const themeToggle = headerContainer.querySelector("#theme-toggle");
    const body = document.body;

    if (!header || !toggle || !nav) return;

    /* =========================================================
       THEME TOGGLE (Safe Binding)
    ========================================================= */

    function resolveSystemTheme() {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    function applyTheme(theme) {
      const finalTheme =
        theme === "system" ? resolveSystemTheme() : theme;

      document.documentElement.setAttribute("data-theme", finalTheme);
      localStorage.setItem("aa_theme", theme);
    }

    if (themeToggle && !themeToggle.dataset.bound) {
      themeToggle.addEventListener("click", () => {
        const current = localStorage.getItem("aa_theme") || "system";
        const next =
          current === "light" ? "dark" :
          current === "dark" ? "system" :
          "light";
        applyTheme(next);
      });
      themeToggle.dataset.bound = "true";
    }

    /* =========================================================
       ACTIVE PAGE DETECTION
    ========================================================= */

    const currentPath = window.location.pathname.replace(/\/$/, "");

    nav.querySelectorAll("a[href]").forEach(link => {
      const linkPath = new URL(link.href, window.location.origin)
        .pathname.replace(/\/$/, "");

      if (currentPath === linkPath) {
        link.classList.add("active");
        const parent = link.closest(".dropdown");
        if (parent) parent.classList.add("active-parent");
      }
    });

    /* =========================================================
       DESKTOP HOVER + EDGE DETECTION (Resize Safe)
    ========================================================= */

    const desktopQuery = window.matchMedia("(min-width: 769px)");

    function setupDesktopDropdowns() {

      const dropdowns = nav.querySelectorAll(".dropdown");

      dropdowns.forEach(drop => {

        let closeTimer = null;
        const trigger = drop.querySelector(":scope > a");
        const menu = drop.querySelector(".dropdown-menu");

        function adjustAlignment() {
          if (!menu) return;

          drop.classList.remove("align-right");

          const rect = menu.getBoundingClientRect();
          if (rect.right > window.innerWidth) {
            drop.classList.add("align-right");
          }
        }

        drop.addEventListener("mouseenter", () => {
          if (closeTimer) clearTimeout(closeTimer);

          drop.classList.add("open");
          if (trigger) trigger.setAttribute("aria-expanded", "true");

          requestAnimationFrame(adjustAlignment);
        });

        drop.addEventListener("mouseleave", () => {
          closeTimer = setTimeout(() => {
            drop.classList.remove("open");
            drop.classList.remove("align-right");
            if (trigger) trigger.setAttribute("aria-expanded", "false");
          }, 140);
        });

        window.addEventListener("resize", adjustAlignment);
      });
    }

    if (desktopQuery.matches) {
      setupDesktopDropdowns();
    }

    desktopQuery.addEventListener("change", e => {
      if (!e.matches) {
        nav.querySelectorAll(".dropdown").forEach(d => {
          d.classList.remove("open", "align-right");
        });
      }
    });

    /* =========================================================
       SCROLL BEHAVIOR
    ========================================================= */

    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentScroll = window.scrollY;

      header.classList.toggle("scrolled", currentScroll > 80);

      if (currentScroll > lastScrollY && currentScroll > 120) {
        header.classList.add("nav-hidden");
      } else {
        header.classList.remove("nav-hidden");
      }

      lastScrollY = currentScroll;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    /* =========================================================
       MOBILE NAV
    ========================================================= */

    function openNav() {
      nav.classList.add("open");
      toggle.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
      body.classList.add("nav-open");
      if (backdrop) backdrop.classList.add("active");
    }

    function closeNav() {
      nav.classList.remove("open");
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      body.classList.remove("nav-open");
      if (backdrop) backdrop.classList.remove("active");
    }

    toggle.addEventListener("click", e => {
      e.stopPropagation();
      nav.classList.contains("open") ? closeNav() : openNav();
    });

    if (backdrop) backdrop.addEventListener("click", closeNav);

    if (prefersReducedMotion) {
      header.style.transition = "none";
    }

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectHeader);
  } else {
    injectHeader();
  }

})();
