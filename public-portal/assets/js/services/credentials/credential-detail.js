/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Credential Detail

File        : credential-detail.js
Version     : 1.0.0
Status      : ACTIVE

Governance  : Portal Governance v1.0

Purpose
-------------------------------------------------------

Display a selected credential from the
resolver-approved credential set.

Must Never

* Call APIs
* Query Firestore
* Resolve Entitlements
* Perform Authorization

Dependencies

credential-service.js

===================================================== */

(function () {

"use strict";

console.log(
  "[Credential Detail] Loaded v1.0.0"
);

if (
  window.__credentialDetailInitialized === true
) {
  return;
}

window.__credentialDetailInitialized = true;

/* =====================================================
   Query Parameter
===================================================== */

function getCredentialId() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  return params.get(
    "credentialId"
  );

}

/* =====================================================
   Credential Lookup
===================================================== */

function findCredential(
  credentialId
) {

  try {

    const credential =
      JSON.parse(
        sessionStorage.getItem(
          "selectedCredential"
        )
      );

    if (
      credential &&
      credential.credential_id ===
      credentialId
    ) {

      return credential;

    }

  }
  catch (error) {

    console.error(
      "[Credential Detail] Session parse failure",
      error
    );

  }

  return null;

}

/* =====================================================
   Populate UI
===================================================== */

function populateCredential(
  credential
) {

  const registry =
    window.AAIU_CREDENTIAL_REGISTRY || {};

  const definition =
    registry[
      credential.program_code
    ] || {};

  const title =
    definition.full_title ||
    credential.program_code;

  document.getElementById(
    "credential-id"
  ).textContent =
    credential.credential_id || "--";

  document.getElementById(
    "credential-holder"
  ).textContent =
    credential.full_name || "--";

  document.getElementById(
    "credential-issuer"
  ).textContent =
    definition.issuer ||
    "Agile AI University";

  document.getElementById(
    "credential-validity"
  ).textContent =
    definition.validity ||
    "Lifetime";

    const titleElement =
    document.querySelector(
        ".credential-title strong"
    );

    if (titleElement) {

    titleElement.textContent =
        title;

    }

}

/* =====================================================
   Empty State
===================================================== */

function showNotFound() {

  document.body.innerHTML = `
    <main class="page-container">

      <section class="credential-card">

        <h2>
          Credential Not Found
        </h2>

        <p>
          The requested credential
          could not be located.
        </p>

      </section>

    </main>
  `;

}

/* =====================================================
   Initialize
===================================================== */

function initialize() {

  const credentialId =
    getCredentialId();

  if (!credentialId) {

    console.warn(
      "[Credential Detail] Missing credentialId"
    );

    showNotFound();

    return;

  }

  const credential =
    findCredential(
      credentialId
    );

  if (!credential) {

    console.warn(
      "[Credential Detail] Credential not found:",
      credentialId
    );

    showNotFound();

    return;

  }

  populateCredential(
    credential
  );

  console.log(
    "[Credential Detail] Rendered:",
    credentialId
  );

}

/* =====================================================
   Initialize On Page Load
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  initialize
);

})();