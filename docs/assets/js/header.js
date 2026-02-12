/* =========================================================
   Global Header Injection
   (Institutional Navigation v2.1 — Stable Production)
========================================================= */

const headerContainer = document.getElementById("header");

if (headerContainer) {

  headerContainer.innerHTML = `
    <header>
      <div class="header-inner">

        <div class="brand">
          <a href="index.html">AgileAI Foundation & Agile AI University</a>
        </div>

        <nav class="main-nav">
          <ul>

            <li><a href="index.html">Home</a></li>

            <li class="dropdown">
              <a href="#">Intellectual Foundation</a>
              <ul class="dropdown-menu">
                <li><a href="intellectual-foundation/capability-architecture.html">Capability Architecture</a></li>
                <li><a href="intellectual-foundation/agile-ai-ecosystem.html">Agile AI Ecosystem</a></li>
                <li><a href="intellectual-foundation/myths-framework.html">Myth Framework</a></li>
                <li><a href="intellectual-foundation/mindset-transition.html">Mindset Transition</a></li>
              </ul>
            </li>

            <li class="dropdown">
              <a href="#">Programs</a>
              <ul class="dropdown-menu">
                <li><a href="aipa/index.html">AIPA — Artificial Intelligence Professional Agilist</a></li>
              </ul>
            </li>

            <li><a href="https://verify.agileai.university" target="_blank" rel="noopener">Verification</a></li>

            <li><a href="governance/index.html">Governance</a></li>

          </ul>
        </nav>

        <div class="theme-control">
          <button id="theme-toggle" aria-label="Toggle theme"></button>
        </div>

      </div>
    </header>
  `;

  /* =========================================================
     Active Link Detection + Parent Highlight
  ========================================================= */

  const currentPath = window.location.pathname;

  document.querySelectorAll("header nav a").forEach(link => {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("http") || href === "#") return;

    const normalizedHref = href.replace("index.html", "");

    if (currentPath.includes(normalizedHref)) {
      link.classList.add("active");

      const parentDropdown = link.closest(".dropdown");
      if (parentDropdown) {
        const parentAnchor = parentDropdown.querySelector(":scope > a");
        if (parentAnchor) parentAnchor.classList.add("active");
      }
    }
  });

  /* =========================================================
   Scroll-Aware Institutional Header (Stable v2.2)
========================================================= */

const siteHeader = document.querySelector("header");

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

// Run once on load
handleHeaderScroll();

// Passive listener for performance
window.addEventListener("scroll", handleHeaderScroll, { passive: true });

}
