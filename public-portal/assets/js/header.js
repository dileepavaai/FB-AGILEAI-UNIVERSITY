/* =====================================================
   Agile AI University — Institutional Header
   GOVERNANCE-GRADE · CONTEXT-SAFE · BRAND-STABLE
   WITH PORTAL THEME TOGGLE (LOCKED)
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  /* ======================================================
     CONTEXT DETECTION (LOCKED)
     ====================================================== */
  const CONTEXT = window.__AAIU_CONTEXT || "site";
  // allowed: site | portal | assessment | report

  const isPortalContext = CONTEXT === "portal";
  const isAssessmentContext = CONTEXT === "assessment" || CONTEXT === "report";

  /* ======================================================
     HEADER MARKUP — NO TEMPLATE LITERALS (CRITICAL)
     ====================================================== */
  const html = [
    '<header class="site-header" role="banner">',
    '  <div class="container">',

    '    <nav class="site-nav" aria-label="Primary">',
    '      <button class="hamburger" id="hamburger" aria-label="Main menu" aria-expanded="false" aria-controls="navList">☰</button>',
    '      <ul class="nav-list" id="navList">',

    '        <li class="home"><a href="https://agileai.university">Agile AI University</a></li>',

    '        <li class="has-submenu">',
    '          <a href="/about/">About</a>',
    '          <ul class="submenu">',
    '            <li><a href="/about/index.html">About the University</a></li>',
    '            <li><a href="/about/mission.html">Mission &amp; Purpose</a></li>',
    '            <li><a href="/about/structure.html">Institutional Structure</a></li>',
    '          </ul>',
    '        </li>',

    '        <li class="has-submenu">',
    '          <a href="/academics/">Academics</a>',
    '          <ul class="submenu">',
    '            <li><a href="https://assessment.agileai.university" rel="noopener">Agile + AI Capability Assessment</a></li>',
    '            <li><a href="/academics/frameworks.html">Academic Frameworks</a></li>',
    '            <li><a href="/academics/pathways.html">Professional Pathways</a></li>',
    '          </ul>',
    '        </li>',

    '        <li class="has-submenu">',
    '          <a href="/credentials/">Credentials</a>',
    '          <ul class="submenu">',
    '            <li><a href="/credentials/framework.html">Credential Framework</a></li>',
    '            <li><a href="https://verify.agileai.university">Credential Verification</a></li>',
    '          </ul>',
    '        </li>',

    '        <li class="has-submenu">',
    '          <a href="/governance/">Governance</a>',
    '          <ul class="submenu">',
    '            <li><a href="/governance/index.html">Academic &amp; Professional Body</a></li>',
    '            <li><a href="/governance/standards-integrity.html">Standards &amp; Integrity</a></li>',
    '          </ul>',
    '        </li>',

    '        <li><a href="/contact/">Contact</a></li>'
  ];

  if (isAssessmentContext) {
    html.push(
      '        <li class="context-link">',
      '          <a href="https://portal.agileai.university">← Back to Student &amp; Executive Portal</a>',
      '        </li>'
    );
  }

  html.push(
    '      </ul>',
    '    </nav>',

    '    <div class="nav-muted">',
    '      An independent Academic &amp; Professional Body for Agile AI and Agentic AI'
  );

  if (isPortalContext) {
    html.push('      <span class="context-tag">Student &amp; Executive Portal</span>');
  } else if (isAssessmentContext) {
    html.push('      <span class="context-tag">Assessment Environment</span>');
  }

  /* ======================================================
     PORTAL THEME TOGGLE (UI-ONLY · GOVERNED)
     ====================================================== */
  if (isPortalContext) {
    html.push(
      '      <button',
      '        id="theme-toggle"',
      '        class="theme-toggle"',
      '        type="button"',
      '        aria-label="Toggle dark or light theme"',
      '        aria-pressed="false">',
      '        🌙',
      '      </button>'
    );
  }

  html.push(
    '    </div>',
    '  </div>',
    '</header>'
  );

  mount.innerHTML = html.join("\n");

  /* ======================================================
     MOBILE MENU TOGGLE (UNCHANGED)
     ====================================================== */
  const hamburger = document.getElementById("hamburger");
  const navList = document.getElementById("navList");

  if (hamburger && navList) {
    hamburger.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("mobile-open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
  }

  /* ======================================================
     SUBMENU HANDLING (UNCHANGED)
     ====================================================== */
  document.querySelectorAll(".has-submenu > a").forEach(link => {
    link.addEventListener("click", e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        link.parentElement.classList.toggle("submenu-open");
      } else {
        e.preventDefault();
      }
    });
  });

  /* ======================================================
     THEME TOGGLE WIRING (CORRECT CONTRACT)
     ====================================================== */
  if (isPortalContext) {
    const toggleBtn = document.getElementById("theme-toggle");

    if (
      toggleBtn &&
      window.ThemeController &&
      typeof window.ThemeController.toggle === "function"
    ) {
      const syncIcon = () => {
        const theme =
          document.documentElement.getAttribute("data-theme") || "light";

        toggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
        toggleBtn.setAttribute(
          "aria-pressed",
          theme === "dark" ? "true" : "false"
        );
      };

      syncIcon();

      toggleBtn.addEventListener("click", () => {
        window.ThemeController.toggle();
        syncIcon();
      });
    }
  }
});
