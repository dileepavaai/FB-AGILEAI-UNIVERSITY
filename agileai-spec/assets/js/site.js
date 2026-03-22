/*
======================================================
Agile AI Specification — UI Control Layer
Version: 3.0 (Stable Toggle Relocation + Governance Safe)
======================================================
*/

(function () {

  /* ======================================================
  THEME TOGGLE RELOCATION (STABLE + NON-BREAKING)
  ====================================================== */

  function relocateThemeToggle() {

    // Correct Material toggle selector (label for palette)
    const toggle = document.querySelector("[for='__palette']");
    const target = document.getElementById("spec-toggle-slot");

    if (!toggle || !target) return;

    // Prevent duplicate move
    if (target.contains(toggle)) return;

    target.appendChild(toggle);
  }


  /* ======================================================
  SPEC BANNER INJECTION
  ====================================================== */

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


  /* ======================================================
  MERMAID RENDERING
  ====================================================== */

  function renderMermaid() {

    if (typeof mermaid === "undefined") return;

    mermaid.initialize({
      startOnLoad: true,
      securityLevel: "loose",
      theme: "default"
    });

    mermaid.run({ querySelector: ".language-mermaid" });
  }


  /* ======================================================
  ANALYTICS TRACKING
  ====================================================== */

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


  /* ======================================================
  INITIALIZATION (STABLE ACROSS NAVIGATION)
  ====================================================== */

  function initializePage() {

    relocateThemeToggle();
    injectSpecBanner();
    renderMermaid();
    setupAnalyticsTracking();
  }


  // Initial load
  document.addEventListener("DOMContentLoaded", initializePage);

  // MkDocs Material navigation events
  document.addEventListener("navigation.end", initializePage);

  // Fallback for delayed rendering (critical stability layer)
  window.addEventListener("load", function () {
    setTimeout(relocateThemeToggle, 200);
    setTimeout(relocateThemeToggle, 500);
  });

})();