/* =========================================================
   Global Header Injection
   Institutional Navigation v6.3 (Production Hardened)

   DESIGN GUARANTEES
   ---------------------------------------------------------
   - Theme fully handled by theme.js
   - Deterministic injection
   - Desktop hover (≥769px)
   - Touch/click toggle fallback
   - Outside click close
   - Scroll shrink + hide
   - Mobile nav safe
   - Active page detection
   - Emits headerInjected event
   - Idempotent
========================================================= */

(function () {

  function injectHeader() {

    const headerContainer = document.getElementById("header");
    if (!headerContainer) return;
    if (headerContainer.dataset.injected === "true") return;

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

            <ul>

              <li><a href="/index.html">Home</a></li>

              <li class="dropdown">
                <a href="#" aria-haspopup="true" aria-expanded="false">
                  Intellectual Foundation ▾
                </a>
                <ul class="dropdown-menu">
                  <li><a href="/intellectual-foundation/capability-architecture.html">Capability Architecture</a></li>
                  <li><a href="/intellectual-foundation/agile-ai-ecosystem.html">Agile AI Ecosystem</a></li>
                  <li><a href="/intellectual-foundation/myths-framework.html">Myth Framework</a></li>
                  <li><a href="/intellectual-foundation/mindset-transition.html">Mindset Transition</a></li>
                </ul>
              </li>

              <li class="dropdown">
                <a href="#" aria-haspopup="true" aria-expanded="false">
                  Programs ▾
                </a>
                <ul class="dropdown-menu">
                  <li>
                    <a href="/aipa/index.html">
                      Artificial Intelligence Professional Agilist (AIPA)
                    </a>
                  </li>
                </ul>
              </li>

              <li>
                <a href="https://verify.agileai.university"
                   target="_blank"
                   rel="noopener">
                  Verification
                </a>
              </li>

              <li>
                <a href="/governance/index.html">
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
    const body = document.body;

    if (!header || !toggle || !nav) return;

    /* =========================================================
       Notify theme.js (deterministic binding)
    ========================================================= */
    document.dispatchEvent(new Event("headerInjected"));

    /* =========================================================
       ACTIVE PAGE DETECTION
    ========================================================= */

    const currentPath = window.location.pathname.replace(/\/$/, "");

    nav.querySelectorAll("a[href]").forEach(link => {
      const linkPath = new URL(link.href, window.location.origin)
        .pathname.replace(/\/$/, "");

      if (currentPath === linkPath) {
        link.classList.add("active");
      }
    });

    /* =========================================================
       DROPDOWN SYSTEM
    ========================================================= */

    const dropdowns = nav.querySelectorAll(".dropdown");
    const desktopQuery = window.matchMedia("(min-width: 769px)");

    function closeAllDropdowns() {
      dropdowns.forEach(d => {
        d.classList.remove("open");
        const a = d.querySelector(":scope > a");
        if (a) a.setAttribute("aria-expanded", "false");
      });
    }

    dropdowns.forEach(drop => {

      const trigger = drop.querySelector(":scope > a");

      // CLICK (Touch-safe)
      trigger.addEventListener("click", (e) => {

        if (desktopQuery.matches) return;

        e.preventDefault();

        const isOpen = drop.classList.contains("open");
        closeAllDropdowns();

        if (!isOpen) {
          drop.classList.add("open");
          trigger.setAttribute("aria-expanded", "true");
        }
      });

      // DESKTOP HOVER
      drop.addEventListener("mouseenter", () => {
        if (!desktopQuery.matches) return;
        drop.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
      });

      drop.addEventListener("mouseleave", () => {
        if (!desktopQuery.matches) return;
        drop.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      });

    });

    // Outside click close
    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target)) {
        closeAllDropdowns();
      }
    });

    /* =========================================================
       SCROLL BEHAVIOR
    ========================================================= */

    let lastScrollY = window.scrollY;

    window.addEventListener("scroll", () => {

      const currentScroll = window.scrollY;

      header.classList.toggle("scrolled", currentScroll > 80);

      if (currentScroll > lastScrollY && currentScroll > 120) {
        header.classList.add("nav-hidden");
      } else {
        header.classList.remove("nav-hidden");
      }

      lastScrollY = currentScroll;

    }, { passive: true });

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
      closeAllDropdowns();
    }

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      nav.classList.contains("open") ? closeNav() : openNav();
    });

    if (backdrop) backdrop.addEventListener("click", closeNav);

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectHeader);
  } else {
    injectHeader();
  }

})();
