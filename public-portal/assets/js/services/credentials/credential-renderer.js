/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Credential Renderer

File        : credential-renderer.js
Version     : 2.1.0
Status      : ACTIVE

Governance  : Portal Governance v1.0

## Purpose

Render credential cards from resolver-approved
credential data.

## Architectural Position

Authentication
↓
Entitlements
↓
Resolver
↓
Credential Service
↓
Credential Renderer

## Responsibilities

* Render portfolio credential cards
* Delegate credential detail experience
* Display credential summary information
* Signal render completion

## Must Never

* Call APIs
* Query Firestore
* Perform Authorization
* Resolve Entitlements
* Filter Credentials
* Modify Entitlement State

## Governance Rules

Resolver owns visibility decisions.

Renderer consumes resolver-approved
credential data only.

Renderer must remain UI-only.

## Dependencies

credential-service.js
credential-detail-actions.js

## Change History

v2.1.0

* Updated portfolio action terminology
* Replaced View Credential with Open Credential Workspace
* Aligned portfolio interaction with Credential Workspace architecture
* Preserved shared CredentialDetailActions delegation

v2.0.0

* Refactored to portfolio-only renderer
* Delegated credential detail experience
* Removed inline credential preview
* Integrated CredentialDetailActions

v1.0.0

* Governance aligned implementation
* Registry-aware rendering
* Credential verification support
* LinkedIn integration support
* Share experience support
* Completion signalling support

===================================================== */

