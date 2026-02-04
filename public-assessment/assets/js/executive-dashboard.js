/* =========================================================  
   Executive Dashboard — ED-1 → ED-7
   --------------------------------
   ED-1: Interpretive data wiring
   ED-2: Access hardening
   ED-3: Participant name
   ED-4: Assessment date/time
   ED-5: Timezone label
   ED-6: Assessment version
   ED-7: Valid-until / expiry

   Governance:
   - Read-only
   - Session-based
   - Advisory only
   - No Firestore, no backend calls
   ========================================================= */

(function () {
  "use strict";

  /* =====================================================
     🔐 ACCESS HARDENING
     ===================================================== */

  const EXEC_KEY = "execInsightUnlocked";
  const ORIENTATION_URL = "/report.html";
  const SESSION_CHECK_INTERVAL_MS = 1500;
  const VALIDITY_DAYS = 30;

  function hasExecutiveAccess() {
    return sessionStorage.getItem(EXEC_KEY) === "true";
  }

  function redirectToOrientation(message) {
    if (message) {
      sessionStorage.setItem("execSessionMessage", message);
    }
    window.location.replace(ORIENTATION_URL);
  }

  if (!hasExecutiveAccess()) {
    redirectToOrientation(
      "Your executive session has ended. You may return to the orientation report or re-unlock executive insight."
    );
    return;
  }

  setInterval(() => {
    if (!hasExecutiveAccess()) {
      redirectToOrientation(
        "Your executive session has ended. You may return to the orientation report or re-unlock executive insight."
      );
    }
  }, SESSION_CHECK_INTERVAL_MS);

  /* =====================================================
     Utilities
     ===================================================== */

  function get(obj, path, fallback = null) {
    try {
      return path.split(".").reduce((o, p) => o && o[p], obj) ?? fallback;
    } catch {
      return fallback;
    }
  }

  function detectTimezoneLabel() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === "Asia/Kolkata") return "IST";

      const offsetMin = new Date().getTimezoneOffset();
      const sign = offsetMin <= 0 ? "+" : "-";
      const abs = Math.abs(offsetMin);
      const hh = String(Math.floor(abs / 60)).padStart(2, "0");
      const mm = String(abs % 60).padStart(2, "0");
      return `UTC${sign}${hh}:${mm}`;
    } catch {
      return "UTC";
    }
  }

  function formatDateTime(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return null;

    const base = d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });

    return `${base} ${detectTimezoneLabel()}`;
  }

  function formatDateOnly(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return null;

    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  /* =====================================================
     FALLBACK TEXT (MOVED UP — FIX)
     ===================================================== */

  const fallbackText = {
    capability:
      "Leadership capability patterns are present, though insufficient session data is available for deeper interpretation.",
    governance:
      "Governance readiness signals are emerging, with further context required for confident interpretation.",
    adaptive:
      "Adaptive load patterns cannot be fully interpreted from the available session context."
  };

  /* =====================================================
     ED-3 — PARTICIPANT NAME
     ===================================================== */

  const participantName = sessionStorage.getItem("participantName");
  const execTitle = document.getElementById("execTitle");
  const execMeta  = document.getElementById("execMeta");

  if (participantName && execTitle) {
    execTitle.textContent = `Executive Dashboard — ${participantName}`;
  }

  /* =====================================================
     Load assessment session
     ===================================================== */

  const sessionRaw = sessionStorage.getItem("assessmentResult");
  let assessment = null;

  if (sessionRaw) {
    try {
      assessment = JSON.parse(sessionRaw);
    } catch {
      assessment = null;
    }
  }

  const metaParts = [];
  let completedDate = null;

  /* =====================================================
     ED-4 + ED-5 — DATE/TIME + TIMEZONE
     ===================================================== */

  if (assessment) {
    const completedAt =
      get(assessment, "completedAt") ||
      get(assessment, "meta.completedAt");

    if (completedAt) {
      const d = new Date(completedAt);
      const formatted = formatDateTime(d);
      if (formatted) {
        metaParts.push(`Assessment completed on ${formatted}`);
        completedDate = d;
      }
    }
  }

  /* =====================================================
     ED-6 — ASSESSMENT VERSION
     ===================================================== */

  if (assessment) {
    const version =
      get(assessment, "version") ||
      get(assessment, "meta.version");

    if (version) {
      metaParts.push(`Assessment version: ${version}`);
    }
  }

  /* =====================================================
     ED-7 — VALID UNTIL / EXPIRY
     ===================================================== */

  if (completedDate) {
    const expiry = new Date(completedDate);
    expiry.setDate(expiry.getDate() + VALIDITY_DAYS);

    const expiryLabel = formatDateOnly(expiry);
    if (expiryLabel) {
      metaParts.push(`Valid until ${expiryLabel}`);
    }
  }

  if (execMeta && metaParts.length > 0) {
    execMeta.textContent = metaParts.join(" · ");
  }

  /* =====================================================
     Extract bands
     ===================================================== */

  if (!assessment) {
    applyFallback();
    return;
  }

  const agileBand   = get(assessment, "bands.agile");
  const aiBand      = get(assessment, "bands.ai");
  const systemsBand = get(assessment, "bands.systems");
  const ethicsBand  = get(assessment, "bands.humics");
  const changeBand  = get(assessment, "bands.change");

  /* =====================================================
     Interpretive mappings
     ===================================================== */

  function interpretCapabilityPosture() {
    if (!agileBand || !aiBand || !systemsBand) {
      return fallbackText.capability;
    }

    if (agileBand === "high" && aiBand !== "low") {
      return "Execution strength is evident, with AI reasoning and systems awareness beginning to shape decision flow.";
    }

    if (agileBand === "high" && aiBand === "low") {
      return "Execution capability is strong, though AI reasoning is not yet consistently integrated into leadership decisions.";
    }

    if (agileBand === "mid") {
      return "Execution, AI reasoning, and systems awareness are developing in parallel, with emerging balance across leadership capabilities.";
    }

    return "Leadership capability shows uneven distribution, with selective strengths and constrained systemic integration.";
  }

  function interpretGovernanceReadiness() {
    if (!ethicsBand || !systemsBand) {
      return fallbackText.governance;
    }

    if (ethicsBand === "high" && systemsBand === "high") {
      return "Governance structures appear well-aligned, with clear accountability boundaries and system-supported decision authority.";
    }

    if (ethicsBand === "high" && systemsBand !== "high") {
      return "Ethical boundaries are well understood, though system readiness to support governance decisions remains uneven.";
    }

    if (ethicsBand === "mid") {
      return "Governance readiness is emerging, with partial clarity in accountability and decision authority under changing conditions.";
    }

    return "Governance structures appear under strain, with limited system support for consistent decision accountability.";
  }

  function interpretAdaptiveLoad() {
    if (!changeBand || !systemsBand) {
      return fallbackText.adaptive;
    }

    if (changeBand === "high" && systemsBand === "high") {
      return "Change pressure is being absorbed sustainably through systems and shared leadership capacity.";
    }

    if (changeBand === "high" && systemsBand !== "high") {
      return "Change demand is largely absorbed at the leadership level rather than distributed through system capacity.";
    }

    if (changeBand === "mid") {
      return "Adaptive load is partially balanced, with leadership absorbing some change while systems continue to mature.";
    }

    return "Adaptive capacity is limited, with change pressure accumulating faster than systemic absorption.";
  }

  function apply() {
    const capabilityEl = document.getElementById("capabilityPosture");
    const governanceEl = document.getElementById("governanceReadiness");
    const adaptiveEl   = document.getElementById("adaptiveLoad");

    if (capabilityEl) capabilityEl.textContent = interpretCapabilityPosture();
    if (governanceEl) governanceEl.textContent = interpretGovernanceReadiness();
    if (adaptiveEl)   adaptiveEl.textContent   = interpretAdaptiveLoad();
  }

  function applyFallback() {
    const capabilityEl = document.getElementById("capabilityPosture");
    const governanceEl = document.getElementById("governanceReadiness");
    const adaptiveEl   = document.getElementById("adaptiveLoad");

    if (capabilityEl) capabilityEl.textContent = fallbackText.capability;
    if (governanceEl) governanceEl.textContent = fallbackText.governance;
    if (adaptiveEl)   adaptiveEl.textContent   = fallbackText.adaptive;
  }

  apply();

})();
