document.addEventListener("DOMContentLoaded", function () {

  const currentYear = new Date().getFullYear();

  const footerHTML = `
    <footer class="site-footer">
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
          <a href="https://edu.agileai.university">edu.agileai.university</a> ·
          <a href="https://portal.agileai.university">portal.agileai.university</a> ·
          <a href="https://verify.agileai.university">verify.agileai.university</a>
        </p>

        <p class="footer-links">
          <a href="/terms.html">Terms & Conditions</a> ·
          <a href="/privacy.html">Privacy Policy</a> ·
          <a href="/refund.html">Refund Policy</a>
        </p>

        <p class="footer-copy">
          © ${currentYear} Agile AI University
        </p>

      </div>
    </footer>
  `;

  const footerContainer = document.getElementById("footer");
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  }

});