(function () {
  "use strict";

  console.log(
    "[Credential Renderer] Loaded v2.1.0"
    );

  if (window.__credentialsRendererInitialized === true) return;
  window.__credentialsRendererInitialized = true;

  let renderCompleted = false;
  let completionSignalled = false;

  /* =====================================================
     SAFE DATE NORMALIZATION
     ===================================================== */
  function safeDate(input) {
    try {
      const d =
        input?.toDate?.() ||
        (input instanceof Date ? input : new Date(input));

      if (!d || isNaN(d.getTime())) return "—";

      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "—";
    }
  }

  /* =====================================================
     🔒 VALIDITY INTEGRITY GUARDRAIL (LOCKED)
     ===================================================== */
  function assertCredentialValidityIntegrity(cred) {
    if (!cred || !cred.validity) return;

    if (
      String(cred.validity).toLowerCase() === "lifetime" &&
      ("expiryDate" in cred ||
        "expiresOn" in cred ||
        "validUntil" in cred ||
        "expiration" in cred)
    ) {
      throw new Error(
        "SYSTEM VIOLATION: Lifetime credentials must not define expiry fields."
      );
    }
  }

      /* =====================================================
      RESERVED FOR CREDENTIAL DETAIL EXPERIENCE

      Currently unused by Portfolio Experience.

      Retained for future use in:

      Credential Workspace Overlay

      function buildPublicCredentialUrl(...)
      function buildVerifyUrl(...)
      function buildLinkedInUrl(...)
      function shareCredential(...)

      Governance:
      Safe to remove after Detail Experience
      implementation is finalized.

    ===================================================== */

  /* =====================================================
     🔗 CANONICAL URL BUILDERS
     ===================================================== */
  function buildPublicCredentialUrl(cred) {
    return cred?.credential_id
      ? "https://verify.agileai.university/credential.html?cid=" +
          encodeURIComponent(cred.credential_id)
      : "#";
  }

  function buildVerifyUrl(cred) {
    return cred?.credential_id
      ? "https://verify.agileai.university/verify.html?cid=" +
          encodeURIComponent(cred.credential_id)
      : "#";
  }

  /* =====================================================
     LINKEDIN ADD-TO-PROFILE (EXPLICIT ACTION)
     ===================================================== */
  function buildLinkedInUrl(cred, displayName) {
    const org = "Agile AI University";
    const certId = cred?.credential_id || "";
    const issueYear =
      cred?.issued_at?.getFullYear?.() || new Date().getFullYear();

    return (
      "https://www.linkedin.com/profile/add" +
      "?startTask=CERTIFICATION_NAME" +
      `&name=${encodeURIComponent(displayName)}` +
      `&organizationName=${encodeURIComponent(org)}` +
      `&issueYear=${issueYear}` +
      `&credentialId=${encodeURIComponent(certId)}` +
      `&credentialUrl=${encodeURIComponent(
        buildPublicCredentialUrl(cred)
      )}`
    );
  }

  /* =====================================================
     COMPLETION SIGNAL (EVENT-SAFE · FIRE-ONCE)
     ===================================================== */
  function signalRenderComplete() {
    if (completionSignalled) return;
    completionSignalled = true;

    document.dispatchEvent(
      new CustomEvent("credentials:rendered", {
        detail: { source: "renderCredentials" }
      })
    );

  console.log(
    "[Credentials Renderer] credentials:rendered dispatched"
  );

}

/* =====================================================
   MAIN RENDER ENTRY (PORTFOLIO CARD EXPERIENCE)
===================================================== */

window.renderCredentials = function renderCredentials(
  credentials
) {

  if (renderCompleted === true) {

    signalRenderComplete();

    return;

  }

  /* =====================================================
   GOVERNED RENDER TARGET RESOLUTION

   Supported Experiences

   • Credential Portfolio
   • Student Dashboard
   • Future Executive Dashboard

===================================================== */

const container =
    document.getElementById(
        "credentials-container"
    ) ||
    document.getElementById(
        "credentials-list"
    ) ||
    document.getElementById(
        "recentCredentials"
    );

  if (!container) {
    return;
  }

  if (
    !Array.isArray(credentials) ||
    credentials.length === 0
  ) {

    container.innerHTML = `

      <div class="empty-state">

        No credentials available at this time.

      </div>

    `;

    renderCompleted = true;

    signalRenderComplete();

    return;

  }

  console.assert(

    credentials.every(
      credential =>
        credential &&
        typeof credential.program_code ===
          "string"
    ),

    "[Credentials Renderer Invariant] Credential missing program_code"

  );

  container.innerHTML = "";

  credentials.forEach(

    function (credential) {

      assertCredentialValidityIntegrity(
        credential
      );

      const program =
    credential.program || {};

      const title =

    program.programName ||

    credential.program_code;

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "credential-card";

      card.innerHTML = `

        <div class="credential-portfolio-card">

          <img
            class="credential-portfolio-emblem"
            src="/assets/images/aau-emblem.png"
            alt="Agile AI University">

          <div class="credential-portfolio-code">

            ${program.programCode || credential.program_code}

          </div>

          <div class="credential-portfolio-title">

            ${title}

          </div>

          <div class="credential-portfolio-validity">

            ${
              String(
                credential.validity || ""
              ).toLowerCase() ===
              "lifetime"

                ? "Lifetime"

                : (
                    credential.validity ||
                    "Active"
                  )
            }

          </div>

          <button
            type="button"
            class="credential-portfolio-action">

            Open Credential Workspace

          </button>

        </div>

      `;

            /* =============================================
         Portfolio Selection Experience

         Governance

         • Card owns credential selection
         • Button delegates to card
         • Single interaction path
         • Prevent duplicate rendering logic

      ============================================== */

      card.addEventListener(

          "click",

          function () {

              if (

                  window.CredentialDetailActions &&

                  typeof window.CredentialDetailActions.open ===
                      "function"

              ) {

                  window.CredentialDetailActions.open(

                      credential.credential_id

                  );

              }

          }

      );

      const actionButton =
        card.querySelector(
          ".credential-portfolio-action"
        );

      if (actionButton) {

        actionButton.addEventListener(

          "click",

          function (event) {

            event.stopPropagation();

            card.click();

          }

        );

      }

      container.appendChild(
        card
      );

    }

  );

  renderCompleted = true;

  console.log(
    "[Credentials Renderer] Render complete"
  );

  signalRenderComplete();

};

})();