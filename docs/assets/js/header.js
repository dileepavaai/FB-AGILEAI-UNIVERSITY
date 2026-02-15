document.addEventListener("DOMContentLoaded", function () {

  const headerHTML = `
    <header class="site-header">
      <div class="header-inner">

        <div class="brand">
          <a href="/">AgileAI Foundation & Agile AI University</a>
        </div>

        <nav class="main-nav">
          <ul class="nav-tree">

            <li class="nav-item">
              <a href="/">Home</a>
            </li>

            <li class="nav-item has-children">
              <button class="nav-toggle">Intellectual Foundation ▾</button>
              <ul class="sub-menu">
                <li class="nav-item">
                  <a href="/intellectual-foundation/capability-architecture.html">
                    Capability Architecture
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/intellectual-foundation/agile-ai-ecosystem.html">
                    Agile AI Ecosystem
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/intellectual-foundation/myth-framework.html">
                    Myth Framework
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/intellectual-foundation/mindset-transition.html">
                    Mindset Transition
                  </a>
                </li>
              </ul>
            </li>

            <li class="nav-item has-children">
              <button class="nav-toggle">Programs ▾</button>
              <ul class="sub-menu">
                <li class="nav-item">
                  <a href="/public-assessment/">
                    Agile + AI Capability Assessment
                  </a>
                </li>
                <li class="nav-item">
                  <a href="/academics/">
                    Academic Frameworks
                  </a>
                </li>

                <!-- Future-ready nested level -->
                <li class="nav-item has-children">
                  <button class="nav-toggle">Professional Pathways ▾</button>
                  <ul class="sub-menu">
                    <li class="nav-item">
                      <a href="/credentials/practitioner.html">Practitioner</a>
                    </li>
                    <li class="nav-item">
                      <a href="/credentials/manager.html">Manager</a>
                    </li>
                    <li class="nav-item">
                      <a href="/credentials/leader.html">Leader</a>
                    </li>
                  </ul>
                </li>

              </ul>
            </li>

            <li class="nav-item">
              <a href="/verification/">Verification</a>
            </li>

            <li class="nav-item">
              <a href="/governance/">Governance</a>
            </li>

            <li class="nav-item">
              <a href="/contact/">Contact</a>
            </li>

          </ul>
        </nav>

        <div class="theme-control">
          <button id="theme-toggle">☀</button>
        </div>

      </div>
    </header>
  `;

  document.getElementById("header").innerHTML = headerHTML;

  // Expand / Collapse Logic (works for infinite nesting)
  const toggles = document.querySelectorAll(".nav-toggle");

  toggles.forEach(toggle => {
    toggle.addEventListener("click", function () {
      const parent = this.parentElement;
      parent.classList.toggle("is-open");
    });
  });

});
