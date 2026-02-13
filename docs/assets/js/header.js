/* =========================================================
   Global Header Injection
   Institutional Navigation v4.5.0 — Accessible + Hardened
========================================================= */

(function () {

  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     Header Markup Injection
  ========================================================= */

  headerContainer.innerHTML = `
    <header class="site-header">
      <div class="header-inner">

        <div class="brand">
          <a href="index.html">AgileAI Foundation & Agile AI University</a>
        </div>

        <button class="mobile-menu-toggle"
                aria-label="Open navigation"
                aria-expanded="false">
          <span class="menu-icon"></span>
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
              <a href="https://verify.agileai.university"
                 target="_blank"
                 rel="noopener">
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
     Mobile Navigation Controller
  ========================================================= */

  const toggle = document.querySelector(".mobile-menu-toggle");
  const nav = document.querySelector(".main-nav");
  const backdrop = document.querySelector(".nav-backdrop");
  const body = document.body;

  if (!toggle || !nav || !backdrop) return;

  let focusableElements = [];
  let firstFocusable = null;
  let lastFocusable = null;

  function updateFocusable() {
    focusableElements = nav.querySelectorAll(
      "a, button, [tabindex]:not([tabindex='-1'])"
    );
    firstFocusable = focusableElements[0];
    lastFocusable = focusableElements[focusableElements.length - 1];
  }

  function openNav() {
    nav.classList.add("open");
    toggle.classList.add("active");
    toggle.setAttribute("aria-expanded", "true");
    body.classList.add("nav-open");
    backdrop.classList.add("active");

    updateFocusable();
    if (firstFocusable) firstFocusable.focus();
  }

  function closeNav() {
    nav.classList.remove("open");
    toggle.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
    body.classList.remove("nav-open");
    backdrop.classList.remove("active");

    nav.querySelectorAll(".dropdown").forEach(d => {
      d.classList.remove("open");
      const a = d.querySelector(":scope > a");
      if (a) a.setAttribute("aria-expanded", "false");
    });

    toggle.focus();
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    nav.classList.contains("open") ? closeNav() : openNav();
  });

  backdrop.addEventListener("click", closeNav);

  /* =========================================================
     Keyboard Support
  ========================================================= */

  document.addEventListener("keydown", function (e) {

    // Escape closes everything
    if (e.key === "Escape") {
      closeNav();
    }

    // Focus trap when mobile open
    if (nav.classList.contains("open") && e.key === "Tab") {
      if (focusableElements.length === 0) return;

      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  });

  /* =========================================================
     Dropdown Keyboard Navigation
  ========================================================= */

  nav.querySelectorAll(".dropdown > a").forEach(trigger => {

    trigger.addEventListener("keydown", function (e) {

      const parent = this.parentElement;
      const menu = parent.querySelector(".dropdown-menu");
      const items = menu.querySelectorAll("a");

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        parent.classList.toggle("open");
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        parent.classList.add("open");
        items[0]?.focus();
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        parent.classList.add("open");
        items[items.length - 1]?.focus();
      }
    });
  });

  /* =========================================================
     Reduced Motion Adjustment
  ========================================================= */

  if (prefersReducedMotion) {
    nav.style.transition = "none";
    backdrop.style.transition = "none";
  }

})();
