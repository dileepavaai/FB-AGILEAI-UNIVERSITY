/*
======================================================
Agile AI Specification Header
Injects a global specification header into all pages
======================================================
*/

(function () {

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

  // Initial load
  document.addEventListener("DOMContentLoaded", injectSpecBanner);

  // Support Material for MkDocs instant navigation
  document.addEventListener("navigation.end", injectSpecBanner);

})();