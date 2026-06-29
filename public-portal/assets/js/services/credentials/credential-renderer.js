/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Credential Renderer

File        : credential-renderer.js
Version     : 1.0.0
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

* Render credential cards
* Display credential metadata
* Generate verification links
* Generate LinkedIn add-profile links
* Generate share actions
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

Optional Registry Sources

window.AAIU_CREDENTIAL_REGISTRY
window.__AAIU_CREDENTIAL_REGISTRY
window.CREDENTIAL_REGISTRY

## Change History

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
    "[Credentials Renderer] Loaded (Card v4.4 · Phase-B sharing intent locked)"
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

      credential-details.html

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
     REGISTRY RESOLUTION (DISPLAY ONLY · LOCKED)
     ===================================================== */
  function resolveCredentialDefinition(cred) {
    const code =
      cred?.program_code ||
      cred?.credential_code ||
      cred?.credential_type ||
      "UNKNOWN";

    const registry =
      window.AAIU_CREDENTIAL_REGISTRY ||
      window.__AAIU_CREDENTIAL_REGISTRY ||
      window.CREDENTIAL_REGISTRY ||
      null;

    return registry && registry[code] ? registry[code] : { code };
  }

  /* =====================================================
     SHARE HANDLER (RECORD ACCESS ONLY)
     ===================================================== */
  function shareCredential(cred, def) {
    const title =
      def.full_title || def.full_name || def.display_name || def.code;

    const url = buildPublicCredentialUrl(cred);
    const text =
      `Official credential record\n\n` +
      `Credential: ${title}\n` +
      `Issued by: Agile AI University\n\n` +
      `View credential record:\n${url}`;

    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
      return;
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() =>
        alert("Official credential record link copied.")
      );
      return;
    }

    const temp = document.createElement("textarea");
    temp.value = url;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);

    alert("Official credential record link copied.");
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
   CREDENTIAL PREVIEW EXPERIENCE

   Responsibilities

   • Activate inline preview
   • Resolve display definition
   • Delegate rendering to governed
     renderer functions
   • Scroll preview into view

   Must Never

   • Retrieve credentials
   • Resolve entitlements
   • Perform authorization
   • Filter credentials

===================================================== */

function renderCredentialPreview(credential) {

    if (!credential) {
        return;
    }

    const preview =
        document.getElementById(
            "credential-preview-container"
        );

    if (!preview) {
        return;
    }

    const definition =
        resolveCredentialDefinition(
            credential
        );

    /* ---------------------------------------------
       Hero
    ---------------------------------------------- */

    renderHero(
        credential,
        definition
    );

    /* ---------------------------------------------
       Future Renderers

       Phase 7.0

       renderCredentialInformation()

       Phase 7.1

       renderRecognitionAssets()

       Phase 7.1

       renderActionBar()

    ---------------------------------------------- */

    
    renderCredentialInformation(
        credential,
        definition
    );

    renderRecognitionAssets(
        credential,
        definition
    );

    renderActionBar(
        credential,
        definition
    );

    preview.hidden = false;

    preview.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}

/* =====================================================
   Phase 7 Renderer Sequence

   renderHero()

   renderCredentialInformation()

   renderRecognitionAssets()

   renderActionBar()

===================================================== */

/* =====================================================
   HERO RENDERER

   Responsibilities

   • Render credential hero
   • Display visual identity
   • Display credential title
   • Display program code
   • Display credential validity

   Must Never

   • Retrieve data
   • Resolve entitlements
   • Perform authorization
   • Render metadata
   • Render recognition assets
   • Render action buttons

===================================================== */

function renderHero(
    credential,
    definition
) {

    const hero =
        document.getElementById(
            "credential-hero"
        );

    if (!hero) {
        return;
    }

    const title =
        definition.full_title ||
        definition.full_name ||
        definition.display_name ||
        definition.code ||
        credential.program_code ||
        "Credential";

    const programCode =
        definition.code ||
        credential.program_code ||
        "--";

    const validity =
        String(
            credential.validity || ""
        ).toLowerCase() === "lifetime"
            ? "Lifetime Credential"
            : (
                credential.validity ||
                "Active"
            );

    hero.innerHTML = `

        <div class="credential-preview-header">

            <img
                class="credential-portfolio-emblem"
                src="/assets/images/aau-emblem.png"
                alt="Agile AI University">

            <div class="credential-preview-title">

                <div class="credential-portfolio-code">

                    ${programCode}

                </div>

                <h2>

                    ${title}

                </h2>

                <div class="credential-portfolio-validity">

                    ${validity}

                </div>

            </div>

        </div>

    `;

}

