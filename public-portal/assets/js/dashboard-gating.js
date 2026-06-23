/* =========================================================
Dashboard Gating — Phase-9.4.1

RESOLVER-LED · AUTHORIZATION-AWARE
FINAL · LOCKED · PRODUCTION-SAFE

PURPOSE

Dashboard Gating is responsible for:

* Consuming authenticated session state
* Consuming entitlement data
* Invoking the entitlement resolver
* Invoking authorization policy
* Rendering dashboard experiences

Dashboard Gating is NOT responsible for:

* Authentication
* Sign In
* Sign Out
* Entitlement Resolution Rules
* Authorization Rules

OWNERSHIP

Authentication

* firebase-init.js
* portal-auth.js

Authorization

* portal-authorization.js

Entitlement Resolution

* resolvePortalEntitlements()

Change History

## Phase-9.4.1

* Added explicit authentication boundary
* Prevented anonymous authorization checks
* Fixed sign-out redirect loop
* Added authorization governance boundary
* Improved audit traceability
* Improved future maintainability

## Phase-9.4.0

* Added authorization-aware portal gating
* Integrated portal-authorization.js
* Added unauthorized.html redirect flow
* Preserved resolver-led architecture
* No sign-out on authorization failure

## Phase-9.3.15

* Resolver-led dashboard gating
* Credential rendering governance
* Executive insight rendering

========================================================= */

