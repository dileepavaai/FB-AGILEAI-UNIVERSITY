/* =========================================================
   Credential Registry — SINGLE SOURCE OF TRUTH
   GOVERNANCE · INSTITUTIONAL · STABLE
   ========================================================= */

(function () {
  "use strict";

  window.AAIU_CREDENTIAL_REGISTRY = {

    /* =====================================================
       AAIA — Agentic AI Agilist
       ===================================================== */
    AAIA: {
      /* Canonical identifiers */
      code: "AAIA",

      /* Canonical human-readable title
         (REQUIRED by renderCredentials.js) */
      full_title: "Agentic AI Agilist",

      /* Display variants (backward compatibility) */
      full_name: "Agentic AI Agilist",
      display_name: "Agentic AI Agilist (AAIA)",

      /* Credential metadata */
      credential_type: "Professional Credential",
      issuer: "Agile AI University",
      validity: "Lifetime",

      /* Canonical description */
      description:
        "A professional credential recognizing applied capability in Agentic AI systems, decision intelligence, and responsible AI practice.",

      /* LinkedIn Add-to-Profile configuration */
      linkedin: {
        organization: "Agile AI University",
        credential_type: "CERTIFICATION"
      }
    },

    /* =====================================================
       AIPA — Artificial Intelligence Professional Agilist
       ===================================================== */
    AIPA: {
      /* Canonical identifiers */
      code: "AIPA",

      /* Canonical human-readable title */
      full_title: "Artificial Intelligence Professional Agilist",

      /* Display variants */
      full_name: "Artificial Intelligence Professional Agilist",
      display_name: "Artificial Intelligence Professional Agilist (AIPA)",

      /* Credential metadata */
      credential_type: "Professional Credential",
      issuer: "Agile AI University",
      validity: "Lifetime",

      /* SAME description as AAIA (intentional, approved) */
      description:
        "A professional credential recognizing applied capability in leveraging Agile AI to unlock organizational agility, while leading responsible and ethical AI adoption.",

      /* LinkedIn Add-to-Profile configuration */
      linkedin: {
        organization: "Agile AI University",
        credential_type: "CERTIFICATION"
      }
    }

    /* -----------------------------------------------------
       Future credentials go here (append-only)
       ----------------------------------------------------- */
  };

})();
