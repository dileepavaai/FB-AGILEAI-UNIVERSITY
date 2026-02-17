document.addEventListener("DOMContentLoaded", function () {

  const headerHTML = `
    <header class="site-header">
      <div class="header-inner">

        <div class="brand">
          <a href="https://agileai.foundation" target="_blank" rel="noopener">
            Agile AI Foundation
          </a>
          <span class="brand-separator"> &amp; </span>
          <a href="https://agileai.university">
            Agile AI University
          </a>
        </div>

        <!-- Hamburger -->
        <button class="nav-hamburger"
                aria-label="Toggle Navigation"
                aria-expanded="false"
                aria-controls="primary-navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav class="main-nav" id="primary-navigation" aria-hidden="true">
          <ul class="nav-tree" role="menubar">

            <li class="nav-item" role="none">
              <a href="/" role="menuitem">Home</a>
            </li>

            <li class="nav-item has-children" role="none">
              <button class="nav-toggle"
                      aria-expanded="false">
                Intellectual Foundation
              </button>
              <ul class="sub-menu" role="menu">
                <li role="none"><a role="menuitem"
                  href="/intellectual-foundation/capability-architecture.html">
                  Capability Architecture</a></li>
                <li role="none"><a role="menuitem"
                  href="/intellectual-foundation/agile-ai-ecosystem.html">
                  Agile AI Ecosystem</a></li>
                <li role="none"><a role="menuitem"
                  href="/intellectual-foundation/myth-framework.html">
                  Myth Framework</a></li>
                <li role="none"><a role="menuitem"
                  href="/intellectual-foundation/mindset-transition.html">
                  Mindset Transition</a></li>
              </ul>
            </li>

            <li class="nav-item has-children" role="none">
              <button class="nav-toggle"
                      aria-expanded="false">
                Programs
              </button>
              <ul class="sub-menu" role="menu">
                <li role="none">
                  <a role="menuitem" href="/public-assessment/">
                    Agile + AI Capability Assessment
                  </a>
                </li>
                <li role="none">
                  <a role="menuitem" href="/academics/">
                    Academic Frameworks
                  </a>
                </li>

                <li class="nav-item has-children" role="none">
                  <button class="nav-toggle"
                          aria-expanded="false">
                    Professional Pathways
                  </button>
                  <ul class="sub-menu" role="menu">
                    <li role="none"><a role="menuitem"
                      href="/credentials/practitioner.html">Practitioner</a></li>
                    <li role="none"><a role="menuitem"
                      href="/credentials/manager.html">Manager</a></li>
                    <li role="none"><a role="menuitem"
                      href="/credentials/leader.html">Leader</a></li>
                  </ul>
                </li>

              </ul>
            </li>

            <li role="none"><a role="menuitem"
              href="/verification/">Verification</a></li>
            <li role="none"><a role="menuitem"
              href="/governance/">Governance</a></li>
            <li role="none"><a role="menuitem"
              href="/contact/">Contact</a></li>

          </ul>
        </nav>

        <div class="theme-control">
          <button id="theme-toggle">☀</button>
        </div>

      </div>
    </header>
  `;

  const headerContainer = document.getElementById("header");
  if (!headerContainer) return;

  headerContainer.innerHTML = headerHTML;

  const body = document.body;
  const hamburger = document.querySelector(".nav-hamburger");
  const nav = document.querySelector(".main-nav");
  const toggles = document.querySelectorAll(".nav-toggle");

  /* =========================
     HAMBURGER TOGGLE
  ========================= */

  function closeMobileNav() {
    body.classList.remove("nav-open");
    hamburger.setAttribute("aria-expanded", "false");
    nav.setAttribute("aria-hidden", "true");
  }

  function openMobileNav() {
    body.classList.add("nav-open");
    hamburger.setAttribute("aria-expanded", "true");
    nav.setAttribute("aria-hidden", "false");
  }

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      const isOpen = body.classList.contains("nav-open");
      isOpen ? closeMobileNav() : openMobileNav();
    });
  }

  /* =========================
     ACCORDION
  ========================= */

  toggles.forEach(toggle => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();

      const parent = this.parentElement;
      const isOpen = parent.classList.contains("is-open");

      parent.classList.toggle("is-open");
      this.setAttribute("aria-expanded", !isOpen);
    });
  });

  /* =========================
     OUTSIDE CLICK CLOSE
  ========================= */

  document.addEventListener("click", function (e) {
    if (!body.classList.contains("nav-open")) return;

    if (!e.target.closest(".site-header")) {
      closeMobileNav();
    }
  });

  /* =========================
     ESC KEY CLOSE
  ========================= */

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMobileNav();
    }
  });

  /* =========================
     DESKTOP RESET
  ========================= */

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 769) {
      closeMobileNav();
      document.querySelectorAll(".nav-item.is-open")
        .forEach(item => item.classList.remove("is-open"));
    }
  });

  /* =========================
     THEME SAFETY RULE
  ========================= */

  document.dispatchEvent(new Event("headerInjected"));

});
