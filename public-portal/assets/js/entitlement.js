/* =========================================================
   Agile AI University
   Public Portal

   File      : entitlement.js
   Component : User Entitlement Resolution
   Version   : Phase-6.8
   Status    : ACTIVE

   Purpose
   ----------------------------------------------------------
   • Resolve authenticated learner entitlements
   • Reconcile authenticated learner identity before
     entitlement resolution
   • Publish deterministic shared portal entitlement state
   • Preserve existing executive and trial entitlement logic
   • Preserve Firebase authentication as identity authority

   Identity Architecture
   ----------------------------------------------------------

   Firebase Authentication
          ↓
   __AAIU_AUTH_READY__
          ↓
   Firebase ID Token
          ↓
   Automatic Identity Reconciliation
          ↓
   Credential Ownership
          ↓
   Entitlement Resolution
          ↓
   Shared Portal State

   Governance
   ----------------------------------------------------------
   • Firebase Authentication remains identity authority.
   • Browser-supplied UID is never used for reconciliation.
   • Browser-supplied email is never used for reconciliation.
   • The Firebase ID token is the only identity credential
     sent to the reconciliation backend.
   • Reconciliation occurs before entitlement resolution.
   • Reconciliation failure must not prevent the existing
     entitlement resolver from operating.
   • Existing entitlement API remains authoritative.
   • Existing entitlement resolution rules are preserved.
   • Existing portal event contracts are preserved.
   • No Firestore writes occur directly from this module.
   • Credential ownership writes remain backend-governed.

   API Authorities
   ----------------------------------------------------------
   Identity Reconciliation:
   POST /api/v1/identity/reconcile

   Entitlement Resolution:
   GET /portal/resolve-entitlements

   Change History
   ----------------------------------------------------------

   Phase-6.8
   • Added automatic authenticated learner reconciliation
   • Added reconciliation before entitlement resolution
   • Added Firebase-token authenticated reconciliation call
   • Added fail-soft reconciliation behaviour
   • Added reconciliation lifecycle events
   • Added reconciliation result cache
   • Preserved locked entitlement endpoint
   • Preserved existing entitlement resolution behaviour
   • Preserved existing portal event contracts
   • No browser-authoritative UID/email introduced

   Phase-6.7
   • Replaced authState.token dependency
   • Uses Firebase getIdToken() directly
   • Prevents stale or missing token issues
   • Aligns entitlement resolution with Firebase
     authentication lifecycle

   Phase-6.6
   • API-driven entitlement resolution
   • Deterministic event emission
   • Resolver-led architecture

========================================================= */

