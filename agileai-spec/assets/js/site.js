/*
======================================================
Agile AI Specification Header + Mermaid Initialization
======================================================
*/

(function () {

  /*
  ======================================================
  Inject Specification Banner
  ======================================================
  */

  function injectSpecBanner() {

    const container = document.querySelector(".md-content__inner");

    if (!container) return;

    // Prevent duplicate banner insertion
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


  /*
  ======================================================
  Mermaid Diagram Initialization
  ======================================================
  */

  function renderMermaid() {

    if (typeof mermaid === "undefined") return;

    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose"
    });

  }


  /*
  ======================================================
  Page Initialization
  ======================================================
  */

  function initializePage() {

    injectSpecBanner();
    renderMermaid();

  }


  /*
  ======================================================
  Page Load Events
  ======================================================
  */

  document.addEventListener("DOMContentLoaded", initializePage);

  // Support Material for MkDocs instant navigation
  document.addEventListener("navigation.end", initializePage);

})();