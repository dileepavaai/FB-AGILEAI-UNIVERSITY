/* =====================================================
   🔷 RECONCILIATION MODULE (READ-ONLY)
   Auth handled at PAGE LEVEL
   ===================================================== */

import { db } from "./core.js";

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* =====================================================
   📦 STATE
   ===================================================== */

let records = [];

/* =====================================================
   🚀 INIT
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const body = document.getElementById("reconBody");

  if (!body) return;

  loadData();
});

/* =====================================================
   📥 LOAD DATA
   ===================================================== */

async function loadData() {

  try {

    // 🔥 CHANGE COLLECTION NAME IF NEEDED
    const q = query(
      collection(db, "payments"),
      orderBy("created_at", "desc")
    );

    const snap = await getDocs(q);

    records = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    renderTable(records);
    updateSummary(records);

  } catch (err) {
    console.error("Reconciliation load error:", err);
    renderError();
  }
}

/* =====================================================
   📊 SUMMARY
   ===================================================== */

function updateSummary(data) {

  let total = data.length;
  let totalAmount = 0;
  let failedAmount = 0;
  let currency = "—";

  data.forEach(r => {

    const amount = Number(r.amount || 0);

    totalAmount += amount;

    if (["failed", "refunded"].includes(r.status)) {
      failedAmount += amount;
    }

    if (r.currency) {
      currency = r.currency;
    }
  });

  set("summary-total-count", total);
  set("summary-total-amount", formatCurrency(totalAmount));
  set("summary-failed-amount", formatCurrency(failedAmount));
  set("summary-currency", currency);
}

/* =====================================================
   📋 TABLE RENDER
   ===================================================== */

function renderTable(data) {

  const body = document.getElementById("reconBody");

  if (!body) return;

  body.innerHTML = "";

  if (!data.length) {
    body.innerHTML = `<tr><td colspan="6">No data available</td></tr>`;
    return;
  }

  data.forEach(r => {

    body.innerHTML += `
      <tr>
        <td>${r.order_id || "-"}</td>
        <td>${r.payment_id || "-"}</td>
        <td>${r.email || "-"}</td>
        <td>${formatCurrency(r.amount)}</td>
        <td>${r.status || "-"}</td>
        <td>${formatDate(r.created_at)}</td>
      </tr>
    `;
  });
}

/* =====================================================
   ❌ ERROR STATE
   ===================================================== */

function renderError() {
  const body = document.getElementById("reconBody");

  if (body) {
    body.innerHTML = `<tr><td colspan="6">Error loading data</td></tr>`;
  }
}

/* =====================================================
   🔧 HELPERS
   ===================================================== */

function set(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function formatCurrency(value) {
  if (!value) return "0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(value);
}

function formatDate(ts) {
  if (!ts) return "-";

  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString();
  } catch {
    return "-";
  }
}