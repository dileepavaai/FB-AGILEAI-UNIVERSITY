document.addEventListener("DOMContentLoaded", function () {

  const headerHTML = `
    <header class="site-header">
      <div class="header-inner">

        <div class="brand">
          <a href="/">AgileAI Foundation & Agile AI University</a>
        </div>

        <nav class="main-nav">
          <ul>

            <li><a href="/">Home</a></li>

            <li class="dropdown">
              <a href="#">Intellectual Foundation ▾</a>
              <div class="dropdown-menu">
                <ul>
                  <li><a href="/intellectual-foundation/capability-architecture.html">Capability Architecture</a></li>
                  <li><a href="/intellectual-foundation/agile-ai-ecosystem.html">Agile AI Ecosystem</a></li>
                  <li><a href="/intellectual-foundation/myth-framework.html">Myth Framework</a></li>
                  <li><a href="/intellectual-foundation/mindset-transition.html">Mindset Transition</a></li>
                </ul>
              </div>
            </li>

            <li class="dropdown">
              <a href="#">Programs ▾</a>
              <div class="dropdown-menu">
                <ul>
                  <li><a href="/public-assessment/">Agile + AI Capability Assessment</a></li>
                  <li><a href="/academics/">Academic Frameworks</a></li>
                  <li><a href="/credentials/">Professional Pathways (P · M · L)</a></li>
                </ul>
              </div>
            </li>

            <li><a href="/verification/">Verification</a></li>
            <li><a href="/governance/">Governance</a></li>
            <li><a href="/contact/">Contact</a></li>

          </ul>
        </nav>

        <div class="theme-control">
          <button id="theme-toggle">☀️</button>
        </div>

      </div>
    </header>
  `;

  document.getElementById("header").innerHTML = headerHTML;

  /* ---------------------------------------------------------
     DISPATCH HEADER READY EVENT (CRITICAL FIX)
  --------------------------------------------------------- */

  document.dispatchEvent(new Event("headerInjected"));

  /* ---------------------------------------------------------
     Dropdown Logic
  --------------------------------------------------------- */

  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach(drop => {
    drop.addEventListener("mouseenter", () => drop.classList.add("open"));
    drop.addEventListener("mouseleave", () => drop.classList.remove("open"));
  });

});
