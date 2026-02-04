/* =====================================================
   Agile AI University — Institutional Footer
   GOVERNANCE-GRADE · CONTEXT-SAFE · BRAND-STABLE
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const footerMount = document.getElementById("site-footer");
  if (!footerMount) return;

  const year = new Date().getFullYear();

  footerMount.innerHTML = `
<footer class="site-footer" role="contentinfo">
  <div class="container">

    <!-- INSTITUTIONAL IDENTITY -->
    <section class="footer-block">
      <p>
        <strong>Agile AI University</strong><br />
        An independent Academic &amp; Professional Body advancing
        standards, capability, and responsible practice in
        Agile AI and Agentic AI systems.
      </p>
    </section>

    <!-- NAVIGATION / OFFICIAL SYSTEMS -->
    <section class="footer-block">
      <p>
        <a href="https://agileai.university" rel="noopener">
          Official Website
        </a>
        ·
        <a href="https://portal.agileai.university" rel="noopener">
          Student &amp; Executive Portal
        </a>
        ·
        <a href="https://verify.agileai.university" rel="noopener">
          Credential Verification
        </a>
      </p>
    </section>

    <!-- GOVERNANCE -->
    <section class="footer-block">
      <p>
        <a href="/governance/index.html">
          Governance &amp; Institutional Integrity
        </a>
        ·
        <a href="/governance/terms-and-conditions.html">
          Terms &amp; Conditions
        </a>
        ·
        <a href="/governance/privacy-policy.html">
          Privacy Policy
        </a>
        ·
        <a href="/governance/refund-policy.html">
          Refund Policy
        </a>
      </p>
    </section>

    <!-- SCOPE & DISCLAIMERS -->
    <section class="footer-block" style="max-width: 760px;">
      <p>
        This digital environment provides authenticated access to
        academic assessments, professional credentials, executive insight
        reports, and institutional verification services.
      </p>

      <p>
        Content, assessments, and reports issued by Agile AI University
        are advisory and academic in nature. They do not constitute
        training advertisements, employment recommendations,
        hiring endorsements, certification guarantees, or promotional claims.
      </p>
    </section>

    <!-- COPYRIGHT -->
    <section class="footer-block footer-muted">
      <p>
        © ${year} Agile AI University. All rights reserved.
      </p>
    </section>

  </div>
</footer>
  `;
});
