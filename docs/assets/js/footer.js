document.addEventListener("DOMContentLoaded", function () {

  const currentYear = new Date().getFullYear();

  const footerHTML = `
    <footer class="site-footer">
      <div class="footer-inner">

        <p class="footer-title">
          LAAU
        </p>

        <p class="footer-disclaimer">
          LAAU defines structured academic frameworks, capability standards, and professional recognition models for the Agile AI domain.
          It operates as an independent academic and professional body and is not positioned as a commercial training provider.
        </p>

        <p class="footer-governance">
          The institution operates under the broader governance framework of 
          <a href="https://agileai.foundation" target="_blank" rel="noopener">
            AgileAI Foundation
          </a>.
        </p>

        <p class="footer-links">
          <a href="https://laau.university">laau.university</a> ·
          <a href="https://learn.laau.university">learn.laau.university</a> ·
          <a href="https://portal.laau.university">portal.laau.university</a> ·
          <a href="https://verify.laau.university">verify.laau.university</a>
        </p>

        <p class="footer-links">
          <a href="/terms.html">Terms & Conditions</a> ·
          <a href="/privacy.html">Privacy Policy</a> ·
          <a href="/refund.html">Refund Policy</a>
        </p>

        <p class="footer-copy">
          © ${currentYear} LAAU
        </p>

      </div>
    </footer>
  `;

  const footerContainer = document.getElementById("footer");
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  }

});
