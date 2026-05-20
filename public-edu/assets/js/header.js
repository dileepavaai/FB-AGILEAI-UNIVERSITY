/* =========================================================
   Agile AI University
   Institutional Navigation Architecture
   Version: 2.0
   Governance State: STABILIZED
   Surface: public-edu
========================================================= */

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

        <!-- =====================================================
             HAMBURGER NAVIGATION
        ====================================================== -->

        <button class="nav-hamburger"
                aria-label="Toggle Navigation"
                aria-expanded="false"
                aria-controls="primary-navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <!-- =====================================================
             INSTITUTIONAL NAVIGATION
        ====================================================== -->

        <nav class="main-nav"
             id="primary-navigation"
             aria-hidden="true">

          <ul class="nav-tree" role="menubar">

            <!-- =================================================
                 HOME
            ================================================== -->

            <li class="nav-item" role="none">
              <a href="/" role="menuitem">Home</a>
            </li>

            <!-- =================================================
                 INTELLECTUAL FOUNDATION
            ================================================== -->

            <li class="nav-item has-children" role="none">

              <button class="nav-toggle"
                      aria-expanded="false">
                Intellectual Foundation
              </button>

              <ul class="sub-menu" role="menu">

                <li role="none">
                  <a role="menuitem"
                     href="/intellectual-foundation/capability-architecture.html">
                    Capability Architecture
                  </a>
                </li>

                <li role="none">
                  <a role="menuitem"
                     href="/intellectual-foundation/agile-ai-ecosystem.html">
                    Agile AI Ecosystem
                  </a>
                </li>

                <li role="none">
                  <a role="menuitem"
                     href="/intellectual-foundation/myth-framework.html">
                    Myth Framework
                  </a>
                </li>

                <li role="none">
                  <a role="menuitem"
                     href="/intellectual-foundation/mindset-transition.html">
                    Mindset Transition
                  </a>
                </li>

              </ul>

            </li>

            <!-- =================================================
                 OPERATIONAL EXPERIENCE
            ================================================== -->

            <li class="nav-item has-children" role="none">

              <button class="nav-toggle"
                      aria-expanded="false">
                Operational Experience
              </button>

              <ul class="sub-menu" role="menu">

                <li role="none">
                  <a role="menuitem"
                     href="/leadership-lab/">
                    Agile AI Leadership Lab
                  </a>
                </li>

                <li role="none">
                  <a role="menuitem"
                     href="/leadership-lab/classic-environment.html">
                    Classic Operational Environment
                  </a>
                </li>

                <li role="none">
                  <a role="menuitem"
                     href="/leadership-lab/agile-ai-environment.html">
                    Agile AI Environment
                  </a>
                </li>

                <li role="none">
                  <a role="menuitem"
                     href="/leadership-lab/operational-signals.html">
                    Operational Signals
                  </a>
                </li>

              </ul>

            </li>

            <!-- =================================================
                 PROGRAMS
            ================================================== -->

            <li class="nav-item has-children" role="none">

              <button class="nav-toggle"
                      aria-expanded="false">
                Programs
              </button>

              <ul class="sub-menu" role="menu">

                <li role="none">
                  <a role="menuitem"
                     href="/public-assessment/">
                    Agile + AI Capability Assessment
                  </a>
                </li>

                <li role="none">
                  <a role="menuitem"
                     href="/academics/">
                    Academic Frameworks
                  </a>
                </li>

                <li class="nav-item has-children" role="none">

                  <button class="nav-toggle"
                          aria-expanded="false">
                    Professional Pathways
                  </button>

                  <ul class="sub-menu" role="menu">

                    <li role="none">
                      <a role="menuitem"
                         href="/credentials/practitioner.html">
                        Practitioner
                      </a>
                    </li>

                    <li role="none">
                      <a role="menuitem"
                         href="/credentials/manager.html">
                        Manager
                      </a>
                    </li>

                    <li role="none">
                      <a role="menuitem"
                         href="/credentials/leader.html">
                        Leader
                      </a>
                    </li>

                  </ul>

                </li>

              </ul>

            </li>

            <!-- =================================================
                 GOVERNANCE & ACCESS
            ================================================== -->

            <li role="none">
              <a role="menuitem"
                 href="/verification/">
                Verification
              </a>
            </li>

            <li role="none">
              <a role="menuitem"
                 href="/governance/">
                Governance
              </a>
            </li>

            <li role="none">
              <a role="menuitem"
                 href="/contact/">
                Contact
              </a>
            </li>

          </ul>

        </nav>

        <!-- =====================================================
             THEME CONTROL
        ====================================================== -->

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

  /* =========================================================
     MOBILE NAVIGATION CONTROL
  ========================================================= */

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

  /* =========================================================
     ACCORDION NAVIGATION
  ========================================================= */

  toggles.forEach(toggle => {

    toggle.addEventListener("click", function (e) {

      e.preventDefault();

      const parent = this.parentElement;
      const isOpen = parent.classList.contains("is-open");

      parent.classList.toggle("is-open");

      this.setAttribute("aria-expanded", !isOpen);

    });

  });

  /* =========================================================
     OUTSIDE CLICK CLOSE
  ========================================================= */

  document.addEventListener("click", function (e) {

    if (!body.classList.contains("nav-open")) return;

    if (!e.target.closest(".site-header")) {
      closeMobileNav();
    }

  });

  /* =========================================================
     ESC KEY CLOSE
  ========================================================= */

  document.addEventListener("keydown", function (e) {

    if (e.key === "Escape") {
      closeMobileNav();
    }

  });

  /* =========================================================
     DESKTOP RESET
  ========================================================= */

  window.addEventListener("resize", function () {

    if (window.innerWidth >= 769) {

      closeMobileNav();

      document
        .querySelectorAll(".nav-item.is-open")
        .forEach(item => item.classList.remove("is-open"));

    }

  });

  /* =========================================================
     THEME EVENT
  ========================================================= */

  document.dispatchEvent(new Event("headerInjected"));

});