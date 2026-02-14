/* =========================================================
   AgileAI Public Surface — Footer Injection (Safe v1.0)
   Defensive + Idempotent + Production Stable
========================================================= */

(function () {

  function injectFooter() {
    const footerContainer = document.getElementById("footer");
    if (!footerContainer) return;

    // Prevent double injection
    if (footerContainer.dataset.injected === "true") return;

    footerContainer.innerHTML = `
      <footer>
        © AgileAI Foundation & Agile AI University<br />
        Public learning and research infrastructure.
      </footer>
    `;

    footerContainer.dataset.injected = "true";
  }

  // If DOM already ready, run immediately
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectFooter);
  } else {
    injectFooter();
  }

})();
