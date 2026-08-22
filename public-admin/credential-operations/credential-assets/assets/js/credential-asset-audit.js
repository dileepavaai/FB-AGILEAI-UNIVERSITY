/* =========================================================
   Agile AI University
   Credential Operations Suite

   File      : credential-asset-audit.js
   Component : Credential Asset Audit Controller
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Credential Asset Readiness Intelligence

   Purpose
   ----------------------------------------------------------
   • Provide a governed read-only audit of credential assets
   • Compare credential records with published asset records
   • Identify complete and incomplete credential portfolios
   • Identify learner ownership and activation readiness
   • Support operational filtering and sorting
   • Surface remediation priorities without mutating data

   Responsibilities
   ----------------------------------------------------------
   ✓ Load authoritative credential records
   ✓ Load published credential asset records
   ✓ Resolve required credential assets
   ✓ Resolve learner ownership state
   ✓ Calculate credential asset completeness
   ✓ Populate audit summary metrics
   ✓ Filter audit records
   ✓ Sort audit records
   ✓ Render credential asset readiness
   ✓ Support operational refresh
   ✓ Support clear-filter reset

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Generate credential binaries
   ✗ Upload credential assets
   ✗ Publish credential assets
   ✗ Modify credential records
   ✗ Modify credential_assets records
   ✗ Assign learner ownership
   ✗ Perform identity reconciliation
   ✗ Grant learner entitlements
   ✗ Modify programme or batch records

   Governance
   ----------------------------------------------------------
   • credentials is the credential metadata authority
   • credential_assets is the published asset registry
   • Cloud Storage remains the binary asset authority
   • credential_id is the permanent asset correlation key
   • Audit operations are read-only
   • Audit sorting operates only on the rendered audit view
   • Sorting must never mutate authoritative Firestore data
   • Filtering must never mutate authoritative Firestore data
   • Asset completeness requires all governed required assets
   • Recognition Asset is not currently required for
     alumni asset-completeness calculation
   • Historical credentials may not yet have learner_uid
   • Ownership readiness is independent of asset completeness

   Required Asset Types
   ----------------------------------------------------------
   • university_certificate
   • trainer_certificate
   • digital_badge

   Operational Default
   ----------------------------------------------------------
   Sort:
   • Action Required First

   Rationale:
   • Credential Asset Audit is an operational remediation
     surface.
   • Incomplete credential portfolios therefore receive
     priority in the default view.
   • Completed portfolios remain available through sorting
     and filtering without obscuring unresolved work.

   Data Sources
   ----------------------------------------------------------
   • credentials
   • credential_assets

   Architecture
   ----------------------------------------------------------
   Admin
     ↓
   Credential Operations
     ↓
   Credential Asset Audit
     ↓
   credentials + credential_assets
     ↓
   Audit Resolver
     ↓
   Filter + Sort
     ↓
   Readiness Surface

   Change History
   ----------------------------------------------------------
   v1.1.0
   • Added governed audit sorting architecture
   • Added Action Required First operational default
   • Added Complete First sorting
   • Added Learner Name A–Z sorting
   • Added Learner Name Z–A sorting
   • Added Credential ID A–Z sorting
   • Added Program A–Z sorting
   • Added Ownership Pending First sorting
   • Added dedicated sort-control DOM authority
   • Prepared sort-control event binding
   • Preserved existing credential filtering
   • Preserved credential asset completeness calculation
   • Preserved learner ownership resolution
   • Preserved read-only audit governance
   • No Firestore writes introduced
   • No credential mutation introduced
   • No asset publication introduced

   v1.0.1
   • Corrected Firebase module resolution paths
   • Restored complete application initialization
   • Preserved read-only credential asset audit behaviour

   v1.0.0
   • Introduced Credential Asset Audit
   • Added credential registry loading
   • Added credential_assets registry loading
   • Added required asset resolution
   • Added credential completeness calculation
   • Added ownership-state resolution
   • Added search filtering
   • Added programme filtering
   • Added asset-status filtering
   • Added ownership filtering
   • Added audit summary metrics
   • Added credential readiness table

========================================================= */

