document.addEventListener("DOMContentLoaded", () => {
  const mount = document.getElementById("site-header");
  if (!mount) return;

  /* =====================================================
     Ensure canonical site.css is loaded (once)
     ===================================================== */
  const cssHref = "/assets/css/site.css";
  const alreadyLoaded = [...document.styleSheets].some(
    s => s.href && s.href.includes("site.css")
  );

  if (!alreadyLoaded) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssHref;
    document.head.appendChild(link);
  }

  /* =====================================================
     Inject Header HTML
     ===================================================== */
  mount.innerHTML = `
<header class="site-header">
  <div class="container">
    <nav class="site-nav">

      <!-- Hamburger -->
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

        <li class="has-submenu">
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
              <a href="https://assessment.agileai.university/" target="_blank" rel="noopener">
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
            <li>
              <a href="https://verify.agileai.university" target="_blank">
                Credential Verification
              </a>
            </li>
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

  /* =====================================================
     Mobile Hamburger Toggle
     ===================================================== */
  const hamburger = document.getElementById("hamburger");
  const navList = document.getElementById("navList");

  hamburger?.addEventListener("click", () => {
    const open = navList.classList.toggle("mobile-open");
    hamburger.setAttribute("aria-expanded", open);

    if (!open) {
      document
        .querySelectorAll(".has-submenu.submenu-open")
        .forEach(li => li.classList.remove("submenu-open"));
    }
  });

  /* =====================================================
     Submenu Handling
     ===================================================== */
  document.querySelectorAll(".has-submenu > a").forEach(link => {
    link.addEventListener("click", e => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const parent = link.parentElement;

        document
          .querySelectorAll(".has-submenu.submenu-open")
          .forEach(li => {
            if (li !== parent) li.classList.remove("submenu-open");
          });

        parent.classList.toggle("submenu-open");
      } else {
        e.preventDefault();
      }
    });
  });
});