/*
======================================================
Agile AI Specification — UI Control Layer
Version: 2.8 (Relocate Material Toggle)
======================================================
*/

(function () {

  function relocateThemeToggle() {

    // Find existing Material toggle
    const toggle = document.querySelector('[data-md-color-switch]');
    if (!toggle) return;

    // Find top header container
    const header = document.querySelector(".md-header__inner");
    if (!header) return;

    // Prevent duplicate move
    if (header.querySelector('[data-md-color-switch]')) return;

    // Move toggle to header right side
    header.appendChild(toggle);
  }


  function injectSpecBanner() {

    const container = document.querySelector(".md-content__inner");
    if (!container) return;
    if (container.querySelector(".spec-banner")) return;

    const banner = document.createElement("div");
    banner.className = "spec-banner";

    banner.innerHTML = `
      <div class="spec-banner-title">Agile AI Specification</div>
      <div class="spec-banner-meta">
        <span><strong>Version:</strong> 1.0</span>
        <span><strong>Status:</strong> Canonical</span>
        <span><strong>Maintained by:</strong> Agile AI University</span>
      </div>
    `;

    container.prepend(banner);
  }


  function renderMermaid() {

    if (typeof mermaid === "undefined") return;

    mermaid.initialize({
      startOnLoad: true,
      securityLevel: "loose",
      theme: "default"
    });

    mermaid.run({ querySelector: ".language-mermaid" });
  }


  function setupAnalyticsTracking() {

    if (typeof gtag !== "function") return;

    document.querySelectorAll("a").forEach(link => {

      const href = link.getAttribute("href");
      if (!href) return;

      if (href.includes("Agile-AI-Guide")) {
        link.addEventListener("click", () => {
          gtag("event", "download_agile_ai_guide", {
            event_category: "publication",
            event_label: "Agile AI Guide"
          });
        });
      }

      if (href.includes("Agile-AI-Functional-Elements")) {
        link.addEventListener("click", () => {
          gtag("event", "download_functional_elements", {
            event_category: "publication",
            event_label: "Agile AI Functional Elements"
          });
        });
      }

    });
  }


  function initializePage() {
    relocateThemeToggle();
    injectSpecBanner();
    renderMermaid();
    setupAnalyticsTracking();
  }

  document.addEventListener("DOMContentLoaded", initializePage);
  document.addEventListener("navigation.end", initializePage);

})();