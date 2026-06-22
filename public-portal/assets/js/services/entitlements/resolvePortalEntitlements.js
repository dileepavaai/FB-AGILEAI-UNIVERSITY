/**
 * resolvePortalEntitlements
 * ---------------------------------------
 * Pure, deterministic entitlement resolver.
 * NO side effects.
 * NO Firestore access.
 * NO UI logic.
 *
 * Single source of truth for:
 * - Executive Insight precedence
 * - Portal access
 * - Credential visibility & normalization
 *
 * 🔒 GOVERNANCE:
 * - Resolver explicitly controls which credentials are visible
 * - Semantic fields must be passed through without inference
 * - UI layers must never infer or default credential meaning
 */

window.resolvePortalEntitlements = function ({
  executiveEntitlement,
  userEntitlements,
  credentials,
  authenticatedUser
}) {
  const email = normalizeEmail(authenticatedUser?.email);

  /* =====================================================
     EXECUTIVE INSIGHT — ABSOLUTE PRECEDENCE (LOCKED)
     ===================================================== */

  const hasExecutiveInsight =
    executiveEntitlement &&
    executiveEntitlement.entitled === true;

  if (hasExecutiveInsight) {
    return {
      executiveInsight: {
        hasAccess: true,
        validUntil: executiveEntitlement.validUntil || null
      },

      portalAccess: {
        hasAccess: true,
        type: "executive"
      },

      visibleCredentials: normalizeVisibleCredentials(
        credentials,
        email
      ),

      uiState: {
        suppressUpgradeCTAs: true,
        suppressNoAccessMessages: true
      }
    };
  }

  /* =====================================================
   PORTAL ACCESS RESOLUTION
   Phase-1 Simplification

   Portal access may originate from:

   - Executive entitlement
   - Student portal entitlement
   - Existing credential ownership (alumni)

   Future:
   - Enrollments
   - Reports
   - Memberships
   ===================================================== */

  /* =====================================================
   STUDENT / TRIAL PORTAL ACCESS (LOCKED)
   ===================================================== */

let portalAccess = {
  hasAccess: false,
  type: null
};

if (
  userEntitlements?.entitlements?.student_portal === true
) {

  portalAccess = {
    hasAccess: true,
    type: "trial"
  };

}

console.log(
  "[Portal Access Resolution]",
  {
    studentPortal:
      userEntitlements?.entitlements?.student_portal === true,

    portalAccess
  }
);

  return {
    executiveInsight: {
      hasAccess: false,
      validUntil: null
    },

    portalAccess,

    visibleCredentials:
      normalizeVisibleCredentials(
        credentials,
        email
      ),

    uiState: {
      suppressUpgradeCTAs: false,
      suppressNoAccessMessages: portalAccess.hasAccess
    }
  };
};

/* =====================================================
   🔍 OPTIONAL ENTITLEMENT PUBLISHER (READ-ONLY)
   ===================================================== */

/**
 * 🔒 GOVERNANCE:
 * - This function is NOT the resolver
 * - It introduces NO new logic
 * - It merely exposes the already-resolved output
 * - Resolver purity is preserved
 *
 * Intended for:
 * - UI rendering layers
 * - Debugging / inspection
 * - Non-inferential read-only access
 */

window.publishPortalEntitlements = function (entitlements) {
  if (!entitlements || typeof entitlements !== "object") {
    console.warn(
      "[Entitlement Publish Skipped] Invalid entitlement payload"
    );
    return;
  }

  window.__AAIU_ENTITLEMENTS__ = Object.freeze(entitlements);

  console.info(
    "[Entitlements Published] Resolver output exposed (read-only)"
  );
};

/* =====================================================
   NORMALIZE & FILTER VISIBLE CREDENTIALS (CANONICAL)
   ===================================================== */

function normalizeVisibleCredentials(credentials, email) {
  if (!Array.isArray(credentials) || !email) return [];

  const ALLOWED_PROGRAM_CODES = [
    "AAIA",
    "AIPA",
    "AOP"
  ];

  const normalized = credentials
    .filter(c =>
      c &&
      normalizeEmail(c.email) === email &&
      (c.issued_status === "issued" ||
       c.issued_status === "finalized") &&
      c.program_code &&
      ALLOWED_PROGRAM_CODES.includes(c.program_code)
    )
    .map(c => ({
      // 🔒 REQUIRED PASS-THROUGH (NON-NEGOTIABLE)
      program_code: c.program_code,

      credential_code: c.program_code,
      credential_type: c.credential_type || c.program_code,

      issued_at: c.created_at?.toDate
        ? c.created_at.toDate()
        : c.created_at || null,

      issued_by: c.issued_by || "Agile AI University",
      email: c.email,

      validity: c.validity || null,
      credential_id: c.credential_id || null
    }));

  console.assert(
    normalized.every(c => c.program_code),
    "[Resolver Invariant Violation] program_code missing on visible credential"
  );

  return normalized;
}

/* =====================================================
   EMAIL NORMALIZATION (PURE, GOVERNANCE-SAFE)
   ===================================================== */

function normalizeEmail(email) {
  return typeof email === "string"
    ? email.trim().toLowerCase()
    : null;
}
