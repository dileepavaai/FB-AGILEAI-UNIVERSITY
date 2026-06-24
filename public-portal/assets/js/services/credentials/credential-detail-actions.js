/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Credential Detail Actions

File        : credential-detail-actions.js
Version     : 1.1.0
Status      : ACTIVE

Governance  : Portal Governance v1.0

========================================================

Purpose
--------------------------------------------------------

Provides the interaction layer for the
Credential Detail experience.

This controller is responsible ONLY for
handling user interactions initiated from
the Credential Detail page.

Examples

• Verify Credential
• View University Certificate
• View Trainer Certificate
• View University Badge
• Add To LinkedIn
• Export To Wallet

========================================================

Architectural Position
--------------------------------------------------------

Authentication
        ↓
Entitlement Resolution
        ↓
Credential Service
        ↓
Credential Renderer
        ↓
Credential Detail Renderer
        ↓
Credential Detail Actions

This component intentionally performs
navigation and interaction only.

========================================================

Responsibilities
--------------------------------------------------------

✓ Read selected credential

✓ Build governed navigation URLs

✓ Attach UI event handlers

✓ Navigate to recognition assets

✓ Provide placeholders for future
  sharing capabilities

========================================================

Must Never
--------------------------------------------------------

✗ Query Firestore

✗ Call Portal APIs

✗ Resolve Entitlements

✗ Perform Authorization

✗ Render UI

✗ Modify Credential Data

✗ Modify Session State

========================================================

Governance Rules
--------------------------------------------------------

• Credential Detail owns rendering.

• Credential Detail Actions owns
  interaction only.

• Navigation is performed using the
  selected Credential ID.

• Downstream pages must independently
  resolve their own data.

========================================================

Dependencies
--------------------------------------------------------

credential-detail.js

========================================================

Change History
--------------------------------------------------------

v1.1.0

• Introduced governed interaction layer
• Centralized route configuration
• Added immutable route definitions
• Added lifecycle documentation
• Added defensive event binding
• Added placeholder support for
  future LinkedIn and Wallet modules

v1.0.0

• Initial implementation

===================================================== */

(function () {

"use strict";

/* =====================================================
   Component Initialization
===================================================== */

const LOG_PREFIX =
  "[Credential Detail Actions]";

console.info(
  `${LOG_PREFIX} Loaded v1.1.0`
);

if (
  window.__credentialDetailActionsInitialized === true
) {
  console.info(
    `${LOG_PREFIX} Already initialized`
  );
  return;
}

window.__credentialDetailActionsInitialized = true;

/* =====================================================
   Governed Route Configuration

   These routes represent navigation
   endpoints only.

   Future route modifications must occur
   only within this configuration section.

===================================================== */

const ROUTES = Object.freeze({

  VERIFY:
    "https://verify.agileai.university/",

  UNIVERSITY_CERTIFICATE:
    "/credentials/university-certificate.html",

  TRAINER_CERTIFICATE:
    "/credentials/trainer-certificate.html",

  UNIVERSITY_BADGE:
    "/credentials/university-badge.html"

});

/* =====================================================
   Selected Credential

   Governance Decision

   The selected credential is persisted
   by the Credential Renderer.

   This controller consumes the stored
   object but never modifies it.

===================================================== */

function getCredential() {

  try {

    return JSON.parse(

      sessionStorage.getItem(
        "selectedCredential"
      )

    );

  }

  catch (error) {

    console.error(
      `${LOG_PREFIX} Unable to read selected credential`,
      error
    );

    return null;

  }

}

/* =====================================================
   Navigation

   Every downstream experience receives
   only the Credential ID.

   No additional state is transmitted.

===================================================== */

function navigate(
  baseUrl
) {

  const credential =
    getCredential();

  if (
    !credential ||
    !credential.credential_id
  ) {

    console.warn(
      `${LOG_PREFIX} Missing credential ID`
    );

    return;

  }

  const destination =

    `${baseUrl}?credentialId=${encodeURIComponent(
      credential.credential_id
    )}`;

  console.info(
    `${LOG_PREFIX} Navigating`,
    destination
  );

  window.location.href =
    destination;

}

/* =====================================================
   Recognition Actions
===================================================== */

function openVerification() {

  navigate(
    ROUTES.VERIFY
  );

}

function openUniversityCertificate() {

  navigate(
    ROUTES.UNIVERSITY_CERTIFICATE
  );

}

function openTrainerCertificate() {

  navigate(
    ROUTES.TRAINER_CERTIFICATE
  );

}

function openUniversityBadge() {

  navigate(
    ROUTES.UNIVERSITY_BADGE
  );

}

/* =====================================================
   Future Capabilities

   These modules are intentionally
   deferred to future releases.

===================================================== */

function shareLinkedIn() {

  alert(

    "LinkedIn sharing will be available in a future release."

  );

}

function exportWallet() {

  alert(

    "Wallet export will be available in a future release."

  );

}

/* =====================================================
   Event Binding

   Event registration occurs exactly once.

   Missing UI elements are tolerated to
   support phased feature rollout.

===================================================== */

function bind(

  elementId,
  handler

) {

  const element =

    document.getElementById(
      elementId
    );

  if (!element) {

    console.warn(
      `${LOG_PREFIX} Missing element`,
      elementId
    );

    return;

  }

  element.addEventListener(

    "click",

    handler

  );

}

/* =====================================================
   Initialization Lifecycle

   Initializes exactly once after the
   Credential Detail page has loaded.

===================================================== */

function initialize() {

  bind(
    "verify-credential-btn",
    openVerification
  );

  bind(
    "university-certificate-btn",
    openUniversityCertificate
  );

  bind(
    "trainer-certificate-btn",
    openTrainerCertificate
  );

  bind(
    "university-badge-btn",
    openUniversityBadge
  );

  bind(
    "linkedin-btn",
    shareLinkedIn
  );

  bind(
    "wallet-btn",
    exportWallet
  );

  console.info(
    `${LOG_PREFIX} Initialization complete`
  );

}

/* =====================================================
   Bootstrap
===================================================== */

document.addEventListener(

  "DOMContentLoaded",

  initialize

);

})();