/* =====================================================
   CREDENTIAL INFORMATION RENDERER

   Responsibilities

   • Render credential information
   • Display credential metadata
   • Populate Credential Information region

   Must Never

   • Retrieve data
   • Resolve entitlements
   • Perform authorization
   • Render hero
   • Render recognition assets
   • Render action buttons

===================================================== */

function renderCredentialInformation(
    credential,
    definition
) {

    const information =
        document.getElementById(
            "credential-information"
        );

    if (!information) {
        return;
    }

    const credentialId =
        credential.credential_id || "--";

    const holder =
        credential.full_name || "--";

    const issuedBy =
        "Agile AI University";

    const validity =
        String(
            credential.validity || ""
        ).toLowerCase() === "lifetime"
            ? "Lifetime Credential"
            : (
                credential.validity ||
                "Active"
            );

    information.innerHTML = `

        <div class="credential-preview-section">

            <div class="credential-helper">

                <strong>Credential ID</strong><br>

                ${credentialId}

            </div>

            <div class="credential-helper">

                <strong>Credential Holder</strong><br>

                ${holder}

            </div>

            <div class="credential-helper">

                <strong>Issued By</strong><br>

                ${issuedBy}

            </div>

            <div class="credential-helper">

                <strong>Validity</strong><br>

                ${validity}

            </div>

        </div>

    `;

}

/* =====================================================
   RECOGNITION ASSETS RENDERER

   Responsibilities

   • Render recognition assets
   • Populate Recognition Assets region
   • Display only configured recognition assets

   Governance

   • Asset visibility is determined exclusively by
     credential.available_assets
   • Renderer must never infer assets from
     program codes or credential types

===================================================== */

function renderRecognitionAssets(
    credential,
    definition
) {

    const assets =
        document.getElementById(
            "recognition-assets"
        );

    if (!assets) {
        return;
    }

    const availableAssets =
        credential.available_assets || {};

    const cards = [];

    if (availableAssets.universityCertificate) {

        cards.push(`

            <div class="recognition-asset-card">

                <h4>

                    University Certificate

                </h4>

                <p>

                    Official Agile AI University
                    credential certificate.

                </p>

            </div>

        `);

    }

    if (availableAssets.trainerCertificate) {

        cards.push(`

            <div class="recognition-asset-card">

                <h4>

                    Trainer Certificate

                </h4>

                <p>

                    Trainer-issued recognition
                    certificate.

                </p>

            </div>

        `);

    }

    if (availableAssets.digitalBadge) {

        cards.push(`

            <div class="recognition-asset-card">

                <h4>

                    University Badge

                </h4>

                <p>

                    Official Agile AI University
                    digital badge for professional
                    recognition.

                </p>

            </div>

        `);

    }

    if (availableAssets.recognitionAsset) {

        cards.push(`

            <div class="recognition-asset-card">

                <h4>

                    Recognition Asset

                </h4>

                <p>

                    Additional institutional
                    recognition associated with
                    this credential.

                </p>

            </div>

        `);

    }

    assets.innerHTML = `

        <div class="credential-preview-section">

            <h3>

                Recognition Assets

            </h3>

            ${
                cards.length > 0

                    ? `

                        <div class="recognition-assets-grid">

                            ${cards.join("")}

                        </div>

                    `

                    : `

                        <div class="credential-helper">

                            No recognition assets are
                            currently available for
                            this credential.

                        </div>

                    `
            }

        </div>

    `;

}

/* =====================================================
   ACTION BAR RENDERER

   Responsibilities

   • Render credential action bar
   • Populate Action Bar region
   • Display available credential actions

   Must Never

   • Retrieve data
   • Resolve entitlements
   • Perform authorization
   • Wire action events
   • Perform navigation

===================================================== */

function renderActionBar(
    credential,
    definition
) {

    const actions =
        document.getElementById(
            "credential-actions"
        );

    if (!actions) {
        return;
    }

    actions.innerHTML = `

        <div class="credential-preview-section">

            <h3>
                Available Actions
            </h3>

            <div class="credential-actions">

                <button
                    type="button"
                    class="btn primary">

                    View Certificate

                </button>

                <button
                    type="button"
                    class="btn secondary">

                    Download Certificate

                </button>

                <button
                    type="button"
                    class="btn secondary">

                    View Badge

                </button>

                <button
                    type="button"
                    class="btn secondary">

                    Trainer Certificate

                </button>

                <button
                    type="button"
                    class="btn secondary">

                    Verify Credential

                </button>

            </div>

        </div>

    `;

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

      const definition =
        resolveCredentialDefinition(
          credential
        );

      const title =
        definition.full_title ||
        definition.full_name ||
        definition.display_name ||
        definition.code ||
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

            ${definition.code || credential.program_code}

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

            View Credential

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

          renderCredentialPreview(
            credential
          );

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