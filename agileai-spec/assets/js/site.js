/*
======================================================
Agile AI Specification Header + Mermaid Initialization
Analytics Tracking Added + Theme Toggle (Refinement)
======================================================
*/

(function () {

  function injectSpecBanner() {

    const container = document.querySelector(".md-content__inner");
    if (!container) return;
    if (container.querySelector(".spec-banner")) return;

    const banner = document.createElement("div");
    banner.className = "spec-banner";

    banner.innerHTML = `
      <div class="spec-banner-title">
        Agile AI Specification
      </div>
      <div class="spec-banner-meta">
        <span><strong>Version:</strong> 1.0</span>
        <span><strong>Status:</strong> Canonical</span>
        <span><strong>Maintained by:</strong> Agile AI University</span>
      </div>
    `;

    container.prepend(banner);
  }


  function injectThemeToggle() {

    const header = document.querySelector(".md-header__inner");
    if (!header) return;
    if (header.querySelector("#theme-toggle")) return;

    const btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.className = "spec-theme-toggle";
    btn.title = "Toggle theme";
    btn.innerHTML = "🌙";

    btn.addEventListener("click", () => {
      const body = document.body;
      const current = body.getAttribute("data-md-color-scheme");

      body.setAttribute(
        "data-md-color-scheme",
        current === "default" ? "slate" : "default"
      );
    });

    header.appendChild(btn);
  }


  function renderMermaid() {

    if (typeof mermaid === "undefined") return;

    mermaid.initialize({
      startOnLoad: true,
      securityLevel: "loose",
      theme: "default"
    });

    mermaid.run({
      querySelector: ".language-mermaid"
    });

  }


  function setupAnalyticsTracking() {

    if (typeof gtag !== "function") return;

    const links = document.querySelectorAll("a");

    links.forEach(link => {

      const href = link.getAttribute("href");
      if (!href) return;

      if (href.includes("Agile-AI-Guide")) {
        link.addEventListener("click", function () {
          gtag("event", "download_agile_ai_guide", {
            event_category: "publication",
            event_label: "Agile AI Guide"
          });
        });
      }

      if (href.includes("Agile-AI-Functional-Elements")) {
        link.addEventListener("click", function () {
          gtag("event", "download_functional_elements", {
            event_category: "publication",
            event_label: "Agile AI Functional Elements"
          });
        });
      }

    });

  }


  function initializePage() {
    injectSpecBanner();
    injectThemeToggle();
    renderMermaid();
    setupAnalyticsTracking();
  }


  document.addEventListener("DOMContentLoaded", initializePage);
  document.addEventListener("navigation.end", initializePage);

})();