(function () {

    "use strict";


    /* =====================================================
       MODULE IDENTITY
    ===================================================== */

    const MODULE_NAME =
        "Entitlement";

    const MODULE_VERSION =
        "Phase-6.8";


    /* =====================================================
       SINGLE GLOBAL STATE
       AUTHORITATIVE ENTITLEMENT STATE
    ===================================================== */

    window.execEntitlement = {

        checked:
            false,

        entitled:
            false,

        student:
            false,

        expired:
            false,

        email:
            null,

        plan:
            null,

        source:
            null,

        validUntil:
            null

    };


    /* =====================================================
       RECONCILIATION STATE

       Read-only browser representation of the most recent
       reconciliation attempt.

       This object is informational only.

       It is NOT an identity authority.
    ===================================================== */

    window.__AAIU_IDENTITY_RECONCILIATION__ =
        Object.freeze({

            checked:
                false,

            ok:
                false,

            status:
                "pending",

            result:
                null

        });


    /* =====================================================
       VALUE HELPERS
    ===================================================== */

    function normalizeString(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(
            value
        )
            .trim();

    }


    function normalizeEmail(
        value
    ) {

        return normalizeString(
            value
        )
            .toLowerCase();

    }


    /* =====================================================
       PORTAL EVENT PUBLISHER
    ===================================================== */

    function publishPortalEvent(
        eventName,
        detail = {}
    ) {

        try {

            document.dispatchEvent(
                new CustomEvent(
                    eventName,
                    {
                        detail
                    }
                )
            );

        }
        catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to publish ${eventName}.`,
                error
            );

        }

    }


    /* =====================================================
       FINALIZE + EMIT
       ORDER GUARANTEED
    ===================================================== */

    function finalizeAndEmit(
        portalData,
        authenticatedUser = null
    ) {

        console.assert(
            Array.isArray(
                portalData.credentials
            ),
            "[Entitlement Invariant] credentials missing at finalize"
        );


        window.portalEntitlementData =
            Object.freeze({

                ...portalData

            });


        window.execEntitlement.checked =
            true;


        /* =================================================
           GOVERNED RESOLUTION
        ================================================= */

        if (
            typeof window.resolvePortalEntitlements ===
                "function"
        ) {

            const resolvedState =
                window.resolvePortalEntitlements({

                    executiveEntitlement:
                        portalData
                            .executiveEntitlement,

                    userEntitlements:
                        portalData
                            .userEntitlements,

                    credentials:
                        portalData
                            .credentials,

                    authenticatedUser:
                        authenticatedUser

                });


            if (
                typeof window.publishPortalEntitlements ===
                    "function"
            ) {

                window.publishPortalEntitlements(
                    resolvedState
                );


                console.info(
                    "[Entitlement] Shared portal state published"
                );

            }

        }


        /* =================================================
           ENTITLEMENT READY EVENT
        ================================================= */

        document.dispatchEvent(
            new Event(
                "entitlements:ready"
            )
        );


        /* =================================================
           CREDENTIAL READY EVENT
        ================================================= */

        if (
            Array.isArray(
                portalData.credentials
            ) &&
            portalData.credentials.length >
                0
        ) {

            document.dispatchEvent(
                new Event(
                    "credentials:ready"
                )
            );

        }

    }


    /* =====================================================
       API ENDPOINTS
    ===================================================== */


    /* -----------------------------------------------------
       EXISTING ENTITLEMENT ENDPOINT
       LOCKED

       Do not redirect this endpoint as part of identity
       reconciliation.
    ----------------------------------------------------- */

    const RESOLVE_API =
        window.AAIU_CONFIG
            ?.ENTITLEMENT_API ||
        "https://cloud-run-portal-458881040066.asia-south1.run.app/portal/resolve-entitlements";


    /* -----------------------------------------------------
       AUTOMATIC IDENTITY RECONCILIATION ENDPOINT

       Backend:
       aaiu-cloudrun-backend

       Browser identity values are NOT submitted.

       Firebase ID token is the sole authentication and
       identity input.
    ----------------------------------------------------- */

    const IDENTITY_RECONCILIATION_API =
        window.AAIU_CONFIG
            ?.IDENTITY_RECONCILIATION_API ||
        "https://aaiu-cloudrun-backend-458881040066.asia-south1.run.app/api/v1/identity/reconcile";


    /* =====================================================
       RECONCILIATION STATE PUBLISHER
    ===================================================== */

    function publishReconciliationState(
        state
    ) {

        const safeState =
            Object.freeze({

                checked:
                    Boolean(
                        state?.checked
                    ),

                ok:
                    Boolean(
                        state?.ok
                    ),

                status:
                    normalizeString(
                        state?.status
                    ) ||
                    "unknown",

                result:
                    state?.result ||
                    null

            });


        window.__AAIU_IDENTITY_RECONCILIATION__ =
            safeState;


        publishPortalEvent(
            "portal:identity-reconciliation-ready",
            safeState
        );

    }


    /* =====================================================
       AUTOMATIC IDENTITY RECONCILIATION

       Security
       -----------------------------------------------------
       • No UID is sent in request body.
       • No email is sent in request body.
       • Backend derives UID/email from verified Firebase
         authentication token.

       Failure Model
       -----------------------------------------------------
       Reconciliation is fail-soft.

       A transient reconciliation service failure must not
       disable the existing portal entitlement lifecycle.
    ===================================================== */

    async function reconcileAuthenticatedIdentity(
        token
    ) {

        const normalizedToken =
            normalizeString(
                token
            );


        if (
            !normalizedToken
        ) {

            publishReconciliationState({

                checked:
                    true,

                ok:
                    false,

                status:
                    "token_unavailable",

                result:
                    null

            });


            return null;

        }


        publishPortalEvent(
            "portal:identity-reconciliation-started",
            {
                version:
                    MODULE_VERSION
            }
        );


        console.info(
            `[${MODULE_NAME}] Automatic identity reconciliation started.`
        );


        try {

            const response =
                await fetch(
                    IDENTITY_RECONCILIATION_API,
                    {

                        method:
                            "POST",

                        headers: {

                            Authorization:
                                `Bearer ${normalizedToken}`

                        }

                    }
                );


            let payload =
                null;


            try {

                payload =
                    await response.json();

            }
            catch (
                parseError
            ) {

                payload =
                    null;

            }


            if (
                !response.ok
            ) {

                const failureCode =
                    normalizeString(
                        payload?.code
                    ) ||
                    `HTTP_${response.status}`;


                console.warn(
                    `[${MODULE_NAME}] Identity reconciliation did not complete.`,
                    {
                        status:
                            response.status,

                        code:
                            failureCode
                    }
                );


                publishReconciliationState({

                    checked:
                        true,

                    ok:
                        false,

                    status:
                        failureCode,

                    result:
                        payload

                });


                /*
                 * Fail-soft.
                 *
                 * Existing entitlement resolution must still
                 * continue.
                 */

                return payload;

            }


            const reconciliation =
                payload?.reconciliation ||
                null;


            const reconciliationStatus =
                normalizeString(
                    reconciliation?.status
                ) ||
                "completed";


            publishReconciliationState({

                checked:
                    true,

                ok:
                    true,

                status:
                    reconciliationStatus,

                result:
                    reconciliation

            });


            console.info(
                `[${MODULE_NAME}] Identity reconciliation completed.`,
                reconciliation
            );


            publishPortalEvent(
                "portal:identity-reconciled",
                {

                    status:
                        reconciliationStatus,

                    reconciliation

                }
            );


            return payload;

        }
        catch (
            error
        ) {

            /*
             * Reconciliation must remain isolated from the
             * existing entitlement resolver.
             */

            console.warn(
                `[${MODULE_NAME}] Identity reconciliation service unavailable.`,
                error
            );


            publishReconciliationState({

                checked:
                    true,

                ok:
                    false,

                status:
                    "service_unavailable",

                result:
                    null

            });


            publishPortalEvent(
                "portal:identity-reconciliation-failed",
                {

                    message:
                        normalizeString(
                            error?.message
                        )

                }
            );


            return null;

        }

    }


    /* =====================================================
       AUTH READINESS
       SINGLE SOURCE OF TRUTH
    ===================================================== */

    if (
        !(
            window.__AAIU_AUTH_READY__ instanceof
            Promise
        )
    ) {

        console.error(
            "[Entitlement] Auth readiness contract missing"
        );


        publishReconciliationState({

            checked:
                true,

            ok:
                false,

            status:
                "authentication_readiness_missing",

            result:
                null

        });


        finalizeAndEmit(
            {

                checked:
                    true,

                email:
                    null,

                executiveEntitlement:
                    null,

                userEntitlements:
                    null,

                credentials:
                    []

            },
            null
        );


        return;

    }


    /* =====================================================
       AUTHENTICATED ENTITLEMENT LIFECYCLE
    ===================================================== */

    window.__AAIU_AUTH_READY__
        .then(
            async (
                authState
            ) => {

                const user =
                    authState?.user;


                /* =========================================
                   RESET AUTHORITATIVE FLAGS
                   PER AUTHENTICATION CYCLE
                ========================================= */

                Object.assign(
                    window.execEntitlement,
                    {

                        checked:
                            false,

                        entitled:
                            false,

                        student:
                            false,

                        expired:
                            false,

                        email:
                            null,

                        plan:
                            null,

                        source:
                            null,

                        validUntil:
                            null

                    }
                );


                /* =========================================
                   UNAUTHENTICATED
                ========================================= */

                if (
                    !user
                ) {

                    window.execEntitlement.source =
                        "none";


                    publishReconciliationState({

                        checked:
                            true,

                        ok:
                            false,

                        status:
                            "not_authenticated",

                        result:
                            null

                    });


                    finalizeAndEmit(
                        {

                            checked:
                                true,

                            email:
                                null,

                            executiveEntitlement:
                                null,

                            userEntitlements:
                                null,

                            credentials:
                                []

                        },
                        null
                    );


                    return;

                }


                /* =========================================
                   AUTHENTICATED
                ========================================= */

                try {

                    const email =
                        normalizeEmail(
                            user.email
                        ) ||
                        null;


                    window.execEntitlement.email =
                        email;


                    /* =====================================
                       FIREBASE ID TOKEN

                       Phase-6.7 authority preserved.

                       One fresh Firebase token is obtained
                       and reused for:

                       1. identity reconciliation
                       2. entitlement resolution
                    ===================================== */

                    const token =
                        await user.getIdToken();


                    if (
                        !token
                    ) {

                        throw new Error(
                            "Unable to obtain Firebase ID token"
                        );

                    }


                    /* =====================================
                       PHASE-6.8
                       AUTOMATIC IDENTITY RECONCILIATION

                       Important:
                       This completes before entitlement
                       resolution is requested.

                       This allows a newly reconciled
                       credential to become visible during
                       the same portal authentication cycle.
                    ===================================== */

                    await reconcileAuthenticatedIdentity(
                        token
                    );


                    /* =====================================
                       EXISTING ENTITLEMENT RESOLUTION
                    ===================================== */

                    console.log(
                        "[ENTITLEMENT API]",
                        RESOLVE_API
                    );


                    const res =
                        await fetch(
                            RESOLVE_API,
                            {

                                method:
                                    "GET",

                                headers: {

                                    Authorization:
                                        `Bearer ${token}`

                                }

                            }
                        );


                    console.log(
                        "[ENTITLEMENT STATUS]",
                        res.status
                    );


                    if (
                        !res.ok
                    ) {

                        throw new Error(
                            `Entitlement API failed (${res.status})`
                        );

                    }


                    const data =
                        await res.json();


                    console.log(
                        "[Entitlement API Response]",
                        JSON.stringify(
                            data,
                            null,
                            2
                        )
                    );


                    /* =====================================
                       PROGRAM DEFINITIONS
                       READ-ONLY CACHE
                    ===================================== */

                    window.__AAIU_PROGRAMS__ =
                        Object.freeze(
                            data.programs ||
                            {}
                        );


                    console.log(
                        "[User Entitlements]",
                        data.userEntitlements
                    );


                    const executive =
                        data.executiveEntitlement;


                    const userEntitlements =
                        data.userEntitlements;


                    const credentials =
                        Array.isArray(
                            data.credentials
                        )
                            ? data.credentials
                            : [];


                    /* =====================================
                       PAID EXECUTIVE
                       ALWAYS WINS
                    ===================================== */

                    if (
                        executive &&
                        executive.entitled ===
                            true
                    ) {

                        window.execEntitlement.entitled =
                            true;

                        window.execEntitlement.student =
                            true;

                        window.execEntitlement.plan =
                            "executive_paid";

                        window.execEntitlement.source =
                            "executiveEntitlements";

                        window.execEntitlement.validUntil =
                            executive.validUntil
                                ? new Date(
                                    executive.validUntil
                                )
                                : null;


                        finalizeAndEmit(
                            {

                                checked:
                                    true,

                                email,

                                executiveEntitlement: {

                                    ...executive,

                                    validUntil:
                                        window
                                            .execEntitlement
                                            .validUntil

                                },

                                userEntitlements:
                                    null,

                                credentials

                            },
                            user
                        );


                        console.log(
                            "[Entitlement] Resolved (PAID)",
                            window.execEntitlement
                        );


                        return;

                    }


                    /* =====================================
                       TRIAL / USER ENTITLEMENTS
                    ===================================== */

                    if (
                        userEntitlements
                    ) {

                        const now =
                            Date.now();


                        const trialActive =

                            userEntitlements.plan ===
                                "trial" &&

                            userEntitlements
                                .trial_end
                                ?.toMillis &&

                            now <=
                                userEntitlements
                                    .trial_end
                                    .toMillis();


                        window.execEntitlement.plan =
                            userEntitlements.plan;


                        window.execEntitlement.source =
                            "user_entitlements";


                        window.execEntitlement.student =

                            trialActive &&

                            userEntitlements
                                .entitlements
                                ?.student_portal ===
                                true;


                        window.execEntitlement.entitled =

                            trialActive &&

                            userEntitlements
                                .entitlements
                                ?.executive_insight ===
                                true;


                        window.execEntitlement.expired =

                            userEntitlements.plan ===
                                "trial" &&

                            !trialActive;

                    }


                    /* =====================================
                       FINAL STANDARD RESOLUTION
                    ===================================== */

                    finalizeAndEmit(
                        {

                            checked:
                                true,

                            email,

                            executiveEntitlement:
                                null,

                            userEntitlements,

                            credentials

                        },
                        user
                    );


                    console.log(
                        "[Entitlement] Resolved",
                        window.execEntitlement
                    );

                }
                catch (
                    err
                ) {

                    /* =====================================
                       ENTITLEMENT FAILURE

                       Existing fail-safe behaviour
                       preserved.
                    ===================================== */

                    console.error(
                        "🚨 ENTITLEMENT FAILURE 🚨",
                        err
                    );


                    finalizeAndEmit(
                        {

                            checked:
                                true,

                            email:
                                normalizeEmail(
                                    user?.email
                                ) ||
                                null,

                            executiveEntitlement:
                                null,

                            userEntitlements:
                                null,

                            credentials:
                                []

                        },
                        user
                    );

                }

            }
        )
        .catch(
            error => {

                /*
                 * Defensive protection around the auth
                 * readiness Promise itself.
                 */

                console.error(
                    `[${MODULE_NAME}] Authentication readiness failed.`,
                    error
                );


                publishReconciliationState({

                    checked:
                        true,

                    ok:
                        false,

                    status:
                        "authentication_failed",

                    result:
                        null

                });


                finalizeAndEmit(
                    {

                        checked:
                            true,

                        email:
                            null,

                        executiveEntitlement:
                            null,

                        userEntitlements:
                            null,

                        credentials:
                            []

                    },
                    null
                );

            }
        );


})();