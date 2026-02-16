document.addEventListener("DOMContentLoaded", function () {

  const currentYear = new Date().getFullYear();

  const footerHTML = `
    <div class="site-footer">
      <div class="footer-inner">

        <p class="footer-title">
          Agile AI University
        </p>

        <p class="footer-disclaimer">
          Agile AI University defines structured academic frameworks, capability standards, and professional recognition models for the Agile AI domain.
          It operates as an independent academic and professional body and is not positioned as a commercial training provider.
        </p>

        <p class="footer-governance">
          The institution operates under the broader governance framework of 
          <a href="https://agileai.foundation" target="_blank" rel="noopener">
            AgileAI Foundation
          </a>.
        </p>

        <p class="footer-links">
          <a href="https://agileai.university">agileai.university</a> ·
          <a href="https://learn.agileai.university">learn.agileai.university</a> ·
          <a href="https://portal.agileai.university">portal.agileai.university</a> ·
          <a href="https://verify.agileai.university">verify.agileai.university</a>
        </p>

        <p class="footer-links">
          <a href="/governance/terms-and-conditions.html">Terms & Conditions</a> ·
          <a href="/governance/privacy-policy.html">Privacy Policy</a> ·
          <a href="/governance/refund-policy.html">Refund Policy</a>
        </p>

        <p class="footer-copy">
          © ${currentYear} Agile AI University
        </p>

      </div>
    </div>
  `;

  const footerContainer = document.getElementById("site-footer");
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  }

});
