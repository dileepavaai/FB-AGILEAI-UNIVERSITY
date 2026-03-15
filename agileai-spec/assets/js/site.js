/*
======================================================
Agile AI Specification Header + Mermaid Initialization
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


  /*
  ======================================================
  Mermaid Diagram Initialization
  ======================================================
  */

  function renderMermaid() {

    if (typeof mermaid === "undefined") return;

    mermaid.initialize({
      startOnLoad: false,
      theme: "default"
    });

    document.querySelectorAll("pre code.language-mermaid").forEach((block) => {

      const parent = block.parentElement;

      if (parent.classList.contains("mermaid-rendered")) return;

      const graphDefinition = block.textContent;

      const mermaidDiv = document.createElement("div");
      mermaidDiv.className = "mermaid";
      mermaidDiv.textContent = graphDefinition;

      parent.replaceWith(mermaidDiv);

      parent.classList.add("mermaid-rendered");

    });

    mermaid.init(undefined, document.querySelectorAll(".mermaid"));

  }


  /*
  ======================================================
  Page Load Events
  ======================================================
  */

  function initializePage() {

    injectSpecBanner();
    renderMermaid();

  }

  document.addEventListener("DOMContentLoaded", initializePage);

  // Support Material for MkDocs instant navigation
  document.addEventListener("navigation.end", initializePage);

})();