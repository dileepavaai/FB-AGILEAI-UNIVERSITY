/* ============================================================
   Agile AI University — Frontend Runtime Configuration
   Scope: Assessment & Executive Insight surfaces
   Governance: LOCKED (read-only, no business logic)
   ============================================================ */

window.AAIU_CONFIG = {
  /* ------------------------------------------------------------
     Core Identity
     ------------------------------------------------------------ */
  ORG_NAME: "Agile AI University",

  /* ------------------------------------------------------------
     Assessment Surfaces
     ------------------------------------------------------------ */
  ASSESSMENT_BASE_URL: "https://assessment.agileai.university",

  INSIGHT_REPORT_URL:
    "https://assessment.agileai.university/report.html",

  EXECUTIVE_INSIGHT_URL:
    "https://assessment.agileai.university/executive-insight.html",

  /* ------------------------------------------------------------
     Executive Entitlement Check (Cloud Function)
     ------------------------------------------------------------ */
  CHECK_EXECUTIVE_ENTITLEMENT_URL:
    "https://us-central1-fb-agileai-university.cloudfunctions.net/checkExecutiveEntitlement",

  /* ------------------------------------------------------------
     Support & Governance
     ------------------------------------------------------------ */
  SUPPORT_EMAIL: "support@agileai.university",

  GOVERNANCE_NOTICE:
    "Executive Insight access is governed and requires entitlement."
};
