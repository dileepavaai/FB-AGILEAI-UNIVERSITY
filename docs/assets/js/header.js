/* =========================================================
   Global Header Injection
   Institutional Navigation v5.1
   - Arrow Rotation
   - Scroll Direction Hide/Show
   - Mobile Focus Trap
   - Active Detection
   - ARIA Menubar Support
   - Production Safe + Idempotent
========================================================= */

(function () {

  function injectHeader() {

    const headerContainer = document.getElementById("header");
    if (!headerContainer) return;
    if (headerContainer.dataset.injected === "true") return;

    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* =========================================================
       Inject Markup
    ========================================================= */

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
    const body = document.body;

    if (!header || !toggle || !nav) return;

    /* =========================================================
       Active Page Detection
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
       Scroll Shrink + Direction Hide/Show
    ========================================================= */

    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentScroll = window.scrollY;

      // Shrink at 80px
      if (currentScroll > 80) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }

      // Hide on scroll down, show on scroll up
      if (currentScroll > lastScrollY && currentScroll > 120) {
        header.classList.add("nav-hidden");
      } else {
        header.classList.remove("nav-hidden");
      }

      lastScrollY = currentScroll;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });

    /* =========================================================
       Mobile Nav Open / Close
    ========================================================= */

    function openNav() {
      nav.classList.add("open");
      toggle.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
      body.classList.add("nav-open");
      if (backdrop) backdrop.classList.add("active");

      trapFocus();
    }

    function closeNav() {
      nav.classList.remove("open");
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      body.classList.remove("nav-open");
      if (backdrop) backdrop.classList.remove("active");

      nav.querySelectorAll(".dropdown").forEach(d => {
        d.classList.remove("open");
        const trigger = d.querySelector(":scope > a");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      });
    }

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      nav.classList.contains("open") ? closeNav() : openNav();
    });

    if (backdrop) backdrop.addEventListener("click", closeNav);

    /* =========================================================
       Dropdown Toggle + Arrow Rotation
    ========================================================= */

    nav.querySelectorAll(".dropdown > a").forEach(trigger => {

      trigger.addEventListener("click", function (e) {

        if (window.innerWidth <= 768) {

          e.preventDefault();
          const parent = this.parentElement;
          const expanded = parent.classList.contains("open");

          nav.querySelectorAll(".dropdown").forEach(d => {
            d.classList.remove("open");
            const t = d.querySelector(":scope > a");
            if (t) t.setAttribute("aria-expanded", "false");
          });

          if (!expanded) {
            parent.classList.add("open");
            this.setAttribute("aria-expanded", "true");
          }
        }
      });

    });

    /* =========================================================
       Focus Trap (Mobile Menu)
    ========================================================= */

    function trapFocus() {

      const focusable = nav.querySelectorAll(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      nav.addEventListener("keydown", function (e) {

        if (e.key !== "Tab") return;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }

      });

      first.focus();
    }

    /* Reduced Motion */

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
