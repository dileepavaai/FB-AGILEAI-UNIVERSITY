/* =====================================================
   🔷 AUDIT LOGS — ADMIN VIEWER (RBAC + FILTERS + EXPORT)
   -----------------------------------------------------
   Version: v2.0.0 (Production Safe)
   Date: 2026-03-30
===================================================== */

import { auth, getUserRole } from "./core.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

/* =====================================================
   🔐 AUTH + RBAC
===================================================== */

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  const role = await getUserRole(user.uid, user.email);

  // 🔴 STRICT ADMIN ONLY
  if (!role || role === "trainer") {
    alert("Access denied.");
    window.location.href = "/index.html";
    return;
  }

  await loadLogs();
});


/* =====================================================
   📦 LOAD LOGS
===================================================== */

let allLogs = [];

async function loadLogs() {

  const table = document.getElementById("auditTable");

  const snap = await getDocs(
    query(
      collection(db, "learner_status_logs"),
      orderBy("updated_at", "desc")
    )
  );

  table.innerHTML = "";

  if (snap.empty) {
    table.innerHTML = `<tr><td colspan="6">No logs found</td></tr>`;
    return;
  }

  allLogs = [];

  snap.forEach(d => {
    const data = d.data();
    allLogs.push(data);
  });

  renderTable(allLogs);
}


/* =====================================================
   🎯 RENDER TABLE
===================================================== */

function renderTable(logs) {

  const table = document.getElementById("auditTable");
  table.innerHTML = "";

  logs.forEach(l => {

    const timestamp = l.updated_at?.seconds
      ? new Date(l.updated_at.seconds * 1000)
      : new Date();

    table.innerHTML += `
      <tr>
        <td>${l.learner_name || "-"}</td>
        <td>${l.learner_email || "-"}</td>
        <td>${l.previous_status || "-"}</td>
        <td>${l.new_status || "-"}</td>
        <td>${l.updated_by || "-"}</td>
        <td>${timestamp.toLocaleString()}</td>
      </tr>
    `;
  });
}


/* =====================================================
   🔍 FILTERS
===================================================== */

window.applyAuditFilters = function () {

  const status = document.getElementById("filter-status")?.value || "";
  const email = document.getElementById("filter-email")?.value.toLowerCase() || "";

  let filtered = [...allLogs];

  if (status) {
    filtered = filtered.filter(l => l.new_status === status);
  }

  if (email) {
    filtered = filtered.filter(l =>
      (l.learner_email || "").toLowerCase().includes(email)
    );
  }

  renderTable(filtered);
};


/* =====================================================
   📤 EXPORT CSV
===================================================== */

window.exportAuditCSV = function () {

  if (!allLogs.length) {
    alert("No data to export");
    return;
  }

  const rows = [
    ["Name", "Email", "Previous", "New", "Updated By", "Timestamp"]
  ];

  allLogs.forEach(l => {

    const timestamp = l.updated_at?.seconds
      ? new Date(l.updated_at.seconds * 1000).toLocaleString()
      : "";

    rows.push([
      l.learner_name || "",
      l.learner_email || "",
      l.previous_status || "",
      l.new_status || "",
      l.updated_by || "",
      timestamp
    ]);
  });

  const csvContent =
    "data:text/csv;charset=utf-8," +
    rows.map(r => r.join(",")).join("\n");

  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "audit_logs.csv");

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};