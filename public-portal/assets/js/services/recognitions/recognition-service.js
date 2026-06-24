/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Recognition Service

File        : recognition-service.js
Version     : 1.1.0
Status      : ACTIVE

Governance  : Recognition Governance v1.1

## Purpose

Consumes resolver-approved credential visibility
and derives recognition assets available to the
authenticated portal user.

Recognition assets are NOT resolved directly from
entitlements.

Recognition assets are derived from credential
definitions maintained within:

credential-registry.js

Recognition metadata is maintained within:

recognition-registry.js

This separation allows instructor-led,
self-paced, executive, partner and future
delivery models to coexist without modifying
recognition infrastructure.

## Architectural Position

Authentication
↓
Entitlements
↓
Resolver
↓
Visible Credentials
↓
Credential Registry
↓
Recognition Applicability
↓
Recognition Registry
↓
Recognition Renderer

## Responsibilities

* Wait for entitlement readiness
* Consume resolver output
* Obtain visible credentials
* Resolve recognition applicability
* Resolve recognition metadata
* Remove duplicate recognitions
* Invoke recognition renderer

## Must Never

* Call APIs
* Query Firestore
* Perform Authorization
* Resolve Entitlements
* Render UI
* Modify Entitlement State
* Infer Recognition Applicability

## Governance Rules

Recognition applicability is owned by:

credential-registry.js

Recognition metadata is owned by:

recognition-registry.js

Recognition rendering is owned by:

recognition-renderer.js

This service orchestrates recognition
resolution only.

## Dependencies

entitlement.js

resolvePortalEntitlements.js

credential-registry.js

recognition-registry.js

recognition-renderer.js

## Lifecycle

1. Wait for entitlements:ready

2. Obtain resolver-approved visible credentials

3. Resolve credential definitions

4. Resolve applicable recognition codes

5. Resolve recognition metadata

6. Deduplicate recognitions

7. Invoke renderer

## Recognition Resolution Example

AIPA

↓

UNIVERSITY_CERTIFICATE
TRAINER_CERTIFICATE
UNIVERSITY_BADGE

AAIF

↓

UNIVERSITY_CERTIFICATE

## Change History

v1.1.0

* Added credential-driven recognition resolution
* Added recognition deduplication
* Added lifecycle governance
* Added architectural ownership model

v1.0.0

* Initial governed implementation

===================================================== */

(function () {

"use strict";

console.log(
"[Recognition Service] Loaded v1.1.0"
);

if (
window.__recognitionServiceInitialized === true
) {
return;
}

window.__recognitionServiceInitialized = true;

let initialized = false;

/* =====================================================
   Recognition Resolution

   Purpose
   -----------------------------------------------------
   Builds the recognition model for the current user.

   Recognition eligibility is determined by the
   credential definition stored in:

   AAIU_CREDENTIAL_REGISTRY

   The registry specifies which recognition assets
   belong to each credential.

   Example

   AIPA
      → UNIVERSITY_CERTIFICATE
      → TRAINER_CERTIFICATE
      → UNIVERSITY_BADGE

   AAIA
      → UNIVERSITY_CERTIFICATE
      → TRAINER_CERTIFICATE
      → UNIVERSITY_BADGE

   Future self-paced credentials may expose:

      → UNIVERSITY_CERTIFICATE

   only.

   Governance
   -----------------------------------------------------
   - No API Calls
   - No Authorization
   - No Entitlement Resolution
   - No Rendering

   Returns
   -----------------------------------------------------
   Array<Recognition>

===================================================== */

function buildRecognitions(
  credentials
) {

  const credentialRegistry =
    window.AAIU_CREDENTIAL_REGISTRY || {};

  const recognitionRegistry =
    window.AAIU_RECOGNITION_REGISTRY || {};

  const recognitionMap =
    new Map();

  if (
    !Array.isArray(credentials)
  ) {

    console.warn(
      "[Recognition Service] No credentials supplied"
    );

    return [];

  }

  credentials.forEach(
    function (credential) {

      const credentialCode =
        credential.program_code ||
        credential.credential_type;

        const definition =
        credentialRegistry[
            credentialCode
        ];

      if (
        !definition
      ) {

        console.warn(
            "[Recognition Service] Credential definition not found:",
            credentialCode
            );

        return;

      }

      if (
        !Array.isArray(
          definition.recognitions
        )
      ) {

        console.warn(
          "[Recognition Service] No recognitions configured for:",
          credentialCode
        );

        return;

      }

      definition.recognitions.forEach(
        function (recognitionCode) {

          const recognition =
            recognitionRegistry[
              recognitionCode
            ];

          if (
            !recognition
          ) {

            console.warn(
              "[Recognition Service] Recognition definition not found:",
              recognitionCode
            );

            return;

          }

          /* -----------------------------------------------------
            Deduplication Governance

            Multiple credentials may expose the same
            recognition asset.

            Example

            AAIA
                -> UNIVERSITY_CERTIFICATE

            AIPA
                -> UNIVERSITY_CERTIFICATE

            User should see one certificate asset,
            not duplicates.

            ----------------------------------------------------- */

          recognitionMap.set(
            recognitionCode,
            recognition
          );

        }
      );

    }
  );

  return Array.from(
    recognitionMap.values()
  );

}

/* =====================================================
Recognition Rendering
===================================================== */

function renderRecognitions() {

try {

if (
  typeof window.resolvePortalEntitlements !==
  "function"
) {

  console.error(
    "[Recognition Service] Resolver unavailable"
  );

  return;

}

const entitlementData =
  window.portalEntitlementData || {};

const resolved =
  window.resolvePortalEntitlements({

    ...entitlementData,

    authenticatedUser:
      window.authState?.user ||
      firebase.auth().currentUser ||
      null

  });

const credentials =
  resolved?.visibleCredentials || [];

const recognitions =
  buildRecognitions(
    credentials
  );

console.log(
  `[Recognition Service] Rendering ${recognitions.length} recognition(s)`
);

if (
  typeof window.renderRecognitions !==
  "function"
) {

  console.error(
    "[Recognition Service] Renderer unavailable"
  );

  return;

}

window.renderRecognitions(
  recognitions
);

}

catch (error) {

console.error(
  "[Recognition Service] Render failure",
  error
);

}

}

/* =====================================================
Initialization
===================================================== */

function initialize() {

if (initialized) {
return;
}

initialized = true;

console.log(
"[Recognition Service] Initializing"
);

renderRecognitions();

}

document.addEventListener(
"entitlements:ready",
initialize
);

})();
