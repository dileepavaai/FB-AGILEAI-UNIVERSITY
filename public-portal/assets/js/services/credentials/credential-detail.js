/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Credential Detail

File        : credential-detail.js
Version     : 1.1.0
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
  "[Credential Detail] Loaded v1.1.0"
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
    definition.full_name ||
    definition.display_name ||
    credential.program_code ||
    "Credential";

  const code =
    definition.code ||
    credential.program_code ||
    "--";

  const validity =
    definition.validity ||
    "Lifetime";

  const issuer =
    definition.issuer ||
    "Agile AI University";

  const holder =
    credential.full_name ||
    credential.learner_name ||
    "--";

  const credentialId =
    credential.credential_id ||
    "--";

  const setText = function (
    id,
    value
  ) {

    const element =
      document.getElementById(
        id
      );

    if (element) {

      element.textContent =
        value;

    }

  };

  setText(
    "credential-code",
    code
  );

  setText(
    "credential-title",
    title
  );

  setText(
    "credential-id",
    credentialId
  );

  setText(
    "credential-holder",
    holder
  );

  setText(
    "credential-issuer",
    issuer
  );

  setText(
    "credential-validity",
    validity
  );

  setText(
    "credential-status",
    "Active"
  );

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