import {
  db
} from "../../../../assets/js/core.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  initAdminApp
} from "../../../../assets/js/admin-app.js";

import {
  loadAdminSidebar
} from "../../../../shared/design-authority/js/admin-sidebar.js";


/* =========================================================
   MODULE CONSTANTS
========================================================= */

const MODULE_NAME =
  "CredentialAssetAudit";

const MODULE_VERSION =
  "1.1.0";


/* =========================================================
   REQUIRED ASSET GOVERNANCE
========================================================= */

const REQUIRED_ASSET_TYPES =
  Object.freeze([

    "university_certificate",

    "trainer_certificate",

    "digital_badge"

  ]);


/* =========================================================
   SORT GOVERNANCE
========================================================= */

const DEFAULT_SORT_MODE =
  "action-first";

const SORT_MODES =
  Object.freeze({

    ACTION_FIRST:
      "action-first",

    COMPLETE_FIRST:
      "complete-first",

    NAME_ASC:
      "name-asc",

    NAME_DESC:
      "name-desc",

    CREDENTIAL_ASC:
      "credential-asc",

    PROGRAM_ASC:
      "program-asc",

    OWNERSHIP_PENDING_FIRST:
      "ownership-pending-first"

  });


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

let sortFilter = null;

let refreshButton = null;

let clearFiltersButton = null;

/* =========================================================
   AUDIT FOUNDATION + DATA RESOLUTION
   Version: 1.2.0
   Status : ACTIVE

   Purpose
   ----------------------------------------------------------
   Restores the governed Credential Asset Audit foundation
   responsible for:

   • Data normalization
   • Credential identity resolution
   • Credential asset type normalization
   • Published asset validation
   • Learner ownership resolution
   • Required asset resolution
   • Credential audit-row construction
   • Firestore read operations
   • Summary generation
   • Programme-filter population
   • Audit-load orchestration

   Architecture
   ----------------------------------------------------------
   credentials
       +
   credential_assets
       ↓
   Asset Resolution
       ↓
   Credential Audit Row
       ↓
   auditState.rows
       ↓
   Filter + Sort
       ↓
   Readiness Surface

   Governance
   ----------------------------------------------------------
   • Read-only
   • No Firestore writes
   • No credential mutation
   • No credential asset mutation
   • No ownership mutation
   • credential_id remains the permanent correlation key
   • Existing credential and credential_assets authorities
     remain unchanged
   • Historical records remain supported
   • Sorting remains view-only
   • Filtering remains view-only

   Change History
   ----------------------------------------------------------
   v1.2.0
   • Restored audit foundation removed during sorting upgrade
   • Restored normalization helpers
   • Restored published-asset resolution
   • Restored ownership resolution
   • Restored credential audit-row construction
   • Restored credential Firestore loading
   • Restored credential_assets Firestore loading
   • Restored summary metrics
   • Restored programme-filter population
   • Restored governed audit-load orchestration
   • Preserved v1.1.0 sorting implementation
   • Preserved enhanced status rendering
========================================================= */


/* =========================================================
   NORMALIZATION
========================================================= */

