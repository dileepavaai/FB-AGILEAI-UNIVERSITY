/* ==========================================
   AgileAI Public Analytics Layer
   Governance-Aligned Minimal Tracking
========================================== */

(function () {

  const ANALYTICS_ID = "G-XXXXXXXXXX"; // Replace with real ID

  if (!ANALYTICS_ID) return;

  // Load GA script asynchronously
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;

  gtag("js", new Date());

  gtag("config", ANALYTICS_ID, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

})();
