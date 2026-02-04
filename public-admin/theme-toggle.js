/* =========================================================
   AAIU Admin — Theme Toggle (3-State + Reconciliation Lock)
   ---------------------------------------------------------
   Modes:
   🌞 light   → Forced light
   🌙 dark    → Forced dark
   🖥️ system  → Follows OS preference (on load only)

   Special Rules:
   🔒 Reconciliation pages are ALWAYS light mode
   🔔 Screen banner: "Theme locked for reconciliation"
   🖨️ Print banner:  "Printed in Light mode"
   📄 PDF footer watermark with page numbers
   🔐 Diagonal CONFIDENTIAL watermark (print-only)

   Scope: Admin UI only
   Risk: Zero (cosmetic UX preference)
   Authority: None (Firestore remains source of truth)
   ========================================================= */

(function () {
  "use strict";

  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const STORAGE_KEY = "aaiu-admin-theme";

  const SCREEN_BANNER_ID = "theme-lock-banner";
  const PRINT_BANNER_ID = "print-theme-banner";
  const PRINT_STYLE_ID = "print-governance-style";

  if (!toggle) return;

  const MODES = ["light", "dark", "system"];

  /* ===============================
     RECONCILIATION DETECTION
     =============================== */
  function isReconciliationView() {
    if (document.getElementById("reconciliation")) return true;
    if (window.location.hash === "#reconciliation") return true;
    return false;
  }

  /* ===============================
     SCREEN BANNER
     =============================== */
  function showScreenBanner() {
    if (document.getElementById(SCREEN_BANNER_ID)) return;

    const banner = document.createElement("div");
    banner.id = SCREEN_BANNER_ID;
    banner.className = "admin-warning";
    banner.textContent = "Theme locked for reconciliation";

    const topbar = document.querySelector(".topbar");
    if (topbar && topbar.parentNode) {
      topbar.parentNode.insertBefore(banner, topbar.nextSibling);
    }
  }

  function removeScreenBanner() {
    const banner = document.getElementById(SCREEN_BANNER_ID);
    if (banner) banner.remove();
  }

  /* ===============================
     PRINT BANNER + WATERMARKS
     =============================== */
  function ensurePrintArtifacts() {
    if (!document.getElementById(PRINT_BANNER_ID)) {
      const banner = document.createElement("div");
      banner.id = PRINT_BANNER_ID;
      banner.className = "admin-warning";
      banner.textContent = "Printed in Light mode";
      banner.style.display = "none";

      document.body.insertBefore(banner, document.body.firstChild);
    }

    if (!document.getElementById(PRINT_STYLE_ID)) {
      const style = document.createElement("style");
      style.id = PRINT_STYLE_ID;
      style.textContent = `
        @media print {

          /* Show print banner */
          #${PRINT_BANNER_ID} {
            display: block !important;
            margin-bottom: 12px;
          }

          /* Footer watermark with page numbers */
          body::after {
            content: "Agile AI University · Administrative Reconciliation · Light Mode · Printed Copy · Page " counter(page) " of " counter(pages);
            position: fixed;
            bottom: 10px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
          }

          /* Diagonal CONFIDENTIAL watermark */
          body::before {
            content: "CONFIDENTIAL";
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-35deg);
            font-size: 64px;
            font-weight: 700;
            letter-spacing: 6px;
            color: rgba(0, 0, 0, 0.08);
            z-index: 9999;
            pointer-events: none;
            white-space: nowrap;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  function removePrintArtifacts() {
    const banner = document.getElementById(PRINT_BANNER_ID);
    if (banner) banner.remove();

    const style = document.getElementById(PRINT_STYLE_ID);
    if (style) style.remove();
  }

  /* ===============================
     APPLY THEME (GUARDED)
     =============================== */
  function applyTheme(mode) {
    if (isReconciliationView()) {
      root.removeAttribute("data-theme");
      showScreenBanner();
      ensurePrintArtifacts();
      return;
    }

    removeScreenBanner();
    removePrintArtifacts();

    if (mode === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (mode === "light") {
      root.removeAttribute("data-theme");
    } else {
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
    }
  }

  /* ===============================
     UPDATE BUTTON
     =============================== */
  function updateButton(mode) {
    if (isReconciliationView()) {
      toggle.textContent = "🌞";
      toggle.title = "Theme locked to Light (Reconciliation)";
      toggle.disabled = true;
      return;
    }

    toggle.disabled = false;

    if (mode === "light") {
      toggle.textContent = "🌞";
      toggle.title = "Theme: Light";
    } else if (mode === "dark") {
      toggle.textContent = "🌙";
      toggle.title = "Theme: Dark";
    } else {
      toggle.textContent = "🖥️";
      toggle.title = "Theme: System";
    }
  }

  /* ===============================
     INITIAL LOAD
     =============================== */
  let currentMode = localStorage.getItem(STORAGE_KEY);
  if (!MODES.includes(currentMode)) currentMode = "light";

  applyTheme(currentMode);
  updateButton(currentMode);

  /* ===============================
     TOGGLE CYCLE
     =============================== */
  toggle.addEventListener("click", function () {
    if (isReconciliationView()) return;

    const index = MODES.indexOf(currentMode);
    currentMode = MODES[(index + 1) % MODES.length];

    localStorage.setItem(STORAGE_KEY, currentMode);
    applyTheme(currentMode);
    updateButton(currentMode);
  });

})();
