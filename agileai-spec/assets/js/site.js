/*
======================================================
Agile AI Specification Header + Mermaid Rendering
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
  Render Mermaid Diagrams
  ======================================================
  */

  function renderMermaid() {

    if (typeof mermaid === "undefined") return;

    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose"
    });

    document.querySelectorAll("pre code.language-mermaid").forEach((block) => {

      const code = block.textContent;

      const mermaidDiv = document.createElement("div");
      mermaidDiv.className = "mermaid";
      mermaidDiv.textContent = code;

      const parent = block.parentElement;
      parent.replaceWith(mermaidDiv);

    });

    mermaid.init(undefined, document.querySelectorAll(".mermaid"));

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
  Page Events
  ======================================================
  */

  document.addEventListener("DOMContentLoaded", initializePage);
  document.addEventListener("navigation.end", initializePage);

})();