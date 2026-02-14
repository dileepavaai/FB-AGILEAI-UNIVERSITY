/* =========================================================
   Global Footer Injection
   Institutional Footer v2.0 (Header v5.2 Compatible)
   - Idempotent
   - Layout Aligned (720px max-width)
   - Theme Compatible
   - Production Safe
========================================================= */

(function () {

  function injectFooter() {

    const footerContainer = document.getElementById("footer");
    if (!footerContainer) return;
    if (footerContainer.dataset.injected === "true") return;

    const year = new Date().getFullYear();

    footerContainer.innerHTML = `
      <footer class="site-footer">
        <div class="footer-inner">

          <div class="footer-brand">
            © ${year} AgileAI Foundation & Agile AI University
          </div>

          <div class="footer-meta">
            Public learning and research infrastructure.
          </div>

        </div>
      </footer>
    `;

    footerContainer.dataset.injected = "true";

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectFooter);
  } else {
    injectFooter();
  }

})();
