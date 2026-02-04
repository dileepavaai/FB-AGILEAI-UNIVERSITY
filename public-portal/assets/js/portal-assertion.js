/* =========================================================
   Portal Assertions — Phase-7.3 (CANONICAL, EXTENDED SAFE)
   PURPOSE:
   - Bind resolved entitlements to UI
   - Populate Executive validity date
   - Observe (not enforce) auth presence
   - Signal readiness to routing layer
========================================================= */

(function () {
  "use strict";

  console.log("[Portal Assertions] Initializing");

  function formatDate(ts) {
    try {
      const d = ts?.toDate?.() || new Date(ts);
      if (isNaN(d.getTime())) return "—";

      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  }

  function daysRemaining(ts) {
    try {
      const d = ts?.toDate?.() || new Date(ts);
      const diff = Math.ceil(
        (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return diff > 0 ? `${diff} days remaining` : "";
    } catch {
      return "";
    }
  }

  function applyExecutive(entitlements) {
    const validUntil = entitlements?.executive?.validUntil;

    const dateEl = document.getElementById("exec-valid-until");
    const daysEl = document.getElementById("exec-days-remaining");

    if (!dateEl) {
      console.warn("[Portal Assertions] exec-valid-until not found");
      return;
    }

    dateEl.textContent = validUntil
      ? formatDate(validUntil)
      : "—";

    if (daysEl && validUntil) {
      daysEl.textContent = daysRemaining(validUntil);
    }
  }

  function observeAuth() {
    try {
      if (
        window.firebase &&
        firebase.auth &&
        typeof firebase.auth === "function"
      ) {
        const user = firebase.auth().currentUser || null;

        // Informational only — NOT used for gating
        window.portalState.authObserved = true;
        window.portalState.authUserPresent = !!user;
      }
    } catch {
      // Auth is optional here; never block assertions
      window.portalState.authObserved = false;
    }
  }

  function run() {
    if (!window.portalState?.entitlements) {
      console.warn("[Portal Assertions] Entitlements not ready");
      return;
    }

    applyExecutive(window.portalState.entitlements);

    observeAuth();

    // Canonical readiness signal (LOCKED)
    window.portalState.entitlementsLoaded = true;

    console.log("[Portal Assertions] UI bound successfully");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const wait = setInterval(() => {
      if (window.portalState?.entitlements) {
        clearInterval(wait);
        run();
      }
    }, 50);
  });
})();
