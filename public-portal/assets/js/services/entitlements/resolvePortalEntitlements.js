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

      console.log(
      "[Resolver Input]",
      {
        authenticatedUser,
        userEntitlements,
        credentials,
        email
      }
    );

  /* =====================================================
   EXECUTIVE INSIGHT — ABSOLUTE PRECEDENCE (LOCKED)
   ===================================================== */

const hasExecutiveInsight =
    executiveEntitlement &&
    executiveEntitlement.entitled === true;

if (hasExecutiveInsight) {

    const visibleCredentials =
        normalizeVisibleCredentials(
            credentials,
            email
        );

    const learningJourney =
        createEmptyLearningJourney();

    return {

        executiveInsight: {
            hasAccess: true,
            validUntil:
                executiveEntitlement.validUntil || null
        },

        portalAccess: {
            hasAccess: true,
            type: "executive"
        },

        visibleCredentials,

        learningJourney,

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

const visibleCredentials =
  normalizeVisibleCredentials(
    credentials,
    email
  );

/* =====================================================
   LEARNING JOURNEY
   Foundation Placeholder
   -----------------------------------------------------
   NOTE:
   Replaced by buildLearningJourney() during Sprint 2
   integration once the Learning Services layer is
   connected to the resolver.
   ===================================================== */

const learningJourney =
    createEmptyLearningJourney();

let portalAccess = {
  hasAccess: false,
  type: null
};

/* Student Portal Entitlement */

if (
  userEntitlements?.entitlements?.student_portal === true
) {
  portalAccess = {
    hasAccess: true,
    type: "student"
  };
}

/* Alumni Access */

else if (
  visibleCredentials.length > 0
) {
  portalAccess = {
    hasAccess: true,
    type: "alumni"
  };
}

console.log(
  "[Portal Access Resolution]",
  {
    studentPortal:
      userEntitlements?.entitlements?.student_portal === true,

    visibleCredentialCount:
      visibleCredentials.length,

    portalAccess
  }
);

  return {
  executiveInsight: {
    hasAccess: false,
    validUntil: null
  },

  portalAccess,

  visibleCredentials,

  learningJourney,

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

    if (!Array.isArray(credentials) || !email) {
        return [];
    }

    const ALLOWED_PROGRAM_CODES = [
        "AAIA",
        "AIPA",
        "AOP"
    ];

    console.log(
        "[Resolver Raw Credential]",
        credentials?.[0]
    );

    const normalized = credentials

        .filter(c =>

            c &&

            normalizeEmail(c.email) === email &&

            (
                c.issued_status === "issued" ||
                c.issued_status === "finalized"
            ) &&

            c.program_code &&

            ALLOWED_PROGRAM_CODES.includes(
                c.program_code
            )

        )

        .map(c => ({

            /* ==========================================
               Canonical Credential Identity
               ========================================== */

            program_code:
                c.program_code,

            credential_code:
                c.credential_code ||
                c.program_code,

            credential_type:
                c.credential_type ||
                c.program_code,

            credential_id:
                c.credential_id || null,

            /* ==========================================
               Available Recognition Assets
               ========================================== */

            available_assets:

                (
                    c.available_assets &&
                    typeof c.available_assets === "object"
                )

                    ? {

                        universityCertificate:
                            c.available_assets.universityCertificate === true,

                        trainerCertificate:
                            c.available_assets.trainerCertificate === true,

                        digitalBadge:
                            c.available_assets.digitalBadge === true,

                        recognitionAsset:
                            c.available_assets.recognitionAsset === true

                    }

                    : {

                        universityCertificate: false,

                        trainerCertificate: false,

                        digitalBadge: false,

                        recognitionAsset: false

                    },

            /* ==========================================
               Credential Holder
               ========================================== */

            full_name:
                c.full_name ||
                c.learner_name ||
                c.name ||
                null,

            email:
                c.email || null,

            /* ==========================================
               Issuance Information
               ========================================== */

            issued_at:

                c.created_at?.toDate

                    ? c.created_at.toDate()

                    : c.created_at || null,

            issued_by:
                c.issued_by ||
                "Agile AI University",

            validity:
                c.validity ||
                "Lifetime"

        }));

    console.assert(

        normalized.every(
            c => c.program_code
        ),

        "[Resolver Invariant Violation] program_code missing on visible credential"

    );

    console.log(
            "[Resolver Normalized Credential]",
            normalized[0]
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

function createEmptyLearningJourney() {

    return {

        completedPrograms: [],

        relationships: [],

        progression: {

            current: [],

            future: [],

            opportunities: []

        },

        bridgePrograms: [],

        recommendations: [],

        summary: {

            completedProgramCount: 0,

            recommendationCount: 0,

            bridgeProgramCount: 0

        }

    };

}
