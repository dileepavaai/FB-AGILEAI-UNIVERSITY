/*
======================================================
Agile AI Specification Banner
Injects a global specification banner into all pages
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

    banner.innerHTML =
      "Agile AI Specification — " +
      "<span>Status: Canonical</span> — " +
      "<span>Version: 1.0</span> — " +
      "<span>Maintained by Agile AI University</span>";

    container.prepend(banner);

  }

  // Initial load
  document.addEventListener("DOMContentLoaded", injectSpecBanner);

  // Support Material for MkDocs instant navigation
  document.addEventListener("navigation.end", injectSpecBanner);

})();