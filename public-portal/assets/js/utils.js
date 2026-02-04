/* =====================================================
   Shared UI Utilities — Portal
   SAFE · READ-ONLY · NO BUSINESS LOGIC
   EXTENDED (NON-BREAKING)
   ===================================================== */

(function () {
  "use strict";

  /* =====================================================
     Date Formatting (LOCKED BEHAVIOR)
     ===================================================== */

  /**
   * Formats a date value into executive-friendly format.
   * Output example: 17 Jan 2027
   *
   * @param {string|number|Date|Object} dateValue
   * @returns {string}
   */
  function formatExecDate(dateValue) {
    try {
      const date =
        typeof dateValue?.toDate === "function"
          ? dateValue.toDate() // Firestore Timestamp
          : new Date(dateValue);

      if (isNaN(date.getTime())) return "—";

      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "—";
    }
  }

  /**
   * Calculates remaining days from now until a future date.
   * UI-only helper — derived from validUntil.
   *
   * Output example: 364
   *
   * @param {string|number|Date|Object} dateValue
   * @returns {number|null}
   */
  function getDaysRemaining(dateValue) {
    try {
      const target =
        typeof dateValue?.toDate === "function"
          ? dateValue.toDate() // Firestore Timestamp
          : new Date(dateValue);

      if (isNaN(target.getTime())) return null;

      const now = new Date();
      const diffMs = target.getTime() - now.getTime();

      // Ceil so today counts as 1 day remaining
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return diffDays >= 0 ? diffDays : 0;
    } catch {
      return null;
    }
  }

  /* =====================================================
     String Helpers (UI-SAFE, AUTH-AGNOSTIC)
     ===================================================== */

  /**
   * Normalizes email input for UI usage.
   * - trims whitespace
   * - lowercases
   *
   * @param {string} value
   * @returns {string}
   */
  function normalizeEmail(value) {
    return typeof value === "string"
      ? value.trim().toLowerCase()
      : "";
  }

  /**
   * Lightweight email shape check (UI hint only).
   * NOT a validation or security mechanism.
   *
   * @param {string} value
   * @returns {boolean}
   */
  function isValidEmailLike(value) {
    if (typeof value !== "string") return false;
    return value.includes("@") && value.includes(".");
  }

  /* =====================================================
     Safe Export (Global, Read-only Intent)
     ===================================================== */

  window.formatExecDate = window.formatExecDate || formatExecDate;
  window.getDaysRemaining = window.getDaysRemaining || getDaysRemaining;
  window.normalizeEmail = window.normalizeEmail || normalizeEmail;
  window.isValidEmailLike = window.isValidEmailLike || isValidEmailLike;

})();
