/* =====================================================
Agile AI University
Credential Registry Controller
Version: 1.1.0
Status: Live Registry Integration
Scope: Read-Only Registry UI

Data Source:
Cloud Run Credential Registry API

Cost Impact:

* No new infrastructure
* Uses existing Cloud Run service
* Uses existing Firestore collection
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
Registry Dataset
===================================================== */

let credentialData = [];

const REGISTRY_API =
"https://aau-credential-verify-458881040066.asia-south1.run.app/admin/credential-registry";

/* =====================================================
Initial Load
===================================================== */

async function loadRegistry() {

try {

  showLoading();

  const response = await fetch(
    REGISTRY_API,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  const data = await response.json();

  if (
    data.status !== "success" ||
    !Array.isArray(data.credentials)
  ) {
    throw new Error("Invalid registry response");
  }

  credentialData = data.credentials;

    console.log(
    "Registry Loaded:",
    credentialData.length
    );

    console.log(
    "Sample Credential Record:",
    credentialData[0]
    );

    console.log(
    "Rendering Records:",
    credentialData
    );

    renderResults(credentialData);

} catch (error) {

  console.error(
    "Registry Load Error:",
    error
  );

  tableBody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align:center;">
        Failed to load credential registry.
      </td>
    </tr>
  `;
}


}

/* =====================================================
Search
===================================================== */

function performSearch() {

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

const results = credentialData.filter(item => {

  const credentialMatch =
    !credentialId ||
    (item.credential_id || "")
      .toLowerCase()
      .includes(credentialId);

  const nameMatch =
    !name ||
    (item.full_name || "")
      .toLowerCase()
      .includes(name);

  const emailMatch =
    !email ||
    (item.email || "")
      .toLowerCase()
      .includes(email);

  const programMatch =
    !program ||
    item.program_code === program;

  const statusMatch =
    !status ||
    (item.issued_status || "")
      .toLowerCase() ===
    status.toLowerCase();

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

if (!records || records.length === 0) {

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
    <td>${record.credential_id || "-"}</td>
    <td>${record.full_name || "-"}</td>
    <td>${record.email || "-"}</td>
    <td>${record.program_code || "-"}</td>
    <td>-</td>
    <td>${record.issued_status || "-"}</td>
    <td>
      <button
        class="btn btn-secondary"
        disabled>
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

if (credentialIdInput)
  credentialIdInput.value = "";

if (nameInput)
  nameInput.value = "";

if (emailInput)
  emailInput.value = "";

if (programInput)
  programInput.selectedIndex = 0;

if (statusInput)
  statusInput.selectedIndex = 0;

renderResults(credentialData);

}

/* =====================================================
Event Wiring
===================================================== */

searchBtn?.addEventListener(
"click",
performSearch
);

resetBtn?.addEventListener(
"click",
resetFilters
);

loadRegistry();

console.log(
"Credential Registry Controller v1.1.0 loaded"
);

});
