document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  mount.innerHTML = `
<header class="site-header">
  <div class="container">
    <nav class="site-nav">

      <!-- Hamburger (mobile only) -->
      <button
        class="hamburger"
        id="hamburger"
        aria-label="Menu"
        aria-expanded="false"
        aria-controls="navList"
      >
        &#9776;
      </button>

      <!-- Navigation -->
      <ul class="nav-list" id="navList">

        <li class="home"><a href="/">Home</a></li>

        <li class="has-submenu about">
          <a href="/about/">About</a>
          <ul class="submenu">
            <li><a href="/about/index.html">About Agile AI University</a></li>
            <li><a href="/about/mission.html">Mission & Purpose</a></li>
            <li><a href="/about/structure.html">Institutional Structure</a></li>
          </ul>
        </li>

        <li class="has-submenu">
          <a href="/academics/">Academics</a>
          <ul class="submenu">
            <li>
              <a
                href="https://assessment.agileai.university/"
                target="_blank"
                rel="noopener"
              >
                Agile + AI Capability Assessment
              </a>
            </li>
            <li><a href="/academics/frameworks.html">Academic Frameworks</a></li>
            <li><a href="/academics/pathways.html">Professional Pathways (P · M · L)</a></li>
          </ul>
        </li>

        <li class="has-submenu">
          <a href="/credentials/">Credentials</a>
          <ul class="submenu">
            <li><a href="/credentials/framework.html">Credential Framework</a></li>
            <li><a href="/credentials/index.html#verification">Credential Verification</a></li>
          </ul>
        </li>

        <li class="has-submenu">
          <a href="/governance/">Governance</a>
          <ul class="submenu">
            <li><a href="/governance/index.html">Academic & Professional Body</a></li>
            <li><a href="/governance/standards-integrity.html">Standards & Integrity</a></li>
          </ul>
        </li>

        <li><a href="/contact/">Contact</a></li>

      </ul>
    </nav>

    <div class="nav-muted">
      An independent Academic &amp; Professional Body for Agile AI and Agentic AI
    </div>
  </div>
</header>
`;

  /* ===============================
     HAMBURGER TOGGLE (MOBILE)
     =============================== */
  const hamburger = document.getElementById("hamburger");
  const navList = document.getElementById("navList");

  if (hamburger && navList) {
    hamburger.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("mobile-open");
      hamburger.setAttribute("aria-expanded", isOpen);

      if (!isOpen) {
        document
          .querySelectorAll(".has-submenu.submenu-open")
          .forEach(li => li.classList.remove("submenu-open"));
      }
    });
  }

  /* ===============================
     SUBMENU HANDLING (MOBILE + DESKTOP)
     =============================== */
  document.querySelectorAll(".has-submenu > a").forEach(link => {
    link.addEventListener("click", e => {

      /* MOBILE: toggle submenu */
      if (window.innerWidth <= 768) {
        e.preventDefault();

        const parent = link.parentElement;

        document
          .querySelectorAll(".has-submenu.submenu-open")
          .forEach(li => {
            if (li !== parent) li.classList.remove("submenu-open");
          });

        parent.classList.toggle("submenu-open");
        return;
      }

      /* DESKTOP: prevent parent navigation */
      e.preventDefault();
    });
  });
});