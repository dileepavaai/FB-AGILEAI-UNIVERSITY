/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Recognition Service

File        : recognition-service.js
Version     : 1.0.0
Status      : ACTIVE

Governance  : Recognition Governance v1.0

Purpose
-------------------------------------------------------
Consumes entitlement output and renders
recognitions available to portal users.

Responsibilities
-------------------------------------------------------

* Wait for entitlement readiness
* Consume entitlement payload
* Build recognition model
* Invoke recognition renderer

Must Never
-------------------------------------------------------

* Call APIs
* Query Firestore
* Perform Authorization
* Resolve Entitlements
* Render UI
* Modify Entitlement State

Governance
-------------------------------------------------------

Entitlements
-> entitlement.js

Resolver
-> resolvePortalEntitlements.js

Rendering
-> recognition-renderer.js

This file is a consumer only.

===================================================== */

(function () {

"use strict";

console.log(
  "[Recognition Service] Loaded v1.0.0"
);

let initialized = false;

function buildRecognitions(
  credentials
) {

  const registry =
    window.AAIU_RECOGNITION_REGISTRY || {};

  const recognitions = [];

  if (
    Array.isArray(credentials) &&
    credentials.length > 0
  ) {

    if (
      registry.UNIVERSITY_CERTIFICATE
    ) {

      recognitions.push(
        registry.UNIVERSITY_CERTIFICATE
      );

    }

  }

  return recognitions;

}

function renderRecognitions() {

  try {

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
        "[Recognition Service] Renderer not available"
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