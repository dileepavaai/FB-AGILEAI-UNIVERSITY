/* =====================================================
   Agile AI University — Canonical Footer
   CENTRALIZED — LOCKED
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const footerMount = document.getElementById("site-footer");
  if (!footerMount) return;

  footerMount.innerHTML = `
<footer>
  <div class="container">

    <p>
      <strong>Agile AI University</strong><br />
      An independent Academic &amp; Professional Body for Agile AI
      and Agentic AI.
    </p>

    <p>
      © 2025 Agile AI University. All rights reserved.
    </p>

    <p>
      <a href="https://agileai.university" target="_blank" rel="noopener noreferrer">
        agileai.university
      </a>
      ·
      <a href="https://portal.agileai.university" target="_blank" rel="noopener noreferrer">
        portal.agileai.university
      </a>
      ·
      <a href="https://verify.agileai.university" target="_blank" rel="noopener noreferrer">
        verify.agileai.university
      </a>
    </p>

    <p style="max-width: 720px;">
      This website presents academic frameworks, capability assessments,
      governance references, and professional standards.
      It does not constitute a training advertisement or certification offer.
    </p>

  </div>
</footer>
  `;
});
