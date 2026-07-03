/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : program-service.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 3

   Purpose
   ----------------------------------------------------------
   Program Definition Service

   Responsibilities

   ✓ Resolve Program Definitions
   ✓ Return Program Metadata
   ✓ Resolve Program Name
   ✓ Resolve Available Assets
   ✓ Return immutable Program ViewModel

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore Queries
   ✗ Dashboard Rendering
   ✗ DOM Manipulation
   ✗ HTML Generation
   ✗ Eligibility Decisions
   ✗ Learning Journey

   Governance

   • Program Authority
   • Read-only Service
   • Single Responsibility
   • Resolver First
   • Dashboard consumes ViewModel only

========================================================== */

(function (window) {

    "use strict";

    const ProgramService = {

        /* ==================================================
           PROGRAM CACHE
        ================================================== */

        cache: new Map(),

        /* ==================================================
           PUBLIC API
        ================================================== */

        async get(programCode) {

                if (!programCode) {

                return Object.freeze(

                    this.createUnknownProgram()

                );

            }

            const normalizedCode =
                String(programCode)
                    .trim()
                    .toUpperCase();

            if (this.cache.has(normalizedCode)) {

                return this.cache.get(
                    normalizedCode
                );

            }

            const program =
                await this.loadProgram(
                    normalizedCode
                );

            this.cache.set(

                normalizedCode,

                Object.freeze(program)

            );

            return this.cache.get(
                normalizedCode
            );

        },

        /* ==================================================
           LOAD PROGRAM
        ================================================== */

        async loadProgram(programCode) {

            /*
             * Sprint 3 Foundation
             * ----------------------------------------------
             * Cloud Run / Firestore implementation
             * will replace this placeholder.
             */

            const programs =

                typeof window.__AAIU_PROGRAMS__ === "object" &&
                window.__AAIU_PROGRAMS__ !== null

                    ? window.__AAIU_PROGRAMS__

                    : {};

            const program =
                programs[programCode];

                        if (!program) {

                return Object.freeze(

                    this.createUnknownProgram(
                        programCode
                    )

                );

            }

            return {

                programCode:
                    program.program_code ||
                    programCode,

                programName:
                    program.program_name ||
                    programCode,

                status:
                    program.status ||
                    "active",

                lifetimeCredentials:
                    program.lifetime_credentials === true,

                availableAssets:

                    Object.freeze(

                        program.available_assets || {}

                    ),

                recommendations:

                    Object.freeze(

                        program.recommendations || {}

                    ),

                futureProgramCode:
                    program.future_program_code ||
                    null,

                futureProgramName:
                    program.future_program_name ||
                    null

            };

        },

        /* ==================================================
           UNKNOWN PROGRAM
        ================================================== */

        createUnknownProgram(
            programCode = ""
        ) {

            return {

                programCode,

                programName:
                    programCode ||
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

            };

        },

        /* ==================================================
           CACHE MANAGEMENT
        ================================================== */

        clearCache() {

            this.cache.clear();

        }

    };

    Object.freeze(
        ProgramService
    );

    window.ProgramService =
        ProgramService;

})(window);