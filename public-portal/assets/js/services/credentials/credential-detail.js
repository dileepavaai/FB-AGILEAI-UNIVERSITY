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

  if (

    !window.CredentialService ||

    typeof window.CredentialService.getCredentialById !==
      "function"

  ) {

    console.warn(
      "[Credential Detail] CredentialService unavailable."
    );

    showNotFound();

    return;

  }

  const credential =

    window.CredentialService.getCredentialById(
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

  console.info(
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