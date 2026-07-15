/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : program-service.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Credential Portfolio Stabilization

   Purpose
   ----------------------------------------------------------
   Authoritative read-only service for resolving Agile AI
   University programme definitions and publishing immutable
   programme ViewModels to portal consumers.

   Responsibilities
   ----------------------------------------------------------
   ✓ Normalize programme codes
   ✓ Resolve programme definitions
   ✓ Resolve canonical programme names
   ✓ Resolve available credential assets
   ✓ Resolve programme recommendations
   ✓ Support snake-case and camel-case registry fields
   ✓ Provide safe built-in programme metadata fallbacks
   ✓ Cache resolved programme ViewModels
   ✓ Return immutable programme ViewModels

   Non-Responsibilities
   ----------------------------------------------------------
   ✗ Authentication
   ✗ Authorization
   ✗ Firestore queries
   ✗ Cloud Storage queries
   ✗ Credential visibility decisions
   ✗ Entitlement resolution
   ✗ Eligibility decisions
   ✗ Learning journey resolution
   ✗ Dashboard rendering
   ✗ DOM manipulation
   ✗ HTML generation

   Architectural Position
   ----------------------------------------------------------
   Programme Registry
        ↓
   ProgramService
        ↓
   CredentialService
        ↓
   Credential Renderer
        ↓
   Credential Portfolio / Credential Workspace

   Governance
   ----------------------------------------------------------
   • ProgramService is the portal programme metadata authority.

   • The service is read-only.

   • Programme codes are normalized before lookup.

   • Portal UI must consume programme ViewModels only.

   • External programme registry data takes precedence over
     built-in fallback metadata.

   • Built-in metadata exists only to protect the learner
     experience when the external programme registry is
     unavailable or has not loaded yet.

   • ProgramService never performs network or database access.

   Public API
   ----------------------------------------------------------
   ProgramService.get(programCode)

   ProgramService.getName(programCode)

   ProgramService.getAvailableAssets(programCode)

   ProgramService.has(programCode)

   ProgramService.createUnknownProgram(programCode)

   ProgramService.clearCache()

   Dependencies
   ----------------------------------------------------------
   Optional external registry:

   window.__AAIU_PROGRAMS__

   Supported registry shapes:

   window.__AAIU_PROGRAMS__.AOP

   or

   window.__AAIU_PROGRAMS__["AOP"]

   Supported field aliases:

   program_code / programCode
   program_name / programName
   lifetime_credentials / lifetimeCredentials
   available_assets / availableAssets
   future_program_code / futureProgramCode
   future_program_name / futureProgramName

   Change History
   ----------------------------------------------------------
   v1.1.0

   • Added canonical programme-code normalization
   • Added built-in programme metadata fallbacks
   • Added AOP founding credential programme definition
   • Added support for snake-case and camel-case fields
   • Added safe object and collection normalization
   • Added getName()
   • Added getAvailableAssets()
   • Added has()
   • Strengthened immutable ViewModel construction
   • Added initialization diagnostics
   • Preserved browser-global service architecture

   v1.0.0

   • Initial governed implementation
   • Added programme definition resolution
   • Added programme cache
   • Added immutable programme ViewModels

========================================================== */

