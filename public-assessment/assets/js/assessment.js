/* =========================================================
   Agile + AI Capability Assessment — Core Logic
   Agile AI University

   FINAL — SAFE TO FREEZE
   v2.4.1 — GOVERNANCE CLARITY PASS (NO LOGIC CHANGE)
   ========================================================= */

/* =========================================================
   GOVERNANCE & ARCHITECTURE NOTICE (DO NOT REMOVE)
   ---------------------------------------------------------
   This file:
   - Owns assessment scoring, signals, and FREE Insight Report
   - Generates participant context + report metadata
   - Explicitly sets Executive entitlement = FALSE by default
   - DOES NOT grant, upgrade, or verify Executive access

   Executive access enforcement happens ONLY in:
   - report.html            → Executive CTA intent
   - executive-insight.html → Cloud Function entitlement check

   Any attempt to grant Executive access here
   is a GOVERNANCE VIOLATION.
   ========================================================= */

/* ================================
   1. DIMENSION MAPPING (15 Qs)
================================ */

const DIMENSIONS = {
  agile:   [1, 2, 3],
  ai:      [4, 5, 6],
  systems: [7, 8, 9],
  humics:  [10, 11, 12],
  change:  [13, 14, 15]
};

/* ================================
   2. SIGNAL COPY (LOCKED)
================================ */

const SIGNAL_COPY = {
  agile: {
    low:  "Execution relies on plans and controls, with limited adaptability under change.",
    mid:  "Execution adapts through feedback and learning, though often at a local level.",
    high: "Execution is continuously adaptive, with outcomes and learning shaping flow."
  },
  ai: {
    low:  "AI is primarily viewed as tooling or automation support.",
    mid:  "AI is understood as part of systems, with awareness of strengths and limits.",
    high: "AI is treated as a decision-influencing capability with clear boundaries."
  },
  systems: {
    low:  "Challenges are addressed in isolation, with limited systems awareness.",
    mid:  "Interdependencies are recognized, though not always acted upon systemically.",
    high: "Decisions consistently reflect system-wide behavior and long-term effects."
  },
  humics: {
    low:  "Ethical, trust, and human impacts are considered inconsistently.",
    mid:  "Ethical and trust considerations are discussed during key decisions.",
    high: "Empathy, trust, and ethical responsibility actively shape AI and Agile choices."
  },
  change: {
    low:  "Change is met with resistance or compliance.",
    mid:  "Change is accepted and managed through engagement.",
    high: "Change is co-created through continuous learning and adaptation."
  }
};

/* ================================
   3. SCORING HELPERS
================================ */

function averageScore(answers, questions) {
  let total = 0;
  let count = 0;
  questions.forEach(q => {
    if (answers[q]) {
      total += answers[q];
      count++;
    }
  });
  return count === 0 ? 0 : total / count;
}

function scoreToSignal(score) {
  if (score < 2.3) return "low";
  if (score < 3.3) return "mid";
  return "high";
}

function scoreToPercent(score) {
  return Math.round(((score - 1) / 3) * 100);
}

/* ================================
   4. REPORT REFERENCE ID (LOCKED)
================================ */

