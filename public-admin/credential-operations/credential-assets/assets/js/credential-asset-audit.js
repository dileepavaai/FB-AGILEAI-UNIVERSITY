/* =========================================================
   Agile AI University
   Credential Asset Audit Controller
   ---------------------------------------------------------
   Version: 1.0.0
   Status: IMPLEMENTATION

   PURPOSE
   ---------------------------------------------------------
   Read-only operational audit of credential asset readiness.

   AUTHORITIES
   ---------------------------------------------------------
   credentials
     → credential metadata authority

   credential_assets
     → published credential asset registry

   AUDIT COMPLETENESS
   ---------------------------------------------------------
   Required:
   - university_certificate
   - trainer_certificate
   - digital_badge

   GOVERNANCE
   ---------------------------------------------------------
   - READ ONLY
   - No credential mutation
   - No asset generation
   - No asset publication
   - No learner mutation
   - No entitlement mutation
========================================================= */

import {
  db
} from "../../../assets/js/core.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  initAdminApp
} from "../../../assets/js/admin-app.js";

import {
  loadAdminSidebar
} from "../../../shared/design-authority/js/admin-sidebar.js";


/* =========================================================
   CONFIGURATION
========================================================= */

const REQUIRED_ASSET_TYPES = Object.freeze([
  "university_certificate",
  "trainer_certificate",
  "digital_badge"
]);


/* =========================================================
   STATE
========================================================= */

const auditState = {

  credentials: [],

  assets: [],

  rows: [],

  filteredRows: []

};


/* =========================================================
   DOM REFERENCES
========================================================= */

let tableBody = null;

let statusMessage = null;

let totalCredentialsElement = null;

let completeCredentialsElement = null;

let incompleteCredentialsElement = null;

let ownershipPendingElement = null;

let searchInput = null;

let programFilter = null;

let statusFilter = null;

let ownershipFilter = null;

let refreshButton = null;

let clearFiltersButton = null;


/* =========================================================
   NORMALIZATION
========================================================= */

function normalizeString(
  value
) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(
    value
  ).trim();

}


function normalizeLower(
  value
) {

  return normalizeString(
    value
  ).toLowerCase();

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHtml(
  value
) {

  const text =
    normalizeString(
      value
    );

  return text
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );

}


/* =========================================================
   ASSET TYPE NORMALIZATION

   This allows the audit to tolerate historical naming
   differences without changing stored records.
========================================================= */

function normalizeAssetType(
  value
) {

  const type =
    normalizeLower(
      value
    )
      .replaceAll(
        "-",
        "_"
      )
      .replaceAll(
        " ",
        "_"
      );

  const aliases = {

    certificate:
      "university_certificate",

    universitycertificate:
      "university_certificate",

    university_certificate:
      "university_certificate",

    trainercertificate:
      "trainer_certificate",

    trainer_certificate:
      "trainer_certificate",

    badge:
      "digital_badge",

    digitalbadge:
      "digital_badge",

    digital_badge:
      "digital_badge"

  };

  return aliases[type] || type;

}


/* =========================================================
   PUBLISHED ASSET RESOLUTION
========================================================= */

function isPublishedAsset(
  asset
) {

  if (!asset) {
    return false;
  }

  const status =
    normalizeLower(
      asset.status
    );

  const publishedFlag =
    asset.published === true;

  const latestFlag =
    asset.is_latest;

  /*
   * Support both the governed status field and
   * historical published boolean where present.
   */

  const published =
    status === "published" ||
    publishedFlag;

  /*
   * If is_latest does not exist on a historical record,
   * do not automatically reject it.
   */

  const latest =
    latestFlag === undefined ||
    latestFlag === null ||
    latestFlag === true;

  return (
    published &&
    latest
  );

}


/* =========================================================
   CREDENTIAL ID RESOLUTION
========================================================= */

function getCredentialId(
  credential
) {

  return normalizeString(
    credential?.credential_id ||
    credential?.credentialId ||
    credential?.id
  );

}


function getAssetCredentialId(
  asset
) {

  return normalizeString(
    asset?.credential_id ||
    asset?.credentialId
  );

}


/* =========================================================
   OWNERSHIP RESOLUTION
========================================================= */

