/*
======================================================
Agile AI Specification Header + Mermaid Initialization
Version: 2.4 (Correct Actions Container Injection)
======================================================
*/

(function () {

  /* =====================================================
  SPEC BANNER
  ===================================================== */

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


  /* =====================================================
  THEME TOGGLE (RIGHT ACTION AREA — CORRECT FIX)
  ===================================================== */

  function injectThemeToggle() {

    // Remove duplicates globally
    document.querySelectorAll("#theme-toggle").forEach(el => el.remove());

    const header = document.querySelector(".md-header__inner");
    if (!header) return;

    // 🔴 CRITICAL: Find the RIGHT ACTION CONTAINER
    let actions = header.querySelector(".md-header__option");

    // Fallback (Material variations)
    if (!actions) {
      actions = header.querySelector(".md-header__inner");
    }

    if (!actions) return;

    const btn = document.createElement("button");
    btn.id = "theme-toggle";
    btn.className = "spec-theme-toggle md-header__button";
    btn.title = "Toggle theme";

    function updateIcon() {
      const current = document.body.getAttribute("data-md-color-scheme");
      btn.innerHTML = current === "slate" ? "☀️" : "🌙";
    }

    updateIcon();

    btn.addEventListener("click", () => {
      const body = document.body;
      const current = body.getAttribute("data-md-color-scheme");
      const next = current === "default" ? "slate" : "default";

      body.setAttribute("data-md-color-scheme", next);
      localStorage.setItem("md-color-scheme", next);

      updateIcon();
    });

    // ✅ Insert into correct action group
    actions.appendChild(btn);
  }


  /* =====================================================
  MERMAID
  ===================================================== */

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


  /* =====================================================
  ANALYTICS
  ===================================================== */

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


  /* =====================================================
  INIT (MKDOCS SAFE)
  ===================================================== */

  function initializePage() {
    injectSpecBanner();
    injectThemeToggle();
    renderMermaid();
    setupAnalyticsTracking();
  }

  document.addEventListener("DOMContentLoaded", initializePage);
  document.addEventListener("navigation.end", initializePage);

})();