function generateReferenceId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AAIU-AACI-${year}-${rand}`;
}

/* ================================
   5. OVERALL REFLECTION
================================ */

function generateOverallReflection(signals) {
  const highs = Object.values(signals).filter(v => v === "high").length;
  const lows  = Object.values(signals).filter(v => v === "low").length;

  if (highs >= 3) {
    return "Your responses reflect a well-integrated Agile AI capability, balancing execution, AI understanding, systems thinking, governance, and human impact.";
  }

  if (lows >= 3) {
    return "Your responses indicate foundational capability development, with opportunities to strengthen alignment across Agile, AI, and human considerations.";
  }

  return "Your responses reflect a mixed capability profile, with strengths in some areas and growth opportunities in others.";
}

/* ================================
   6. GENERATE FREE INSIGHT REPORT
================================ */

function generateReport() {

  /* ---------- Answers ---------- */
  const answers = {};
  document.querySelectorAll("input[type=radio]:checked").forEach(radio => {
    const qId = parseInt(radio.name.replace("q", ""), 10);
    answers[qId] = parseInt(radio.value, 10);
  });

  /* ---------- Scores ---------- */
  const signals = {};
  const insights = {};
  const percents = {};

  Object.keys(DIMENSIONS).forEach(dim => {
    const score = averageScore(answers, DIMENSIONS[dim]);
    const level = scoreToSignal(score);
    signals[dim]  = level;
    insights[dim] = SIGNAL_COPY[dim][level];
    percents[dim] = scoreToPercent(score);
  });

  /* ---------- Participant (Source of Truth) ---------- */
  const participant =
    JSON.parse(sessionStorage.getItem("assessmentParticipant")) || {};

  /* ---------- Context ---------- */
  const context = {
    name: participant.name || "—",
    email: participant.email || "",
    role: document.getElementById("ctx-role")?.value || "—",
    industry: document.getElementById("ctx-industry")?.value || "—",
    aspiration: document.getElementById("ctx-aspiration")?.value || "—"
  };

  /* ---------- Persist Context ---------- */
  sessionStorage.setItem("assessmentSignals", JSON.stringify(signals));
  sessionStorage.setItem("assessmentInsights", JSON.stringify(insights));
  sessionStorage.setItem("assessmentPercents", JSON.stringify(percents));
  sessionStorage.setItem("assessmentContext", JSON.stringify(context));
  sessionStorage.setItem("overallReflection", generateOverallReflection(signals));
  sessionStorage.setItem("reportReferenceId", generateReferenceId());
  sessionStorage.setItem(
    "reportIssueDate",
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    })
  );

  /* ==================================================
     PHASE-2 ENTITLEMENT DEFAULT (LOCKED — DO NOT CHANGE)
     --------------------------------------------------
     Executive Insight is DENIED by default.
     Any upgrade happens outside this file.
  ================================================== */
  sessionStorage.setItem("executiveEntitled", "false");

  window.location.href = "./report.html";
}

/* ================================
   7. HYDRATE FREE REPORT
================================ */

function hydrateReport() {

  const signals  = JSON.parse(sessionStorage.getItem("assessmentSignals"));
  const insights = JSON.parse(sessionStorage.getItem("assessmentInsights"));
  const context  = JSON.parse(sessionStorage.getItem("assessmentContext"));
  const percents = JSON.parse(sessionStorage.getItem("assessmentPercents"));
  const overall  = sessionStorage.getItem("overallReflection");

  if (!signals || !context || !percents) return;

  /* ---------- Header ---------- */
  document.getElementById("report-name").textContent = context.name || "—";
  document.getElementById("report-name-context").textContent = context.name || "—";
  document.getElementById("report-role").textContent = context.role;
  document.getElementById("report-industry").textContent = context.industry;
  document.getElementById("report-aspiration").textContent = context.aspiration;

  /* ---------- Bars ---------- */
  ["agile","ai","systems","humics","change"].forEach(dim => {
    const bar = document.getElementById(`bar-${dim}`);
    const label = document.getElementById(`label-${dim}`);
    if (bar) bar.style.width = percents[dim] + "%";
    if (label) label.textContent = `${signals[dim]} · ${percents[dim]}%`;
  });

  /* ---------- Signals ---------- */
  document.getElementById("agile-signal").textContent = insights.agile;
  document.getElementById("ai-signal").textContent = insights.ai;
  document.getElementById("systems-signal").textContent = insights.systems;
  document.getElementById("governance-signal").textContent = insights.humics;
  document.getElementById("change-signal").textContent = insights.change;
  document.getElementById("overall-signal").textContent = overall;

  /* ---------- Footer ---------- */
  document.getElementById("report-reference-id").textContent =
    sessionStorage.getItem("reportReferenceId");

  document.getElementById("report-issue-date").textContent =
    sessionStorage.getItem("reportIssueDate");

  document
    .getElementById("downloadPdf")
    ?.addEventListener("click", () => window.print());
}

/* ================================
   8. INIT
================================ */

document.addEventListener("DOMContentLoaded", () => {

  if (document.querySelector(".report-page")) {
    hydrateReport();
  }

  document
    .getElementById("generateReport")
    ?.addEventListener("click", generateReport);
});