(function (window) {

    "use strict";

    const VERSION =
        "1.1.0";


    /* ======================================================
       INITIALIZATION GUARD
    ====================================================== */

    if (
        window.ProgramService &&
        window.ProgramService.version === VERSION
    ) {

        console.log(
            `[Program Service] v${VERSION} already initialized.`
        );

        return;

    }


    /* ======================================================
       CANONICAL FALLBACK REGISTRY

       Governance
       ------------------------------------------------------
       This registry provides identity-safe programme metadata
       when window.__AAIU_PROGRAMS__ is unavailable.

       External registry definitions always take precedence.
    ====================================================== */

    const CANONICAL_PROGRAMS =
        Object.freeze({

            AOP: Object.freeze({

                programCode:
                    "AOP",

                programName:
                    "Agile Outcome Practitioner",

                status:
                    "founding",

                lifetimeCredentials:
                    true,

                availableAssets:
                    Object.freeze({}),

                recommendations:
                    Object.freeze({}),

                futureProgramCode:
                    "AIPA",

                futureProgramName:
                    "Artificial Intelligence Professional Agilist"

            }),

            AIPA: Object.freeze({

                programCode:
                    "AIPA",

                programName:
                    "Artificial Intelligence Professional Agilist",

                status:
                    "active",

                lifetimeCredentials:
                    true,

                availableAssets:
                    Object.freeze({}),

                recommendations:
                    Object.freeze({}),

                futureProgramCode:
                    "AAIP",

                futureProgramName:
                    "Agentic AI Professional"

            }),

            AAIA: Object.freeze({

                programCode:
                    "AAIA",

                programName:
                    "Agile AI Master",

                status:
                    "active",

                lifetimeCredentials:
                    true,

                availableAssets:
                    Object.freeze({}),

                recommendations:
                    Object.freeze({}),

                futureProgramCode:
                    "AIPA",

                futureProgramName:
                    "Artificial Intelligence Professional Agilist"

            }),

            AAIP: Object.freeze({

                programCode:
                    "AAIP",

                programName:
                    "Agentic AI Professional",

                status:
                    "active",

                lifetimeCredentials:
                    true,

                availableAssets:
                    Object.freeze({}),

                recommendations:
                    Object.freeze({}),

                futureProgramCode:
                    "AIAL",

                futureProgramName:
                    "Agile AI Leadership"

            }),

            AIAL: Object.freeze({

                programCode:
                    "AIAL",

                programName:
                    "Agile AI Leadership",

                status:
                    "active",

                lifetimeCredentials:
                    true,

                availableAssets:
                    Object.freeze({}),

                recommendations:
                    Object.freeze({}),

                futureProgramCode:
                    null,

                futureProgramName:
                    null

            }),

            AISD: Object.freeze({

                programCode:
                    "AISD",

                programName:
                    "AI System Design",

                status:
                    "active",

                lifetimeCredentials:
                    true,

                availableAssets:
                    Object.freeze({}),

                recommendations:
                    Object.freeze({}),

                futureProgramCode:
                    null,

                futureProgramName:
                    null

            }),

            AAIM: Object.freeze({

                programCode:
                    "AAIM",

                programName:
                    "Agile AI Management",

                status:
                    "active",

                lifetimeCredentials:
                    true,

                availableAssets:
                    Object.freeze({}),

                recommendations:
                    Object.freeze({}),

                futureProgramCode:
                    null,

                futureProgramName:
                    null

            }),

            AAICC: Object.freeze({

                programCode:
                    "AAICC",

                programName:
                    "Agile AI Coaching and Consulting",

                status:
                    "active",

                lifetimeCredentials:
                    true,

                availableAssets:
                    Object.freeze({}),

                recommendations:
                    Object.freeze({}),

                futureProgramCode:
                    null,

                futureProgramName:
                    null

            }),

            AISL: Object.freeze({

                programCode:
                    "AISL",

                programName:
                    "AI Strategy and Leadership",

                status:
                    "active",

                lifetimeCredentials:
                    true,

                availableAssets:
                    Object.freeze({}),

                recommendations:
                    Object.freeze({}),

                futureProgramCode:
                    null,

                futureProgramName:
                    null

            }),

            AIOL: Object.freeze({

                programCode:
                    "AIOL",

                programName:
                    "AI Operating Leadership",

                status:
                    "active",

                lifetimeCredentials:
                    true,

                availableAssets:
                    Object.freeze({}),

                recommendations:
                    Object.freeze({}),

                futureProgramCode:
                    null,

                futureProgramName:
                    null

            }),

            AIPL: Object.freeze({

                programCode:
                    "AIPL",

                programName:
                    "AI Product Leadership",

                status:
                    "active",

                lifetimeCredentials:
                    true,

                availableAssets:
                    Object.freeze({}),

                recommendations:
                    Object.freeze({}),

                futureProgramCode:
                    null,

                futureProgramName:
                    null

            })

        });


    /* ======================================================
       INTERNAL CACHE
    ====================================================== */

    const programCache =
        new Map();


    /* ======================================================
       NORMALIZATION UTILITIES
    ====================================================== */

    function normalizeProgramCode(
        programCode
    ) {

        if (
            programCode === null ||
            programCode === undefined
        ) {

            return "";

        }

        return String(
            programCode
        )
            .trim()
            .toUpperCase();

    }


    function normalizeText(
        value,
        fallback = ""
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return fallback;

        }

        const normalizedValue =
            String(value).trim();

        return normalizedValue ||
            fallback;

    }


    function normalizeBoolean(
        value,
        fallback = false
    ) {

        if (
            typeof value ===
            "boolean"
        ) {

            return value;

        }

        if (
            value === "true" ||
            value === 1
        ) {

            return true;

        }

        if (
            value === "false" ||
            value === 0
        ) {

            return false;

        }

        return fallback;

    }


    function freezeRecord(
        value
    ) {

        if (
            !value ||
            typeof value !== "object" ||
            Array.isArray(value)
        ) {

            return Object.freeze({});

        }

        return Object.freeze({
            ...value
        });

    }


    /* ======================================================
       EXTERNAL REGISTRY RESOLUTION
    ====================================================== */

    function getExternalRegistry() {

        const registry =
            window.__AAIU_PROGRAMS__;

        if (
            !registry ||
            typeof registry !== "object" ||
            Array.isArray(registry)
        ) {

            return {};

        }

        return registry;

    }


    function getExternalDefinition(
        programCode
    ) {

        const registry =
            getExternalRegistry();

        if (
            registry[programCode] &&
            typeof registry[programCode] ===
                "object"
        ) {

            return registry[programCode];

        }

        const matchedKey =
            Object.keys(registry).find(

                function (key) {

                    return (
                        normalizeProgramCode(
                            key
                        ) === programCode
                    );

                }

            );

        if (!matchedKey) {

            return null;

        }

        const definition =
            registry[matchedKey];

        return (
            definition &&
            typeof definition === "object"
        )
            ? definition
            : null;

    }


    /* ======================================================
       CANONICAL FALLBACK RESOLUTION
    ====================================================== */

    function getCanonicalDefinition(
        programCode
    ) {

        return (
            CANONICAL_PROGRAMS[
                programCode
            ] ||
            null
        );

    }


    /* ======================================================
       VIEWMODEL CREATION
    ====================================================== */

    function createProgramViewModel(
        programCode,
        externalDefinition,
        canonicalDefinition
    ) {

        const external =
            externalDefinition || {};

        const canonical =
            canonicalDefinition || {};

        const resolvedProgramCode =
            normalizeProgramCode(

                external.program_code ||

                external.programCode ||

                canonical.programCode ||

                programCode

            );

        const resolvedProgramName =
            normalizeText(

                external.program_name ||

                external.programName ||

                canonical.programName,

                resolvedProgramCode ||
                    "Unknown Program"

            );

        const availableAssets =
            freezeRecord(

                external.available_assets ||

                external.availableAssets ||

                canonical.availableAssets ||

                {}

            );

        const recommendations =
            freezeRecord(

                external.recommendations ||

                canonical.recommendations ||

                {}

            );

        const viewModel = {

            programCode:
                resolvedProgramCode,

            programName:
                resolvedProgramName,

            status:
                normalizeText(

                    external.status ||

                    canonical.status,

                    canonicalDefinition
                        ? "active"
                        : "unknown"

                ),

            lifetimeCredentials:
                normalizeBoolean(

                    external.lifetime_credentials ??

                    external.lifetimeCredentials,

                    canonical.lifetimeCredentials ===
                        true

                ),

            availableAssets,

            recommendations,

            futureProgramCode:
                normalizeProgramCode(

                    external.future_program_code ||

                    external.futureProgramCode ||

                    canonical.futureProgramCode ||

                    ""

                ) || null,

            futureProgramName:
                normalizeText(

                    external.future_program_name ||

                    external.futureProgramName ||

                    canonical.futureProgramName ||

                    ""

                ) || null

        };

        return Object.freeze(
            viewModel
        );

    }


    /* ======================================================
       UNKNOWN PROGRAM VIEWMODEL
    ====================================================== */

    function createUnknownProgram(
        programCode = ""
    ) {

        const normalizedCode =
            normalizeProgramCode(
                programCode
            );

        return Object.freeze({

            programCode:
                normalizedCode,

            programName:
                normalizedCode ||
                "Unknown Program",

            status:
                "unknown",

            lifetimeCredentials:
                false,

            availableAssets:
                Object.freeze({}),

            recommendations:
                Object.freeze({}),

            futureProgramCode:
                null,

            futureProgramName:
                null

        });

    }


    /* ======================================================
       PROGRAM LOADING
    ====================================================== */

    async function loadProgram(
        programCode
    ) {

        const normalizedCode =
            normalizeProgramCode(
                programCode
            );

        if (!normalizedCode) {

            return createUnknownProgram();

        }

        const externalDefinition =
            getExternalDefinition(
                normalizedCode
            );

        const canonicalDefinition =
            getCanonicalDefinition(
                normalizedCode
            );

        if (
            !externalDefinition &&
            !canonicalDefinition
        ) {

            console.warn(
                "[Program Service] Unknown programme code:",
                normalizedCode
            );

            return createUnknownProgram(
                normalizedCode
            );

        }

        return createProgramViewModel(

            normalizedCode,

            externalDefinition,

            canonicalDefinition

        );

    }


    /* ======================================================
       PUBLIC RESOLUTION API
    ====================================================== */

    async function get(
        programCode
    ) {

        const normalizedCode =
            normalizeProgramCode(
                programCode
            );

        if (!normalizedCode) {

            return createUnknownProgram();

        }

        if (
            programCache.has(
                normalizedCode
            )
        ) {

            return programCache.get(
                normalizedCode
            );

        }

        const program =
            await loadProgram(
                normalizedCode
            );

        programCache.set(
            normalizedCode,
            program
        );

        return program;

    }


    async function getName(
        programCode
    ) {

        const program =
            await get(
                programCode
            );

        return program.programName;

    }


    async function getAvailableAssets(
        programCode
    ) {

        const program =
            await get(
                programCode
            );

        return program.availableAssets;

    }


    function has(
        programCode
    ) {

        const normalizedCode =
            normalizeProgramCode(
                programCode
            );

        if (!normalizedCode) {

            return false;

        }

        return Boolean(

            getExternalDefinition(
                normalizedCode
            ) ||

            getCanonicalDefinition(
                normalizedCode
            )

        );

    }


    /* ======================================================
       CACHE MANAGEMENT
    ====================================================== */

    function clearCache() {

        programCache.clear();

        console.log(
            "[Program Service] Cache cleared."
        );

    }


    /* ======================================================
       PUBLIC SERVICE
    ====================================================== */

    const ProgramService =
        Object.freeze({

            version:
                VERSION,

            get,

            getName,

            getAvailableAssets,

            has,

            createUnknownProgram,

            normalizeProgramCode,

            clearCache

        });


    window.ProgramService =
        ProgramService;


    console.log(
        `[Program Service] Loaded v${VERSION}`
    );

})(window);