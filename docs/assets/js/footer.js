document.addEventListener("DOMContentLoaded", function () {

  const currentYear = new Date().getFullYear();

  const footerHTML = `
    <footer class="site-footer">
      <div class="footer-inner">

        <p class="footer-title">
          AgileAI Foundation & Agile AI University
        </p>

        <p>
          An independent academic and professional body advancing structured
          capability in Agile AI and Agentic AI.
        </p>

        <p class="footer-links">
          <a href="https://agileai.university">agileai.university</a> ·
          <a href="https://portal.agileai.university">portal.agileai.university</a> ·
          <a href="https://verify.agileai.university">verify.agileai.university</a>
        </p>

        <p class="footer-links">
          <a href="/terms.html">Terms & Conditions</a> ·
          <a href="/privacy.html">Privacy Policy</a> ·
          <a href="/refund.html">Refund Policy</a>
        </p>

        <p class="footer-disclaimer">
          This website presents academic frameworks, capability assessments,
          governance references, and professional standards. It does not
          constitute a training advertisement, certification offer,
          hiring endorsement, or promotional claim.
        </p>

        <p class="footer-governance">
          Agile AI University operates under the governance framework of
          <a href="https://agileai.foundation" target="_blank" rel="noopener">
            agileai.foundation
          </a>.
        </p>

        <p class="footer-copy">
          © ${currentYear} AgileAI Foundation & Agile AI University
        </p>

      </div>
    </footer>
  `;

  const footerContainer = document.getElementById("footer");
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  }

});
