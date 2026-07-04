/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Credential Service

File        : credential-service.js
Version     : 1.0.0
Status      : ACTIVE

Governance  : Portal Governance v1.0

## Purpose

Consumes resolved portal entitlements and renders
visible credentials available to authenticated
and authorized portal users.

## Responsibilities

* Wait for entitlement readiness
* Invoke resolver
* Obtain visible credentials
* Invoke credential renderer
* Handle rendering lifecycle

## Must Never

* Call APIs
* Query Firestore
* Perform Authorization
* Resolve Entitlements
* Filter Credentials
* Modify Entitlement State

## Governance

Authentication
-> portal-auth.js

Entitlements
-> entitlement.js

Resolver
-> resolvePortalEntitlements.js

Authorization
-> portal-authorization.js

Rendering
-> credential-renderer.js

This file is a consumer only.

## Dependencies

resolvePortalEntitlements.js
credential-renderer.js

## Change History

v1.0.0

* Initial governed implementation
* Added lifecycle logging
* Added empty state handling
* Added defensive validation

===================================================== */

(function () {

"use strict";

console.log(
"[Credential Service] Loaded v1.0.0"
);

let initialized = false;

function showErrorState() {

const container =
document.getElementById(
"credentials-container"
);

if (!container) {
return;
}

container.innerHTML = `     <div class="error-state">
      Unable to load credentials.     </div>
  `;
}

function showEmptyState() {

const container =
document.getElementById(
"credentials-container"
);

if (!container) {
return;
}

container.innerHTML = `     <div class="empty-state">
      No credentials available.     </div>
  `;
}

async function renderVisibleCredentials() {

try {

if (
  typeof window.resolvePortalEntitlements !==
  "function"
) {

  console.error(
    "[Credential Service] Resolver not available"
  );

  showErrorState();
  return;
}

const entitlementData =
  window.portalEntitlementData || {};

console.log(
  "[Credential Service] Auth User",
  window.authState?.user ||
  firebase.auth().currentUser
);

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

console.log(
  `[Credential Service] Rendering ${credentials.length} credential(s)`
);

if (credentials.length === 0) {

  console.log(
    "[Credential Service] No visible credentials"
  );

  showEmptyState();
  return;
}

if (
  typeof window.renderCredentials !==
  "function"
) {

  console.error(
    "[Credential Service] Renderer not available"
  );

  showErrorState();
  return;
}

if (

    !window.ProgramService ||

    typeof window.ProgramService.get !==
        "function"

) {

    console.error(

        "[Credential Service] ProgramService not available"

    );

    showErrorState();

    return;

}

const enrichedCredentials = await Promise.all(

    credentials.map(async function (credential) {

        const program =

    credential.program_code

        ? await window.ProgramService.get(
            credential.program_code
        )

        : window.ProgramService.createUnknownProgram();

        return {

            ...credential,

            program

        };

    })

);

window.portalCredentials =
    enrichedCredentials;

} catch (error) {

console.error(
  "[Credential Service] Render failure",
  error
);

showErrorState();

}
}

function initialize() {

if (initialized) {
return;
}

initialized = true;

console.log(
"[Credential Service] Initializing"
);

renderVisibleCredentials();
}

document.addEventListener(
"entitlements:ready",
initialize
);

})();
