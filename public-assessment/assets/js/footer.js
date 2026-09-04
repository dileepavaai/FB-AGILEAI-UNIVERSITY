/* =====================================================
   LAAU — Canonical Footer
   CENTRALIZED — LOCKED
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const footerMount = document.getElementById("site-footer");
  if (!footerMount) return;

  footerMount.innerHTML = `
<footer>
  <div class="container">

    <p>
      <strong>LAAU</strong><br />
      An independent Academic &amp; Professional Body for Agile AI
      and Agentic AI.
    </p>

    <p>
      © 2025 LAAU. All rights reserved.
    </p>

    <p>
      <a href="https://laau.university" target="_blank" rel="noopener noreferrer">
        laau.university
      </a>
      ·
      <a href="https://portal.laau.university" target="_blank" rel="noopener noreferrer">
        portal.laau.university
      </a>
      ·
      <a href="https://verify.laau.university" target="_blank" rel="noopener noreferrer">
        verify.laau.university
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
