/* =========================================
   Agile AI University
   Institutional Analytics Engine
   Version: v1.0
   Status: LOCKED
   Scope: Shared Design Authority Layer

   Principles:
   - Single GA4 Property
   - Surface-aware tracking
   - No inline gtag calls outside this file
   - PII-safe
   - Production-only activation
   - Fail-safe execution
========================================= */

(function () {

  /* =========================
     CONFIGURATION
  ========================= */

  const AAU_CONFIG = {
    measurementId: "G-L6Q5J3S1YY", // 🔒 REPLACE WITH REAL ID
    environment: window.location.hostname.includes("localhost")
      ? "dev"
      : "prod"
  };

  if (AAU_CONFIG.environment !== "prod") {
    console.info("AAU Analytics: Development mode (tracking disabled)");
    return;
  }

  /* =========================
     GA SCRIPT INJECTION
  ========================= */

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${AAU_CONFIG.measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag("js", new Date());

  /* =========================
     SURFACE DETECTION
  ========================= */

  function detectSurface() {
    const surface = document.body?.dataset?.surface;
    return surface || "unknown";
  }

  const surface = detectSurface();

  gtag("config", AAU_CONFIG.measurementId, {
    page_path: window.location.pathname,
    surface: surface
  });

  /* =========================
     DUPLICATE EVENT GUARD
  ========================= */

  const firedEvents = new Set();

  function safeTrack(eventName, payload = {}, once = false) {
    try {

      if (once && firedEvents.has(eventName)) return;
      if (once) firedEvents.add(eventName);

      gtag("event", eventName, {
        ...payload,
        surface: surface
      });

    } catch (error) {
      console.warn("AAU Analytics error:", error);
    }
  }

  /* =========================
     PUBLIC API
  ========================= */

  window.AAUAnalytics = {

    /* Core */

    track: function (eventName, payload = {}) {
      safeTrack(eventName, payload);
    },

    trackOnce: function (eventName, payload = {}) {
      safeTrack(eventName, payload, true);
    },

    pageView: function () {
      safeTrack("surface_view", {
        page_path: window.location.pathname
      });
    },

    getSurface: function () {
      return surface;
    },

    /* Assessment Helpers */

    trackAssessmentStart: function () {
      safeTrack("assessment_start", {}, true);
    },

    trackAssessmentStep: function (stepNumber) {
      safeTrack("assessment_step_view", {
        step: stepNumber
      });
    },

    trackAssessmentContext: function (role, industry, aspiration) {
      safeTrack("assessment_context_submitted", {
        role: role,
        industry: industry,
        aspiration: aspiration
      });
    },

    trackAssessmentComplete: function (scoreBand, role, industry) {
      safeTrack("assessment_complete", {
        score_band: scoreBand,
        role: role,
        industry: industry
      }, true);
    },

    trackLeadSubmission: function () {
      safeTrack("lead_submitted", {}, true);
    },

    trackReportGenerated: function () {
      safeTrack("report_generated", {}, true);
    },

    /* Credential */

    trackCredentialAttempt: function () {
      safeTrack("credential_verify_attempt");
    },

    trackCredentialSuccess: function () {
      safeTrack("credential_verify_success");
    },

    trackCredentialFailure: function () {
      safeTrack("credential_verify_failure");
    }

  };

  /* =========================
     AUTO PAGE VIEW
  ========================= */

  window.addEventListener("load", function () {
    window.AAUAnalytics.pageView();
  });

})();