/*
======================================================
Agile AI Specification Header + Mermaid Initialization
Version: 2.6 (Correct Material Header Injection)
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
      <div class="spec-banner-title">Agile AI Specification</div>
      <div class="spec-banner-meta">
        <span><strong>Version:</strong> 1.0</span>
        <span><strong>Status:</strong> Canonical</span>
        <span><strong>Maintained by:</strong> Agile AI University</span>
      </div>
    `;

    container.prepend(banner);
  }


  function injectThemeToggle() {

    // Remove duplicates
    document.querySelectorAll("#theme-toggle").forEach(el => el.remove());

    const header = document.querySelector(".md-header__inner");
    if (!header) return;

    // ✅ STRICT: insert inside search container (correct alignment)
    const search = header.querySelector(".md-search");
    if (!search) return;

    const btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.className = "spec-theme-toggle md-header__button";
    btn.title = "Toggle theme";

    function updateIcon() {
      const current = document.body.getAttribute("data-md-color-scheme");
      btn.textContent = current === "slate" ? "☀️" : "🌙";
    }

    updateIcon();

    btn.addEventListener("click", () => {
      const current = document.body.getAttribute("data-md-color-scheme");
      const next = current === "default" ? "slate" : "default";

      document.body.setAttribute("data-md-color-scheme", next);
      localStorage.setItem("md-color-scheme", next);

      updateIcon();
    });

    // 🔥 CRITICAL: append INSIDE search wrapper
    search.parentElement.appendChild(btn);
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
    injectSpecBanner();
    injectThemeToggle();
    renderMermaid();
    setupAnalyticsTracking();
  }

  document.addEventListener("DOMContentLoaded", initializePage);
  document.addEventListener("navigation.end", initializePage);

})();