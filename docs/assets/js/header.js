/* =========================================================
   Global Header Injection
   Institutional Navigation v4.7.2 — Execution Stabilized
========================================================= */

(function () {

  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =========================================================
     Inject Markup
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
          <ul role="menubar">

            <li role="none">
              <a role="menuitem" href="index.html">Home</a>
            </li>

            <li class="dropdown" role="none">
              <a role="menuitem"
                 href="#"
                 aria-haspopup="true"
                 aria-expanded="false">
                Intellectual Foundation
              </a>
              <ul class="dropdown-menu" role="menu">
                <li role="none"><a role="menuitem" href="intellectual-foundation/capability-architecture.html">Capability Architecture</a></li>
                <li role="none"><a role="menuitem" href="intellectual-foundation/agile-ai-ecosystem.html">Agile AI Ecosystem</a></li>
                <li role="none"><a role="menuitem" href="intellectual-foundation/myths-framework.html">Myth Framework</a></li>
                <li role="none"><a role="menuitem" href="intellectual-foundation/mindset-transition.html">Mindset Transition</a></li>
              </ul>
            </li>

            <li class="dropdown" role="none">
              <a role="menuitem"
                 href="#"
                 aria-haspopup="true"
                 aria-expanded="false">
                Programs
              </a>
              <ul class="dropdown-menu" role="menu">
                <li role="none">
                  <a role="menuitem" href="aipa/index.html">
                    AIPA — Artificial Intelligence Professional Agilist
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
              <a role="menuitem" href="governance/index.html">Governance</a>
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
     Bind Elements
  ========================================================= */

  const toggle = headerContainer.querySelector(".mobile-menu-toggle");
  const nav = headerContainer.querySelector(".main-nav");
  const backdrop = headerContainer.querySelector(".nav-backdrop");
  const body = document.body;

  if (!toggle || !nav) return;

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

    nav.querySelectorAll(".dropdown").forEach(d => {
      d.classList.remove("open");
      const a = d.querySelector(":scope > a");
      if (a) a.setAttribute("aria-expanded", "false");
    });
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    nav.classList.contains("open") ? closeNav() : openNav();
  });

  if (backdrop) backdrop.addEventListener("click", closeNav);

  nav.querySelectorAll(".dropdown > a").forEach(trigger => {
    trigger.addEventListener("click", function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const parent = this.parentElement;

        nav.querySelectorAll(".dropdown").forEach(d => {
          d.classList.remove("open");
        });

        parent.classList.toggle("open");
      }
    });
  });

})();
