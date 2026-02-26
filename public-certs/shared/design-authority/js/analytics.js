/* =========================================
   Agile AI University
   Institutional Analytics Engine
   Version: v1.1
   Status: HARDENED
   Scope: Shared Design Authority Layer

   Principles:
   - Single GA4 Property
   - Surface-aware tracking
   - No inline gtag calls outside this file
   - PII-safe
   - Production-only activation
   - Fail-safe execution
   - Governance-aligned configuration
========================================= */

(function () {

  /* =========================
     CONFIGURATION
  ========================= */

  const AAU_CONFIG = {
    measurementId: "G-L6Q5J3S1YY", // 🔒 Institutional GA4 Property
    environment: window.location.hostname.includes("localhost")
      ? "dev"
      : "prod"
  };

  if (!AAU_CONFIG.measurementId) {
    console.warn("AAU Analytics: Missing Measurement ID");
    return;
  }

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

    // Preferred explicit declaration
    const explicit = document.body?.dataset?.surface;
    if (explicit) return explicit;

    // Fallback by hostname
    const host = window.location.hostname;

    if (host.includes("cert")) return "certs";
    if (host.includes("verify")) return "verify";
    if (host.includes("assessment")) return "assessment";
    if (host.includes("portal")) return "portal";
    if (host.includes("learn")) return "learn";
    if (host.includes("edu")) return "edu";

    return "site";
  }

  const surface = detectSurface();

  /* =========================
     BASE CONFIGURATION
  ========================= */

  gtag("config", AAU_CONFIG.measurementId, {
    page_path: window.location.pathname,
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
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

    /* =========================
       Assessment Events
    ========================= */

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

    /* =========================
       Credential Events
    ========================= */

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