function resolveOwnership(
  credential,
  credentialAssets
) {

  const credentialLearnerUid =
    normalizeString(
      credential?.learner_uid ||
      credential?.learnerUid
    );

  if (
    credentialLearnerUid
  ) {

    return {
      status: "linked",
      label: "Learner Linked"
    };

  }

  const assetWithLearner =
    credentialAssets.find(
      asset =>
        normalizeString(
          asset?.learner_uid ||
          asset?.learnerUid
        )
    );

  if (
    assetWithLearner
  ) {

    return {
      status: "linked",
      label: "Learner Linked"
    };

  }

  return {
    status: "pending",
    label: "Activation Pending"
  };

}


/* =========================================================
   ASSET PRESENCE RESOLUTION
========================================================= */

function resolveRequiredAsset(
  credentialAssets,
  requiredType
) {

  return credentialAssets.find(
    asset => {

      const assetType =
        normalizeAssetType(
          asset?.asset_type ||
          asset?.assetType ||
          asset?.type
        );

      return (
        assetType === requiredType &&
        isPublishedAsset(
          asset
        )
      );

    }
  ) || null;

}


/* =========================================================
   BUILD AUDIT ROW
========================================================= */

function buildAuditRow(
  credential
) {

  const credentialId =
    getCredentialId(
      credential
    );

  const credentialAssets =
    auditState.assets.filter(
      asset =>
        getAssetCredentialId(
          asset
        ) === credentialId
    );

  const universityCertificate =
    resolveRequiredAsset(
      credentialAssets,
      "university_certificate"
    );

  const trainerCertificate =
    resolveRequiredAsset(
      credentialAssets,
      "trainer_certificate"
    );

  const digitalBadge =
    resolveRequiredAsset(
      credentialAssets,
      "digital_badge"
    );

  const ownership =
    resolveOwnership(
      credential,
      credentialAssets
    );

  const requiredAssets = {

    university_certificate:
      universityCertificate,

    trainer_certificate:
      trainerCertificate,

    digital_badge:
      digitalBadge

  };

  const missingAssets =
    REQUIRED_ASSET_TYPES.filter(
      type =>
        !requiredAssets[type]
    );

  const complete =
    missingAssets.length === 0;

  return {

    credentialId,

    learnerName:
      normalizeString(
        credential?.full_name ||
        credential?.learner_name ||
        credential?.learnerName
      ),

    email:
      normalizeString(
        credential?.email
      ),

    programCode:
      normalizeString(
        credential?.program_code ||
        credential?.programCode ||
        credential?.credential_type
      ),

    credential,

    credentialAssets,

    universityCertificate,

    trainerCertificate,

    digitalBadge,

    ownership,

    missingAssets,

    complete

  };

}


/* =========================================================
   BUILD AUDIT
========================================================= */

function buildAuditRows() {

  auditState.rows =
    auditState.credentials
      .map(
        credential =>
          buildAuditRow(
            credential
          )
      )
      .filter(
        row =>
          row.credentialId
      );

}


/* =========================================================
   FIRESTORE READ
========================================================= */

async function loadCredentials() {

  const snapshot =
    await getDocs(
      collection(
        db,
        "credentials"
      )
    );

  auditState.credentials =
    snapshot.docs.map(
      docSnap => ({
        id:
          docSnap.id,

        ...docSnap.data()
      })
    );

}


async function loadCredentialAssets() {

  const snapshot =
    await getDocs(
      collection(
        db,
        "credential_assets"
      )
    );

  auditState.assets =
    snapshot.docs.map(
      docSnap => ({
        id:
          docSnap.id,

        ...docSnap.data()
      })
    );

}


/* =========================================================
   STATUS DISPLAY
========================================================= */

function setStatus(
  message
) {

  if (
    !statusMessage
  ) {
    return;
  }

  statusMessage.textContent =
    message;

}


/* =========================================================
   ASSET DISPLAY
========================================================= */

function renderAssetStatus(
  asset
) {

  if (
    asset
  ) {

    return `
      <span
        title="Published asset available">
        ✓ Published
      </span>
    `;

  }

  return `
    <span
      title="Required published asset not found">
      — Missing
    </span>
  `;

}


/* =========================================================
   OWNERSHIP DISPLAY
========================================================= */

function renderOwnership(
  ownership
) {

  if (
    ownership.status === "linked"
  ) {

    return `
      <span>
        ✓ ${escapeHtml(
          ownership.label
        )}
      </span>
    `;

  }

  return `
    <span>
      — ${escapeHtml(
        ownership.label
      )}
    </span>
  `;

}


/* =========================================================
   OVERALL DISPLAY
========================================================= */

