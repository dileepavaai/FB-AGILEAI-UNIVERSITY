/* =====================================================
   Agile AI University
   Credential Registry Controller
   Version: 1.0
   Status: UI Wiring Layer
   Scope: Frontend Only (No Backend Calls)
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const searchBtn = document.getElementById("searchBtn");
    const resetBtn = document.getElementById("resetBtn");

    const credentialIdInput =
    document.getElementById("searchCredentialId");

    const nameInput =
    document.getElementById("searchName");

    const emailInput =
    document.getElementById("searchEmail");

    const programInput =
    document.getElementById("searchProgram");

    const statusInput =
    document.getElementById("searchStatus");

    const tableBody =
    document.getElementById("credentialRegistryBody");

  /* =====================================================
     Mock Dataset
     Replace later with API response
  ===================================================== */

  const mockCredentials = [
    {
      credential_id: "AAU-AOP-000001",
      full_name: "John Smith",
      email: "john@example.com",
      program_code: "AOP",
      issue_date: "2026-01-15",
      status: "Issued"
    },
    {
      credential_id: "AAU-AIPA-000002",
      full_name: "Mary Johnson",
      email: "mary@example.com",
      program_code: "AIPA",
      issue_date: "2026-02-10",
      status: "Issued"
    }
  ];

  /* =====================================================
     Search
  ===================================================== */

  async function performSearch() {

    showLoading();

    await new Promise(resolve => setTimeout(resolve, 500));

    const credentialId =
      credentialIdInput?.value.trim().toLowerCase() || "";

    const name =
      nameInput?.value.trim().toLowerCase() || "";

    const email =
      emailInput?.value.trim().toLowerCase() || "";

    const program =
      programInput?.value || "";

    const status =
      statusInput?.value || "";

    const results = mockCredentials.filter(item => {

      const credentialMatch =
        !credentialId ||
        item.credential_id.toLowerCase().includes(credentialId);

      const nameMatch =
        !name ||
        item.full_name.toLowerCase().includes(name);

      const emailMatch =
        !email ||
        item.email.toLowerCase().includes(email);

      const programMatch =
        !program ||
        program === "ALL" ||
        item.program_code === program;

      const statusMatch =
        !status ||
        status === "ALL" ||
        item.status === status;

      return (
        credentialMatch &&
        nameMatch &&
        emailMatch &&
        programMatch &&
        statusMatch
      );
    });

    renderResults(results);
  }

  /* =====================================================
     Render Results
  ===================================================== */

  function renderResults(records) {

    if (!tableBody) return;

    if (records.length === 0) {

      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;">
            No records found.
          </td>
        </tr>
      `;

      return;
    }

    tableBody.innerHTML = records.map(record => `
      <tr>
        <td>${record.credential_id}</td>
        <td>${record.full_name}</td>
        <td>${record.email}</td>
        <td>${record.program_code}</td>
        <td>${record.issue_date}</td>
        <td>${record.status}</td>
        <td>
          <button class="btn btn-secondary" disabled>
            View
          </button>
        </td>
      </tr>
    `).join("");
  }

  /* =====================================================
     Loading State
  ===================================================== */

  function showLoading() {

    if (!tableBody) return;

    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">
          Loading...
        </td>
      </tr>
    `;
  }

  /* =====================================================
     Reset
  ===================================================== */

  function resetFilters() {

    if (credentialIdInput) credentialIdInput.value = "";
    if (nameInput) nameInput.value = "";
    if (emailInput) emailInput.value = "";

    if (programInput) programInput.selectedIndex = 0;
    if (statusInput) statusInput.selectedIndex = 0;

    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">
          No records loaded.
        </td>
      </tr>
    `;
  }

  /* =====================================================
     Event Wiring
  ===================================================== */

  searchBtn?.addEventListener("click", performSearch);
  resetBtn?.addEventListener("click", resetFilters);

  console.log(
    "Credential Registry Controller v1.0 loaded"
  );

});