/* =====================================================
   🔷 ADMIN DASHBOARD (METRICS + FUNNEL + REVENUE + PROGRAM)
   ===================================================== */

import { db } from "./core.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================================================
   🔷 HELPERS
   ===================================================== */

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function percent(a, b) {
  if (!b || b === 0) return "—";
  return ((a / b) * 100).toFixed(1) + "%";
}

function currencyFormat(value) {
  if (!value || isNaN(value)) return "—";
  return Number(value).toLocaleString();
}

/* =====================================================
   🔷 LOAD DASHBOARD
   ===================================================== */

async function loadDashboard() {
  try {
    console.log("📊 Loading dashboard...");

    const [
      leadsSnap,
      batchSnap,
      credSnap,
      txnSnap
    ] = await Promise.all([
      getDocs(collection(db, "leads")),
      getDocs(collection(db, "batches")),
      getDocs(collection(db, "credentials")),
      getDocs(collection(db, "transactions"))
    ]);

    /* ============================================
       🔷 BASIC METRICS
       ============================================ */

    const leadsCount = leadsSnap.size;
    const batchesCount = batchSnap.size;
    const credentialsCount = credSnap.size;
    const transactionsCount = txnSnap.size;

    setText("metricLeads", leadsCount);
    setText("metricBatches", batchesCount);
    setText("metricCredentials", credentialsCount);
    setText("metricTransactions", transactionsCount);

    /* ============================================
       🔥 FUNNEL
       ============================================ */

    let qualified = 0;
    let converted = 0;

    leadsSnap.forEach(doc => {
      const l = doc.data() || {};
      const status = (l.status || "").toLowerCase();

      if (status === "qualified") qualified++;
      if (status === "converted") converted++;
    });

    setText("funnelLeads", leadsCount);
    setText("funnelQualified", qualified);
    setText("funnelConverted", converted);
    setText("funnelCredentials", credentialsCount);

    setText("funnelLQ", percent(qualified, leadsCount));
    setText("funnelQC", percent(converted, qualified));
    setText("funnelLC", percent(converted, leadsCount));

    /* ============================================
       💰 REVENUE + PROGRAM BREAKDOWN
       ============================================ */

    let totalRevenue = 0;
    let successCount = 0;
    let currency = "INR";

    const revenueByProgram = {
      AOP: 0,
      AIPA: 0,
      AAIA: 0
    };

    txnSnap.forEach(doc => {
      const t = doc.data() || {};
      const status = (t.status || "").toLowerCase();

      if (status === "captured" || status === "success") {
        const amount = Number(t.amount || 0);
        totalRevenue += amount;
        successCount++;

        const program = (t.program_code || "").toUpperCase();
        if (revenueByProgram[program] !== undefined) {
          revenueByProgram[program] += amount;
        }

        if (t.currency) currency = t.currency;
      }
    });

    const avgRevenue = successCount ? totalRevenue / successCount : 0;

    setText("revTotal", currency + " " + currencyFormat(totalRevenue));
    setText("revCount", successCount);
    setText("revAvg", currency + " " + currencyFormat(avgRevenue));
    setText("revCurrency", currency);

    /* ============================================
       🧠 PROGRAM INTELLIGENCE
       ============================================ */

    const credsByProgram = {
      AOP: 0,
      AIPA: 0,
      AAIA: 0
    };

    credSnap.forEach(doc => {
      const c = doc.data() || {};
      const program = (c.program_code || "").toUpperCase();

      if (credsByProgram[program] !== undefined) {
        credsByProgram[program]++;
      }
    });

    // Credentials
    setText("progAOP", credsByProgram.AOP);
    setText("progAIPA", credsByProgram.AIPA);
    setText("progAAIA", credsByProgram.AAIA);

    // Revenue
    setText("revAOP", currency + " " + currencyFormat(revenueByProgram.AOP));
    setText("revAIPA", currency + " " + currencyFormat(revenueByProgram.AIPA));
    setText("revAAIA", currency + " " + currencyFormat(revenueByProgram.AAIA));

    // Top program
    let topProgram = "—";
    let maxRevenue = 0;

    Object.entries(revenueByProgram).forEach(([program, value]) => {
      if (value > maxRevenue) {
        maxRevenue = value;
        topProgram = program;
      }
    });

    setText("topProgram", topProgram);

    console.log("✅ Dashboard ready");

  } catch (err) {
    console.error("🔥 Dashboard load error:", err);

    [
      "metricLeads",
      "metricBatches",
      "metricCredentials",
      "metricTransactions",
      "funnelLeads",
      "funnelQualified",
      "funnelConverted",
      "funnelCredentials",
      "funnelLQ",
      "funnelQC",
      "funnelLC",
      "revTotal",
      "revCount",
      "revAvg",
      "revCurrency",
      "progAOP",
      "progAIPA",
      "progAAIA",
      "revAOP",
      "revAIPA",
      "revAAIA",
      "topProgram"
    ].forEach(id => setText(id, "—"));
  }
}

/* =====================================================
   🔷 USAGE (PLACEHOLDER)
   ===================================================== */

function loadUsageIndicators() {
  setText("usageAssess", "—");
  setText("usagePortal", "—");
  setText("usageVerify", "—");
}

/* =====================================================
   🚀 INIT
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  loadDashboard();
  loadUsageIndicators();
});