function renderOverallStatus(
  row
) {

  if (
    row.complete
  ) {

    return `
      <strong>
        COMPLETE
      </strong>
    `;

  }

  return `
    <strong>
      ACTION REQUIRED
    </strong>
  `;

}


/* =========================================================
   TABLE RENDERING
========================================================= */

function renderTable() {

  if (
    !tableBody
  ) {
    return;
  }

  tableBody.innerHTML = "";

  if (
    auditState.filteredRows.length === 0
  ) {

    tableBody.innerHTML = `
      <tr>
        <td colspan="8">
          No credentials match the current audit filters.
        </td>
      </tr>
    `;

    return;

  }

  const fragment =
    document.createDocumentFragment();

  auditState.filteredRows.forEach(
    row => {

      const tr =
        document.createElement(
          "tr"
        );

      tr.innerHTML = `

        <td>
          ${escapeHtml(
            row.credentialId
          )}
        </td>

        <td>

          <div>
            ${escapeHtml(
              row.learnerName || "-"
            )}
          </div>

          <div class="card-subtitle">
            ${escapeHtml(
              row.email || "-"
            )}
          </div>

        </td>

        <td>
          ${escapeHtml(
            row.programCode || "-"
          )}
        </td>

        <td>
          ${renderAssetStatus(
            row.universityCertificate
          )}
        </td>

        <td>
          ${renderAssetStatus(
            row.trainerCertificate
          )}
        </td>

        <td>
          ${renderAssetStatus(
            row.digitalBadge
          )}
        </td>

        <td>
          ${renderOwnership(
            row.ownership
          )}
        </td>

        <td>
          ${renderOverallStatus(
            row
          )}
        </td>

      `;

      fragment.appendChild(
        tr
      );

    }
  );

  tableBody.appendChild(
    fragment
  );

}


/* =========================================================
   SUMMARY
========================================================= */

function renderSummary() {

  const total =
    auditState.rows.length;

  const complete =
    auditState.rows.filter(
      row =>
        row.complete
    ).length;

  const incomplete =
    total -
    complete;

  const ownershipPending =
    auditState.rows.filter(
      row =>
        row.ownership.status ===
        "pending"
    ).length;

  if (
    totalCredentialsElement
  ) {

    totalCredentialsElement.textContent =
      String(
        total
      );

  }

  if (
    completeCredentialsElement
  ) {

    completeCredentialsElement.textContent =
      String(
        complete
      );

  }

  if (
    incompleteCredentialsElement
  ) {

    incompleteCredentialsElement.textContent =
      String(
        incomplete
      );

  }

  if (
    ownershipPendingElement
  ) {

    ownershipPendingElement.textContent =
      String(
        ownershipPending
      );

  }

}


/* =========================================================
   PROGRAM FILTER
========================================================= */

function populateProgramFilter() {

  if (
    !programFilter
  ) {
    return;
  }

  const currentValue =
    programFilter.value;

  const programs =
    [
      ...new Set(
        auditState.rows
          .map(
            row =>
              row.programCode
          )
          .filter(
            Boolean
          )
      )
    ]
      .sort(
        (
          a,
          b
        ) =>
          a.localeCompare(
            b
          )
      );

  programFilter.innerHTML = `
    <option value="">
      All Programs
    </option>
  `;

  programs.forEach(
    program => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        program;

      option.textContent =
        program;

      programFilter.appendChild(
        option
      );

    }
  );

  if (
    programs.includes(
      currentValue
    )
  ) {

    programFilter.value =
      currentValue;

  }

}


/* =========================================================
   FILTERING
========================================================= */

