/* =========================================================
   Global Header Injection
   (Institutional Dropdown Navigation — Safe Replacement)
========================================================= */

document.getElementById("header").innerHTML = `
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

          <li><a href="https://verify.agileai.university" target="_blank">Verification</a></li>

          <li><a href="governance/">Governance</a></li>

        </ul>
      </nav>

      <div class="theme-control">
        <button id="theme-toggle" aria-label="Toggle theme"></button>
      </div>

    </div>
  </header>
`;

/* =========================================================
   Active Link Detection
========================================================= */

const currentPage =
  window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll("header nav a").forEach(link => {
  const linkPage = link.getAttribute("href");
  if (linkPage === currentPage) {
    link.classList.add("active");
  }
});