function normalizeString(
  value
) {

  if (
    value === undefined ||
    value === null
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
   HTML ESCAPING
========================================================= */

function escapeHtml(
  value
) {

  return normalizeString(
    value
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   ASSET TYPE NORMALIZATION

   Supports canonical governed asset names together with
   historical aliases that may exist in credential_assets.
========================================================= */

function normalizeAssetType(
  rawType
) {

  const type =
    normalizeLower(
      rawType
    )
      .replace(
        /[\s-]+/g,
        "_"
      );


  const aliases = {

    universitycertificate:
      "university_certificate",

    university_certificate:
      "university_certificate",

    certificate:
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


  return aliases[type] ||
    type;

}


/* =========================================================
   PUBLISHED ASSET RESOLUTION
========================================================= */

function isPublishedAsset(
  asset
) {

  if (
    !asset
  ) {

    return false;

  }


  const status =
    normalizeLower(
      asset.status
    );


  const publishedFlag =
    asset.published ===
    true;


  const latestFlag =
    asset.is_latest;


  /*
   * Support both the governed status field and
   * historical published boolean where present.
   */

  const published =
    status ===
      "published" ||
    publishedFlag;


  /*
   * Historical asset records may not contain
   * is_latest. Absence of the field must therefore
   * not automatically invalidate the asset.
   */

  const latest =
    latestFlag ===
      undefined ||
    latestFlag ===
      null ||
    latestFlag ===
      true;


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


  /*
   * Credential-level learner ownership is authoritative
   * when available.
   */

  if (
    credentialLearnerUid
  ) {

    return {

      status:
        "linked",

      label:
        "Learner Linked"

    };

  }


  /*
   * Historical credential records may not yet contain
   * learner_uid while a published credential asset does.
   */

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

      status:
        "linked",

      label:
        "Learner Linked"

    };

  }


  return {

    status:
      "pending",

    label:
      "Activation Pending"

  };

}


/* =========================================================
   REQUIRED ASSET RESOLUTION
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
        assetType ===
          requiredType &&
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
        ) ===
        credentialId
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
        !requiredAssets[
          type
        ]
    );


  const complete =
    missingAssets.length ===
    0;


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
   BUILD AUDIT ROWS
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
   FIRESTORE READ — CREDENTIALS
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


/* =========================================================
   FIRESTORE READ — CREDENTIAL ASSETS
========================================================= */

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
   STATUS MESSAGE
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
        row.ownership?.status ===
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
   PROGRAM FILTER POPULATION
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
          firstProgram,
          secondProgram
        ) =>
          firstProgram.localeCompare(
            secondProgram
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
   AUDIT LOAD ORCHESTRATION
   Version: 1.2.0

   Sequence
   ----------------------------------------------------------
   1. Load credentials
   2. Load published credential assets
   3. Resolve governed audit rows
   4. Populate programme filter
   5. Render summary
   6. Apply active filters and sorting
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


    /*
     * applyFilters() includes the current governed
     * sorting implementation.
     */

    applyFilters();

  }
  catch (
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

          <td
            colspan="8">

            Credential asset audit could not be loaded.

          </td>

        </tr>
      `;

    }

  }
  finally {

    if (
      refreshButton
    ) {

      refreshButton.disabled =
        false;

    }

  }

}

/* =========================================================
   FILTERING + SORTING
   Version: 1.1.0

   Purpose
   ----------------------------------------------------------
   • Apply operational audit filters
   • Apply governed view-only sorting
   • Preserve authoritative auditState.rows
   • Render the resulting operational view

   Governance
   ----------------------------------------------------------
   • Filtering operates only on auditState.rows
   • Sorting operates only on the filtered result
   • auditState.rows must never be sorted in place
   • Firestore data is never mutated
   • Action Required First is the operational default
   • Alphabetical ordering is used as a deterministic
     secondary sort where appropriate
========================================================= */

function compareText(
  firstValue,
  secondValue
) {

  return normalizeString(
    firstValue
  ).localeCompare(
    normalizeString(
      secondValue
    ),
    undefined,
    {
      sensitivity:
        "base"
    }
  );

}


/* =========================================================
   SORT RESOLVER

   Governance
   ----------------------------------------------------------
   Receives the current filtered view and returns a sorted
   copy. The incoming array is never sorted in place.
========================================================= */

function sortAuditRows(
  rows,
  sortMode
) {

  const normalizedSortMode =
    normalizeString(
      sortMode
    ) ||
    DEFAULT_SORT_MODE;

  const sortedRows =
    [
      ...rows
    ];


  sortedRows.sort(
    (
      firstRow,
      secondRow
    ) => {

      switch (
        normalizedSortMode
      ) {

        /* =================================================
           ACTION REQUIRED FIRST
        ================================================= */

        case SORT_MODES.ACTION_FIRST: {

          if (
            firstRow.complete !==
            secondRow.complete
          ) {

            return firstRow.complete
              ? 1
              : -1;

          }


          return compareText(
            firstRow.learnerName,
            secondRow.learnerName
          );

        }


        /* =================================================
           COMPLETE FIRST
        ================================================= */

        case SORT_MODES.COMPLETE_FIRST: {

          if (
            firstRow.complete !==
            secondRow.complete
          ) {

            return firstRow.complete
              ? -1
              : 1;

          }


          return compareText(
            firstRow.learnerName,
            secondRow.learnerName
          );

        }


        /* =================================================
           LEARNER NAME A-Z
        ================================================= */

        case SORT_MODES.NAME_ASC: {

          return compareText(
            firstRow.learnerName,
            secondRow.learnerName
          );

        }


        /* =================================================
           LEARNER NAME Z-A
        ================================================= */

        case SORT_MODES.NAME_DESC: {

          return compareText(
            secondRow.learnerName,
            firstRow.learnerName
          );

        }


        /* =================================================
           CREDENTIAL ID A-Z
        ================================================= */

        case SORT_MODES.CREDENTIAL_ASC: {

          return compareText(
            firstRow.credentialId,
            secondRow.credentialId
          );

        }


        /* =================================================
           PROGRAM A-Z
        ================================================= */

        case SORT_MODES.PROGRAM_ASC: {

          const programComparison =
            compareText(
              firstRow.programCode,
              secondRow.programCode
            );


          if (
            programComparison !== 0
          ) {

            return programComparison;

          }


          return compareText(
            firstRow.learnerName,
            secondRow.learnerName
          );

        }


        /* =================================================
           OWNERSHIP PENDING FIRST
        ================================================= */

        case SORT_MODES.OWNERSHIP_PENDING_FIRST: {

          const firstPending =
            firstRow.ownership?.status ===
            "pending";

          const secondPending =
            secondRow.ownership?.status ===
            "pending";


          if (
            firstPending !==
            secondPending
          ) {

            return firstPending
              ? -1
              : 1;

          }


          return compareText(
            firstRow.learnerName,
            secondRow.learnerName
          );

        }


        /* =================================================
           SAFE GOVERNED FALLBACK

           Unknown or unsupported sort modes fall back to
           Action Required First.
        ================================================= */

        default: {

          if (
            firstRow.complete !==
            secondRow.complete
          ) {

            return firstRow.complete
              ? 1
              : -1;

          }


          return compareText(
            firstRow.learnerName,
            secondRow.learnerName
          );

        }

      }

    }
  );


  return sortedRows;

}


/* =========================================================
   APPLY FILTERS

   Processing Order
   ----------------------------------------------------------
   Authoritative Audit Rows
        ↓
   Search Filter
        ↓
   Program Filter
        ↓
   Asset Status Filter
        ↓
   Ownership Filter
        ↓
   Governed Sort Resolver
        ↓
   Rendered Audit View
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


  const selectedSort =
    normalizeString(
      sortFilter?.value
    ) ||
    DEFAULT_SORT_MODE;


  /* =======================================================
     FILTER CURRENT AUDIT VIEW
  ======================================================= */

  const filteredRows =
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


        /* -------------------------------------------------
           SEARCH
        ------------------------------------------------- */

        if (
          search &&
          !searchable.includes(
            search
          )
        ) {

          return false;

        }


        /* -------------------------------------------------
           PROGRAM
        ------------------------------------------------- */

        if (
          selectedProgram &&
          row.programCode !==
            selectedProgram
        ) {

          return false;

        }


        /* -------------------------------------------------
           ASSET COMPLETENESS
        ------------------------------------------------- */

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


        /* -------------------------------------------------
           OWNERSHIP
        ------------------------------------------------- */

        if (
          selectedOwnership &&
          row.ownership?.status !==
            selectedOwnership
        ) {

          return false;

        }


        return true;

      }
    );


  /* =======================================================
     SORT FILTERED VIEW

     Important:
     sortAuditRows returns a copy. The authoritative
     auditState.rows array remains unchanged.
  ======================================================= */

  auditState.filteredRows =
    sortAuditRows(
      filteredRows,
      selectedSort
    );


  /* =======================================================
     RENDER
  ======================================================= */

  renderTable();


  setStatus(
    `Showing ${auditState.filteredRows.length} of ${auditState.rows.length} credentials.`
  );

}


/* =========================================================
   CLEAR FILTERS
   Version: 1.1.0

   Governance
   ----------------------------------------------------------
   Clear returns the audit surface to its governed
   operational default:

   Search     → Empty
   Program    → All
   Asset      → All
   Ownership  → All
   Sort       → Action Required First
========================================================= */

function clearFilters() {

  if (
    searchInput
  ) {

    searchInput.value =
      "";

  }


  if (
    programFilter
  ) {

    programFilter.value =
      "";

  }


  if (
    statusFilter
  ) {

    statusFilter.value =
      "";

  }


  if (
    ownershipFilter
  ) {

    ownershipFilter.value =
      "";

  }


  if (
    sortFilter
  ) {

    sortFilter.value =
      DEFAULT_SORT_MODE;

  }


  applyFilters();

}

/* =========================================================
   EVENT BINDING
   Version: 1.1.0

   Purpose
   ----------------------------------------------------------
   • Bind governed audit interaction controls
   • Route all filter changes through applyFilters()
   • Route sorting changes through applyFilters()
   • Support controlled audit refresh
   • Support governed filter reset

   Governance
   ----------------------------------------------------------
   • UI events may alter only the rendered audit view
   • Filter events must not mutate authoritative audit rows
   • Sort events must not mutate authoritative audit rows
   • Refresh may reload authoritative read-only data
   • Clear Filters returns to Action Required First
========================================================= */

function bindEvents() {

  /* =======================================================
     SEARCH
  ======================================================= */

  searchInput?.addEventListener(
    "input",
    applyFilters
  );


  /* =======================================================
     PROGRAM FILTER
  ======================================================= */

  programFilter?.addEventListener(
    "change",
    applyFilters
  );


  /* =======================================================
     ASSET STATUS FILTER
  ======================================================= */

  statusFilter?.addEventListener(
    "change",
    applyFilters
  );


  /* =======================================================
     OWNERSHIP FILTER
  ======================================================= */

  ownershipFilter?.addEventListener(
    "change",
    applyFilters
  );


  /* =======================================================
     SORT CONTROL

     All sorting remains inside applyFilters() →
     sortAuditRows(). The DOM is never manually reordered
     by the event handler.
  ======================================================= */

  sortFilter?.addEventListener(
    "change",
    applyFilters
  );


  /* =======================================================
     REFRESH AUDIT
  ======================================================= */

  refreshButton?.addEventListener(
    "click",
    loadAudit
  );


  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  clearFiltersButton?.addEventListener(
    "click",
    clearFilters
  );

}


/* =========================================================
   DOM INITIALIZATION
   Version: 1.1.0

   Purpose
   ----------------------------------------------------------
   Resolve the governed DOM contract used by the
   Credential Asset Audit controller.

   DOM Contract
   ----------------------------------------------------------
   Summary
   • auditTotalCredentials
   • auditCompleteCredentials
   • auditIncompleteCredentials
   • auditOwnershipPending

   Filters
   • auditSearch
   • auditProgramFilter
   • auditStatusFilter
   • auditOwnershipFilter
   • auditSort

   Actions
   • auditRefreshBtn
   • auditClearFiltersBtn

   Audit Surface
   • credentialAssetAuditTableBody
   • auditStatusMessage

   Governance
   ----------------------------------------------------------
   • JavaScript resolves existing HTML authorities
   • JavaScript does not create structural controls
   • Missing optional controls fail safely through
     optional event binding
   • DOM IDs must remain aligned with
     credential-asset-audit.html
========================================================= */

function resolveDom() {

  /* =======================================================
     AUDIT TABLE
  ======================================================= */

  tableBody =
    document.getElementById(
      "credentialAssetAuditTableBody"
    );


  /* =======================================================
     STATUS MESSAGE
  ======================================================= */

  statusMessage =
    document.getElementById(
      "auditStatusMessage"
    );


  /* =======================================================
     SUMMARY METRICS
  ======================================================= */

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


  /* =======================================================
     FILTER CONTROLS
  ======================================================= */

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


  /* =======================================================
     SORT CONTROL
  ======================================================= */

  sortFilter =
    document.getElementById(
      "auditSort"
    );


  /* =======================================================
     ACTION CONTROLS
  ======================================================= */

  refreshButton =
    document.getElementById(
      "auditRefreshBtn"
    );


  clearFiltersButton =
    document.getElementById(
      "auditClearFiltersBtn"
    );

}

/* =========================================================
   ASSET DISPLAY
   Version: 1.1.0

   Purpose
   ----------------------------------------------------------
   Render governed visual state for required credential
   assets.

   Governance
   ----------------------------------------------------------
   • Published assets are rendered as positive state
   • Missing assets are rendered as remediation state
   • Rendering does not modify asset records
   • CSS owns visual presentation
========================================================= */

function renderAssetStatus(
  asset
) {

  if (
    asset
  ) {

    return `
      <span
        class="audit-status audit-status-published"
        title="Published asset available">

        ✓ Published

      </span>
    `;

  }


  return `
    <span
      class="audit-status audit-status-missing"
      title="Required published asset not found">

      — Missing

    </span>
  `;

}


/* =========================================================
   OWNERSHIP DISPLAY
   Version: 1.1.0

   Purpose
   ----------------------------------------------------------
   Render learner ownership readiness independently from
   credential asset completeness.

   Governance
   ----------------------------------------------------------
   • Learner Linked is a positive ownership state
   • Activation Pending is an unresolved ownership state
   • Ownership state does not determine asset completeness
   • Rendering does not mutate learner identity
========================================================= */

function renderOwnership(
  ownership
) {

  if (
    ownership?.status ===
    "linked"
  ) {

    return `
      <span
        class="audit-status audit-status-linked">

        ✓ ${escapeHtml(
          ownership.label
        )}

      </span>
    `;

  }


  return `
    <span
      class="audit-status audit-status-pending">

      — ${escapeHtml(
        ownership?.label ||
        "Activation Pending"
      )}

    </span>
  `;

}


/* =========================================================
   OVERALL DISPLAY
   Version: 1.1.0

   Purpose
   ----------------------------------------------------------
   Render governed credential-asset readiness.

   Governance
   ----------------------------------------------------------
   COMPLETE
   • All required governed assets are published

   ACTION REQUIRED
   • One or more required governed assets are missing

   Ownership state remains independent of completeness.
========================================================= */

function renderOverallStatus(
  row
) {

  if (
    row.complete
  ) {

    return `
      <span
        class="
          audit-status
          audit-status-complete
          audit-overall
        ">

        COMPLETE

      </span>
    `;

  }


  return `
    <span
      class="
        audit-status
        audit-status-action-required
        audit-overall
      ">

      ACTION REQUIRED

    </span>
  `;

}


/* =========================================================
   TABLE RENDERING
   Version: 1.1.0

   Purpose
   ----------------------------------------------------------
   Render the current filtered and sorted audit view.

   Responsibilities
   ----------------------------------------------------------
   ✓ Render credential ID
   ✓ Render learner identity
   ✓ Render program
   ✓ Render required asset states
   ✓ Render ownership state
   ✓ Render overall readiness
   ✓ Apply governed row-state classes
   ✓ Preserve filtered/sorted order

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Filter audit data
   ✗ Sort audit data
   ✗ Modify Firestore data
   ✗ Generate assets
   ✗ Publish assets

   Governance
   ----------------------------------------------------------
   • auditState.filteredRows is the rendering authority
   • renderTable() must not perform sorting
   • renderTable() must not perform filtering
   • Row classes are presentation signals only
   • HTML values are escaped before rendering
========================================================= */

function renderTable() {

  if (
    !tableBody
  ) {

    return;

  }


  tableBody.innerHTML =
    "";


  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (
    auditState.filteredRows.length ===
    0
  ) {

    tableBody.innerHTML = `
      <tr>

        <td
          colspan="8"
          class="audit-empty-state">

          No credentials match the current audit filters.

        </td>

      </tr>
    `;


    return;

  }


  /* =======================================================
     DOCUMENT FRAGMENT
  ======================================================= */

  const fragment =
    document.createDocumentFragment();


  auditState.filteredRows.forEach(
    row => {

      const tr =
        document.createElement(
          "tr"
        );


      /* ===================================================
         OVERALL ROW STATE
      =================================================== */

      tr.classList.add(
        row.complete
          ? "audit-row-complete"
          : "audit-row-action-required"
      );


      /* ===================================================
         OWNERSHIP ROW STATE
      =================================================== */

      tr.classList.add(
        row.ownership?.status ===
          "linked"
          ? "audit-row-linked"
          : "audit-row-ownership-pending"
      );


      /* ===================================================
         ROW CONTENT
      =================================================== */

      tr.innerHTML = `

        <td
          class="audit-credential-id">

          ${escapeHtml(
            row.credentialId
          )}

        </td>


        <td>

          <div
            class="audit-learner-name">

            ${escapeHtml(
              row.learnerName ||
              "-"
            )}

          </div>


          <div
            class="audit-learner-email">

            ${escapeHtml(
              row.email ||
              "-"
            )}

          </div>

        </td>


        <td>

          ${escapeHtml(
            row.programCode ||
            "-"
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
   APPLICATION INITIALIZATION
   =========================================================
   Credential Asset Audit
   Version: 1.2.0

   Purpose
   ---------------------------------------------------------
   Initializes the governed Credential Asset Audit surface
   after module dependencies and DOM bindings are available.

   Initialization Order
   ---------------------------------------------------------
   1. Resolve DOM references
   2. Initialize shared Admin application/authentication
   3. Bind audit controls
   4. Load credential registry and asset data
   5. Render governed audit state

   Governance
   ---------------------------------------------------------
   - Read-only audit surface
   - No credential mutation
   - No credential asset mutation
   - No learner identity mutation
   - Existing Admin RBAC remains authoritative
   - Existing Firebase Core remains authoritative

   Change History
   ---------------------------------------------------------
   v1.2.0
   - Restored explicit application bootstrap
   - Preserves deterministic initialization sequence
   - Preserves filtering and sorting implementation
   - Preserves asset readiness rendering
   - Preserves shared Admin authentication lifecycle
   ========================================================= */

(async () => {

  console.log(
    "[CredentialAssetAudit] Initializing..."
  );


  try {

    /* =====================================================
       1. RESOLVE DOM
    ===================================================== */

    resolveDom();


    /* =====================================================
       2. INITIALIZE ADMIN APPLICATION
    ===================================================== */

    await initAdminApp();


    /* =====================================================
       3. BIND AUDIT EVENTS
    ===================================================== */

    bindEvents();


    /* =====================================================
       4. LOAD AUDIT DATA
    ===================================================== */

    await loadAudit();


    /* =====================================================
       INITIALIZATION COMPLETE
    ===================================================== */

    console.log(
      "[CredentialAssetAudit] Initialized."
    );

  }
  catch (
    error
  ) {

    console.error(
      "[CredentialAssetAudit] Initialization failed:",
      error
    );


    /*
     * Do not silently leave the page in an indefinite
     * loading state when initialization fails.
     */

    document.body.classList.remove(
      "app-loading"
    );

  }

})();