function applyFilters() {

  const search =
    normalizeLower(
      searchInput?.value
    );

  const selectedProgram =
    normalizeString(
      programFilter?.value
    );

  const selectedStatus =
    normalizeString(
      statusFilter?.value
    );

  const selectedOwnership =
    normalizeString(
      ownershipFilter?.value
    );

  auditState.filteredRows =
    auditState.rows.filter(
      row => {

        const searchable =
          normalizeLower(
            [
              row.credentialId,
              row.learnerName,
              row.email,
              row.programCode
            ].join(
              " "
            )
          );

        if (
          search &&
          !searchable.includes(
            search
          )
        ) {
          return false;
        }

        if (
          selectedProgram &&
          row.programCode !==
            selectedProgram
        ) {
          return false;
        }

        if (
          selectedStatus ===
            "complete" &&
          !row.complete
        ) {
          return false;
        }

        if (
          selectedStatus ===
            "incomplete" &&
          row.complete
        ) {
          return false;
        }

        if (
          selectedOwnership &&
          row.ownership.status !==
            selectedOwnership
        ) {
          return false;
        }

        return true;

      }
    );

  renderTable();

  setStatus(
    `Showing ${auditState.filteredRows.length} of ${auditState.rows.length} credentials.`
  );

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearFilters() {

  if (
    searchInput
  ) {
    searchInput.value = "";
  }

  if (
    programFilter
  ) {
    programFilter.value = "";
  }

  if (
    statusFilter
  ) {
    statusFilter.value = "";
  }

  if (
    ownershipFilter
  ) {
    ownershipFilter.value = "";
  }

  applyFilters();

}


/* =========================================================
   AUDIT LOAD
========================================================= */

async function loadAudit() {

  setStatus(
    "Loading credential registry and published assets..."
  );

  if (
    refreshButton
  ) {
    refreshButton.disabled =
      true;
  }

  try {

    await Promise.all([
      loadCredentials(),
      loadCredentialAssets()
    ]);

    console.log(
      "[CredentialAssetAudit] Credentials loaded:",
      auditState.credentials.length
    );

    console.log(
      "[CredentialAssetAudit] Assets loaded:",
      auditState.assets.length
    );

    buildAuditRows();

    console.log(
      "[CredentialAssetAudit] Audit rows:",
      auditState.rows.length
    );

    populateProgramFilter();

    renderSummary();

    applyFilters();

  } catch (
    error
  ) {

    console.error(
      "[CredentialAssetAudit] Audit failed:",
      error
    );

    setStatus(
      "Unable to load the credential asset audit. Check the browser console for details."
    );

    if (
      tableBody
    ) {

      tableBody.innerHTML = `
        <tr>
          <td colspan="8">
            Credential asset audit could not be loaded.
          </td>
        </tr>
      `;

    }

  } finally {

    if (
      refreshButton
    ) {
      refreshButton.disabled =
        false;
    }

  }

}


/* =========================================================
   EVENT BINDING
========================================================= */

function bindEvents() {

  searchInput?.addEventListener(
    "input",
    applyFilters
  );

  programFilter?.addEventListener(
    "change",
    applyFilters
  );

  statusFilter?.addEventListener(
    "change",
    applyFilters
  );

  ownershipFilter?.addEventListener(
    "change",
    applyFilters
  );

  refreshButton?.addEventListener(
    "click",
    loadAudit
  );

  clearFiltersButton?.addEventListener(
    "click",
    clearFilters
  );

}


/* =========================================================
   DOM INITIALIZATION
========================================================= */

function resolveDom() {

  tableBody =
    document.getElementById(
      "credentialAssetAuditTableBody"
    );

  statusMessage =
    document.getElementById(
      "auditStatusMessage"
    );

  totalCredentialsElement =
    document.getElementById(
      "auditTotalCredentials"
    );

  completeCredentialsElement =
    document.getElementById(
      "auditCompleteCredentials"
    );

  incompleteCredentialsElement =
    document.getElementById(
      "auditIncompleteCredentials"
    );

  ownershipPendingElement =
    document.getElementById(
      "auditOwnershipPending"
    );

  searchInput =
    document.getElementById(
      "auditSearch"
    );

  programFilter =
    document.getElementById(
      "auditProgramFilter"
    );

  statusFilter =
    document.getElementById(
      "auditStatusFilter"
    );

  ownershipFilter =
    document.getElementById(
      "auditOwnershipFilter"
    );

    refreshButton =
    document.getElementById(
      "auditRefreshButton"
    );

  clearFiltersButton =
    document.getElementById(
      "auditClearFiltersButton"
    );

}


/* =========================================================
   APPLICATION INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    console.log(
      "[CredentialAssetAudit] Initializing..."
    );

    /*
     * Resolve page DOM first.
     */
    resolveDom();

    /*
     * Load governed admin navigation.
     */
    loadAdminSidebar(
      "credential-operations"
    );

    /*
     * Initialize shared admin authentication,
     * shell and authorization behaviour.
     */
    await initAdminApp();

    /*
     * Bind audit UI controls.
     */
    bindEvents();

    /*
     * Load audit data.
     */
    await loadAudit();

    console.log(
      "[CredentialAssetAudit] Initialized."
    );

  }
);