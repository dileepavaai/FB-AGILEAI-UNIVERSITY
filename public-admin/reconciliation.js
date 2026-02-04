/* =========================================================
   Admin Reconciliation – Read-Only (ENHANCED)
   Advisory Insights vs Programs

   Enhancements:
   - Summary panel (Phase 1)
   - Deterministic sorting indicator
   - View-only filters (Phase 2)
   - CSV & PDF export (Phase 2)

   Governance:
   - Read-only
   - Firestore remains authority
   - What-you-see = what-you-export
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------------------------------------
     Tabs (UNCHANGED)
  ------------------------------------------------------ */
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });

  /* ------------------------------------------------------
     Firestore (UNCHANGED QUERY)
  ------------------------------------------------------ */
  const db = firebase.firestore();
  const tableBody = document.getElementById("advisoryRows");

  // In-memory canonical dataset (view source of truth)
  let records = [];

  db.collection("advisory_entitlements")
    .orderBy("audit.created_at", "desc")
    .limit(100)
    .get()
    .then(snapshot => {

      if (snapshot.empty) {
        tableBody.innerHTML =
          `<tr><td colspan="7" class="muted">No records found</td></tr>`;
        updateSummary([]);
        return;
      }

      records = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          orderId: d.payment?.order_id || "-",
          paymentId: d.payment?.payment_id || "-",
          email: d.buyer?.email || "-",
          artifact: d.artifact_code || "-",
          amount: (d.payment?.amount || 0) / 100,
          currency: d.payment?.currency || "-",
          status: (d.access?.status || "").toLowerCase(),
          issuedAt: d.access?.issued_at?.toDate?.() || null,
          issuedAtLabel: d.access?.issued_at?.toDate?.().toLocaleString() || "-"
        };
      });

      renderTable(records);
      updateSummary(records);
    })
    .catch(err => {
      tableBody.innerHTML =
        `<tr><td colspan="7" class="muted">Failed to load data</td></tr>`;
      console.error(err);
    });

  /* ------------------------------------------------------
     Rendering (TABLE)
  ------------------------------------------------------ */
  function renderTable(data) {
    tableBody.innerHTML = "";

    if (!data.length) {
      tableBody.innerHTML =
        `<tr><td colspan="7" class="muted">No records match filters</td></tr>`;
      return;
    }

    data.forEach(r => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${r.orderId}</td>
        <td>${r.paymentId}</td>
        <td>${r.email}</td>
        <td>${r.artifact}</td>
        <td>${r.amount.toFixed(2)}</td>
        <td>${renderStatus(r.status)}</td>
        <td>${r.issuedAtLabel}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  function renderStatus(status) {
    if (status === "captured") return `<span style="color:#16a34a;font-weight:600">CAPTURED</span>`;
    if (status === "failed") return `<span style="color:#dc2626;font-weight:600">FAILED</span>`;
    if (status === "refunded") return `<span style="color:#f59e0b;font-weight:600">REFUNDED</span>`;
    return status || "-";
  }

  /* ------------------------------------------------------
     Phase 1 — Summary Panel
  ------------------------------------------------------ */
  function updateSummary(data) {
    const totalCount = data.length;

    const totalAmount = data
      .filter(r => r.status === "captured")
      .reduce((sum, r) => sum + r.amount, 0);

    const failedAmount = data
      .filter(r => r.status !== "captured")
      .reduce((sum, r) => sum + r.amount, 0);

    const currencies = [...new Set(data.map(r => r.currency).filter(Boolean))];

    const dates = data
      .map(r => r.issuedAt)
      .filter(Boolean)
      .sort((a, b) => a - b);

    document.getElementById("summary-total-count").textContent = totalCount;
    document.getElementById("summary-total-amount").textContent =
      totalAmount ? totalAmount.toFixed(2) : "—";
    document.getElementById("summary-failed-amount").textContent =
      failedAmount ? failedAmount.toFixed(2) : "—";
    document.getElementById("summary-currency").textContent =
      currencies.join(", ") || "—";

    if (dates.length) {
      document.getElementById("summary-date-range").textContent =
        `${dates[0].toLocaleDateString()} – ${dates[dates.length - 1].toLocaleDateString()}`;
    } else {
      document.getElementById("summary-date-range").textContent = "—";
    }
  }

  /* ------------------------------------------------------
     Phase 2 — Filters (VIEW ONLY)
  ------------------------------------------------------ */
  const statusFilter = document.getElementById("filter-status");
  const currencyFilter = document.getElementById("filter-currency");
  const fromFilter = document.getElementById("filter-from");
  const toFilter = document.getElementById("filter-to");

  [statusFilter, currencyFilter, fromFilter, toFilter].forEach(el => {
    if (el) el.addEventListener("change", applyFilters);
  });

  function applyFilters() {
    let filtered = [...records];

    if (statusFilter?.value) {
      filtered = filtered.filter(r => r.status === statusFilter.value);
    }

    if (currencyFilter?.value) {
      filtered = filtered.filter(r => r.currency === currencyFilter.value);
    }

    if (fromFilter?.value) {
      const fromDate = new Date(fromFilter.value);
      filtered = filtered.filter(r => r.issuedAt && r.issuedAt >= fromDate);
    }

    if (toFilter?.value) {
      const toDate = new Date(toFilter.value);
      filtered = filtered.filter(r => r.issuedAt && r.issuedAt <= toDate);
    }

    renderTable(filtered);
    updateSummary(filtered);
    currentView = filtered;
  }

  /* ------------------------------------------------------
     Phase 2 — Export (WHAT YOU SEE = WHAT YOU EXPORT)
  ------------------------------------------------------ */
  let currentView = [];

  const csvBtn = document.getElementById("exportCsvBtn");
  const pdfBtn = document.getElementById("exportPdfBtn");

  if (csvBtn) {
    csvBtn.addEventListener("click", () => exportCSV(currentView));
  }

  if (pdfBtn) {
    pdfBtn.addEventListener("click", () => window.print());
  }

  function exportCSV(data) {
    if (!data.length) return;

    const header = [
      "Order ID",
      "Payment ID",
      "Email",
      "Artifact",
      "Amount",
      "Currency",
      "Status",
      "Captured At"
    ];

    const rows = data.map(r => [
      r.orderId,
      r.paymentId,
      r.email,
      r.artifact,
      r.amount.toFixed(2),
      r.currency,
      r.status.toUpperCase(),
      r.issuedAtLabel
    ]);

    const csv =
      [header, ...rows]
        .map(row => row.map(v => `"${v}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `reconciliation-${new Date().toISOString()}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

});
