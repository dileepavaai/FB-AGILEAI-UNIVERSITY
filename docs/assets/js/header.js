/* =========================================================
   Global Header Injection
   Institutional Navigation v2.3 — Layout Safe + Scoped
========================================================= */

const headerContainer = document.getElementById("header");

if (headerContainer) {

  headerContainer.innerHTML = `
    <header class="site-header">
      <div class="header-inner">

        <div class="brand">
          <a href="index.html">AgileAI Foundation & Agile AI University</a>
        </div>

        <nav class="main-nav" aria-label="Primary Navigation">
          <ul>

            <li>
              <a href="index.html">Home</a>
            </li>

            <li class="dropdown">
              <a href="#" class="dropdown-toggle" aria-haspopup="true" aria-expanded="false">
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
              <a href="#" class="dropdown-toggle" aria-haspopup="true" aria-expanded="false">
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
              <a href="https://verify.agileai.university" target="_blank" rel="noopener">
                Verification
              </a>
            </li>

            <li>
              <a href="governance/index.html">Governance</a>
            </li>

          </ul>
        </nav>

        <div class="theme-control">
          <button id="theme-toggle" aria-label="Toggle theme"></button>
        </div>

      </div>
    </header>
  `;

  /* =========================================================
     Active Link Detection (Safe Normalized Matching)
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
     Scroll-Aware Institutional Header (Stable)
  ========================================================= */

  const siteHeader = document.querySelector(".site-header");

  function getScrollThreshold() {
    return Math.min(window.innerHeight * 0.04, 60);
  }

  function handleHeaderScroll() {
    if (window.scrollY > getScrollThreshold()) {
      siteHeader.classList.add("scrolled");
    } else {
      siteHeader.classList.remove("scrolled");
    }
  }

  handleHeaderScroll();
  window.addEventListener("scroll", handleHeaderScroll, { passive: true });

}
