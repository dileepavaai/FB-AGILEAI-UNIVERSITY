/* ========================================================= 
   Applied Agile AI Orchestration Capability Assessment
   Agile AI University

   v3.2 — 25 Question Framework (5×5)
   Institutional Authority Language Precision Pass
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
   - report.html
   - executive-insight.html

   Any attempt to grant Executive access here
   is a GOVERNANCE VIOLATION.
   ========================================================= */


/* ================================
   1. DIMENSION MAPPING (25 Qs)
================================ */

const DIMENSIONS = {
  agile:   [1, 2, 3, 4, 5],
  ai:      [6, 7, 8, 9, 10],
  systems: [11, 12, 13, 14, 15],
  humics:  [16, 17, 18, 19, 20],
  outcome: [21, 22, 23, 24, 25]
};


/* ================================
   2. SIGNAL COPY (Institutional Standard)
================================ */

const SIGNAL_COPY = {

  agile: {
    low:  "Execution is predominantly plan-driven, with adaptability constrained by procedural control structures.",
    mid:  "Execution incorporates adaptive mechanisms, though adaptability remains partially localized rather than systemically embedded.",
    high: "Execution functions as an adaptive delivery system in which outcome alignment and disciplined learning structurally guide operational flow."
  },

  ai: {
    low:  "Artificial Intelligence is positioned primarily as a tooling mechanism, with limited formal boundary definition.",
    mid:  "Artificial Intelligence is recognized as a capability layer, with emerging clarity regarding decision influence and operational constraints.",
    high: "Artificial Intelligence operates as a bounded decision-influencing capability within defined governance, accountability, and risk parameters."
  },

  systems: {
    low:  "Organizational challenges are addressed in functional isolation, with limited systemic visibility across interdependencies.",
    mid:  "Cross-functional interdependencies are acknowledged, though systemic integration remains variably applied.",
    high: "Decisions are consistently evaluated through systemic impact analysis, reflecting structural coherence across interconnected domains."
  },

  humics: {
    low:  "Ethical and human impact considerations are addressed reactively, without consistent structural integration.",
    mid:  "Ethical responsibility and trust calibration are incorporated into key decision contexts, though not uniformly embedded.",
    high: "Ethical governance, trust calibration, and human impact assessment are structurally integrated within AI-enabled operational design."
  },

  outcome: {
    low:  "AI interaction is predominantly task-oriented, with limited formal alignment to defined outcome architecture.",
    mid:  "Outcome intent is articulated with increasing clarity, though prompting discipline and accountability mechanisms remain emergent.",
    high: "Outcome-based system prompting operates as a structured capability, aligned to measurable objectives and governed through iterative refinement protocols."
  }

};


/* ================================
   3. SCORING HELPERS
================================ */

function averageScore(answers, questions) {
  let total = 0;
  let count = 0;

  questions.forEach(q => {
    if (answers[q] !== undefined) {
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
  if (score === 0) return 0;
  return Math.round(((score - 1) / 3) * 100);
}


/* ================================
   4. REPORT REFERENCE ID
================================ */

function generateReferenceId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AAIU-AAOC-${year}-${rand}`;
}


/* ================================
   5. OVERALL REFLECTION (Institutional Tone)
================================ */

function generateOverallReflection(signals) {

  const highs = Object.values(signals).filter(v => v === "high").length;
  const lows  = Object.values(signals).filter(v => v === "low").length;

  if (highs >= 3) {
    return "The responses indicate an integrated Applied Agile AI Orchestration capability profile, in which execution discipline, AI fluency, systemic coherence, governance responsibility, and outcome-based prompting operate as a structurally aligned capability system.";
  }

  if (lows >= 3) {
    return "The responses reflect a foundational capability profile, where structural integration across execution, AI fluency, governance alignment, and outcome-based prompting remains emergent.";
  }

  return "The responses reflect a variably integrated capability profile, with areas of structural maturity alongside domains requiring deeper systemic alignment.";
}


/* ================================
   6. GENERATE FREE INSIGHT REPORT
================================ */

function generateReport() {

  const answers = {};

  document.querySelectorAll("input[type=radio]:checked").forEach(radio => {
    const qId = parseInt(radio.name.replace("q", ""), 10);
    answers[qId] = parseInt(radio.value, 10);
  });

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

  const participant =
    JSON.parse(sessionStorage.getItem("assessmentParticipant")) || {};

  const context = {
    name: participant.name || "—",
    email: participant.email || "",
    role: document.getElementById("ctx-role")?.value || "—",
    industry: document.getElementById("ctx-industry")?.value || "—",
    aspiration: document.getElementById("ctx-aspiration")?.value || "—"
  };

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

  document.getElementById("report-name")?.textContent = context.name || "—";
  document.getElementById("report-name-context")?.textContent = context.name || "—";
  document.getElementById("report-role")?.textContent = context.role;
  document.getElementById("report-industry")?.textContent = context.industry;
  document.getElementById("report-aspiration")?.textContent = context.aspiration;

  ["agile","ai","systems","humics","outcome"].forEach(dim => {
    const bar = document.getElementById(`bar-${dim}`);
    const label = document.getElementById(`label-${dim}`);

    if (bar) bar.style.width = (percents[dim] || 0) + "%";
    if (label) label.textContent = `${signals[dim]} · ${percents[dim]}%`;
  });

  const signalMap = {
    agile: "agile-signal",
    ai: "ai-signal",
    systems: "systems-signal",
    humics: "governance-signal",
    outcome: "outcome-signal"
  };

  Object.keys(signalMap).forEach(dim => {
    const el = document.getElementById(signalMap[dim]);
    if (el && insights[dim]) {
      el.textContent = insights[dim];
    }
  });

  const overallEl = document.getElementById("overall-signal");
  if (overallEl && overall) {
    overallEl.textContent = overall;
  }

  document.getElementById("report-reference-id")?.textContent =
    sessionStorage.getItem("reportReferenceId") || "";

  document.getElementById("report-issue-date")?.textContent =
    sessionStorage.getItem("reportIssueDate") || "";

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