(function () {

"use strict";

console.log(
"[Dashboard Gating] Initializing (Resolver-led · Phase-9.4.1)"
);

window.__dashboardGatingRan = true;

let credentialsRendered = false;
let credentialsObserved = false;
let renderAttempted = false;

let lastAuthUid = null;
let resolverInvokedAfterAuth = false;

function evaluateAndRender(reason) {

/* -------------------------------------------------------
   AUTHENTICATION BOUNDARY

   Governance Rule

   Dashboard Gating must never evaluate
   authorization for anonymous users.

   Authentication ownership belongs
   exclusively to:

   - firebase-init.js
   - portal-auth.js

   Dashboard Gating must never:

   - Sign users in
   - Sign users out
   - Redirect users to login
   - Complete authentication flows

   Anonymous users remain on the
   Portal Login experience.

   Dashboard Gating consumes
   authentication state only.

------------------------------------------------------- */

const currentUser =
  firebase?.auth?.()?.currentUser;

if (!currentUser) {

  console.log(
    "[Dashboard Gating] Anonymous session detected - authorization evaluation skipped"
  );

  return;
}

/* -------------------------------------------------------
   ENTITLEMENT DATA READINESS

   Entitlement data must be available
   before resolver execution.

------------------------------------------------------- */

const data = window.portalEntitlementData;

if (!data || data.checked !== true) {

  console.log(
    "[Dashboard Gating] Waiting for entitlement data"
  );

  return;
}

/* -------------------------------------------------------
   RESOLVER GOVERNANCE

   Resolver is the single source of truth
   for portal entitlement state.

------------------------------------------------------- */

if (
  typeof window.resolvePortalEntitlements !==
  "function"
) {

  console.error(
    "[Dashboard Gating] Resolver missing"
  );

  return;
}

window.__resolverInvoked = true;

const state =
  window.resolvePortalEntitlements({
    executiveEntitlement:
      data.executiveEntitlement || null,

    userEntitlements:
      data.userEntitlements || null,

    credentials:
      Array.isArray(data.credentials)
        ? data.credentials
        : [],

    authenticatedUser:
      data.email
        ? { email: data.email }
        : null
  });

/* -------------------------------------------------------
   DIAGNOSTICS

   No business logic.
   No authorization logic.
   No side effects.

------------------------------------------------------- */

console.group(
  `[Dashboard State] (${reason})`
);

console.log(
  "Portal Data",
  data
);

console.log(
  "Resolved State",
  state
);

console.log(
  "Credential Count",
  Array.isArray(data.credentials)
    ? data.credentials.length
    : 0
);

console.log(
  "Visible Credential Count",
  Array.isArray(state.visibleCredentials)
    ? state.visibleCredentials.length
    : 0
);

console.groupEnd();

/* -------------------------------------------------------
   GOVERNED HANDOFF

   Publish resolver output for
   downstream consumers.

------------------------------------------------------- */

if (
  typeof window.publishPortalEntitlements ===
  "function"
) {

  window.publishPortalEntitlements(
    state
  );

}

console.log(
  `[Dashboard Gating] Resolved entitlement state (${reason})`,
  state
);

/* -------------------------------------------------------
   AUTHORIZATION BOUNDARY

   Dashboard Gating consumes the
   authorization decision only.

------------------------------------------------------- */

const authorized =
  typeof window.authorizePortalAccess === "function"
    ? window.authorizePortalAccess(state)
    : true;

console.log(
  "[Dashboard Authorization]",
  authorized
);

if (!authorized) {

  document
    .getElementById(
      "authorizedPortalUI"
    )
    ?.classList.add(
      "hidden"
    );

  document
    .getElementById(
      "noServicesUI"
    )
    ?.classList.remove(
      "hidden"
    );

  console.error(
    "[Dashboard Authorization Failed]",
    {
      reason,
      state,
      entitlementData: data
    }
  );

  console.warn(
    "[Dashboard Gating] No active services available"
  );

  return;
}

console.log(
  "[Dashboard Gating] Access granted"
);
document
  .getElementById(
    "authorizedPortalUI"
  )
  ?.classList.remove(
    "hidden"
  );

  document
  .getElementById(
    "noServicesUI"
  )
  ?.classList.add(
    "hidden"
  );

/* -------------------------------------------------------
   INVARIANT CHECKS

------------------------------------------------------- */

console.assert(
  !Array.isArray(
    state.visibleCredentials
  ) ||
  state.visibleCredentials.every(
    c =>
      c &&
      typeof c.program_code ===
        "string"
  ),
  "[Dashboard Gating Invariant] visibleCredentials missing program_code"
);

/* -------------------------------------------------------
   EXECUTIVE INSIGHT RENDERING

------------------------------------------------------- */

const execSection =
  document.getElementById(
    "exec-insight-section"
  );

const validUntilRow =
  document.getElementById(
    "exec-valid-until-row"
  );

const validUntilEl =
  document.getElementById(
    "exec-valid-until"
  );

const daysRemainingEl =
  document.getElementById(
    "exec-days-remaining"
  );

if (
  state.executiveInsight?.hasAccess ===
  true
) {

  execSection?.classList.remove(
    "hidden"
  );

  validUntilRow?.classList.remove(
    "hidden"
  );

  const raw =
    state.executiveInsight.validUntil;

  const validUntilDate =
    raw?.toDate?.() ||
    (raw ? new Date(raw) : null);

  if (validUntilEl) {

    validUntilEl.textContent =
      validUntilDate
        ? validUntilDate.toLocaleDateString()
        : "—";

  }

  if (
    daysRemainingEl &&
    validUntilDate
  ) {

    const daysRemaining =
      Math.max(
        0,
        Math.ceil(
          (
            validUntilDate -
            new Date()
          ) / 86400000
        )
      );

    daysRemainingEl.textContent =
      `(${daysRemaining} days remaining)`;

  }

} else {

  validUntilRow?.classList.add(
    "hidden"
  );

}

/* -------------------------------------------------------
   CREDENTIAL VISIBILITY

------------------------------------------------------- */

if (
  Array.isArray(
    state.visibleCredentials
  ) &&
  state.visibleCredentials.length > 0
) {

  document
    .getElementById(
      "student-dashboard-section"
    )
    ?.classList.remove(
      "hidden"
    );

}

/* -------------------------------------------------------
   CREDENTIAL RENDERING

------------------------------------------------------- */

if (
  !credentialsRendered &&
  Array.isArray(
    state.visibleCredentials
  ) &&
  state.visibleCredentials.length > 0 &&
  typeof window.renderCredentials ===
    "function"
) {

  const container =
    document.getElementById(
      "credentials-container"
    );

  if (!container) {
    return;
  }

  renderAttempted = true;
  credentialsRendered = true;

  console.log(
    "[Dashboard Gating] Rendering credentials:",
    state.visibleCredentials.length
  );

  window.renderCredentials(
    state.visibleCredentials
  );

}

if (
  renderAttempted &&
  Array.isArray(
    state.visibleCredentials
  ) &&
  state.visibleCredentials.length > 0
) {

  console.assert(
    credentialsObserved ||
    credentialsRendered,
    "[BOOT-INTEGRITY] Credentials present but never observed or rendered"
  );

}

console.log(
  "[Dashboard Gating] Evaluation complete"
);

}

if (
window.__AAIU_AUTH_READY__
instanceof Promise
) {

window.__AAIU_AUTH_READY__.then(
  state => {

    const user = state?.user;

    if (!user) {
      return;
    }

    if (
      user.uid === lastAuthUid &&
      resolverInvokedAfterAuth
    ) {
      return;
    }

    lastAuthUid = user.uid;
    resolverInvokedAfterAuth = true;

    evaluateAndRender(
      "auth-ready"
    );

  }
);

}

document.addEventListener(
"entitlements:ready",
() => {
evaluateAndRender(
"entitlements"
);
}
);

document.addEventListener(
"credentials:ready",
() => {

  credentialsObserved = true;
  credentialsRendered = false;

  evaluateAndRender(
    "credentials"
  );

}

);

document.addEventListener(
"DOMContentLoaded",
() => {
evaluateAndRender("dom");
}
);

})();