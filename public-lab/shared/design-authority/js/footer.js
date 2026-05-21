/* ==========================================================
   AgileAI Shared Footer Engine
   Version: v2.0
   Status: STABILIZED
   Architecture: Shared Institutional Footer Injection
   Scope: Structural Footer Controller Only

   Governance Notes:
   - Shared institutional footer across public surfaces
   - No analytics logic
   - No runtime branching
   - No surface-specific conditions
   - Shared design authority compatible
   - Footer content intentionally centralized

   v2.0 Changes:
   - Fixed footer injection container targeting
   - Updated container selector:
       #footer → #site-footer
   - Added runtime safety logging
   - Added governance-safe comments
   - Improved structural readability
   - Preserved footer content integrity

   Safety Model:
   - If #site-footer missing → controlled abort
   - Footer rendering isolated
   - No dependency on surface config
   - No navigation mutation behavior
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ======================================================
     RUNTIME REFERENCES
  ====================================================== */

  const currentYear = new Date().getFullYear();

  /* ======================================================
     FOOTER TEMPLATE
  ====================================================== */

  const footerHTML = `
    <footer class="site-footer">

      <div class="footer-inner">

        <p class="footer-title">
          Agile AI University
        </p>

        <p class="footer-disclaimer">
          Agile AI University defines structured academic frameworks,
          capability standards, and professional recognition models
          for the Agile AI domain.

          It operates as an independent academic and professional body
          and is not positioned as a commercial training provider.
        </p>

        <p class="footer-governance">

          Agile AI University builds upon the canonical standards
          defined by

          <a href="https://agileai.foundation"
             target="_blank"
             rel="noopener noreferrer"
             aria-label="Agile AI Foundation (opens in new tab)">

            Agile AI Foundation

          </a>.

        </p>

        <!-- ==================================================
             INSTITUTIONAL SURFACES
             Hardened Shared Surface Routing Layer
        =================================================== -->

        <p class="footer-links">

          <a href="https://agileai.university">
            Institutional Site
          </a> ·

          <a href="https://edu.agileai.university">
            Knowledge Surface
          </a> ·

          <a href="https://portal.agileai.university">
            Student & Executive Portal
          </a> ·

          <a href="https://verify.agileai.university">
            Credential Verification
          </a>

        </p>

        <!-- ==================================================
             GOVERNANCE LINKS
        =================================================== -->

        <p class="footer-links">

          <a href="/terms.html">
            Terms & Conditions
          </a> ·

          <a href="/privacy.html">
            Privacy Policy
          </a> ·

          <a href="/refund.html">
            Refund Policy
          </a>

        </p>

        <!-- ==================================================
             COPYRIGHT
        =================================================== -->

        <p class="footer-copy">
          © ${currentYear} Agile AI University.
          All rights reserved.
        </p>

      </div>

    </footer>
  `;

  /* ======================================================
     FOOTER INJECTION TARGET
     v2.0 FIX:
     Corrected container selector mismatch
  ====================================================== */

  const footerContainer = document.getElementById("site-footer");

  if (!footerContainer) {

    console.error(
      "AgileAI Footer Engine: #site-footer container not found"
    );

    return;
  }

  /* ======================================================
     FOOTER RENDER
  ====================================================== */

  footerContainer.innerHTML = footerHTML;

  console.log(
    "AgileAI Footer Engine v2.0 initialized successfully"
  );

  /* ======================================================
     FOOTER LIFECYCLE EVENT
  ====================================================== */

  document.dispatchEvent(
    new Event("footerInjected")
  );

});