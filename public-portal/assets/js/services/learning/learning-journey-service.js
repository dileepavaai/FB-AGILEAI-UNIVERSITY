/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : learning-journey-service.js
   Version   : 2.0.0
   Status    : ACTIVE
   Phase     : Sprint 3

   Purpose
   ----------------------------------------------------------
   Learning Journey Orchestration Service

   Responsibilities

   ✓ Build Learning Journey ViewModel
   ✓ Extract completed programs
   ✓ Orchestrate learning services
   ✓ Build summary model
   ✓ Return immutable learning journey

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Dashboard Rendering
   ✗ DOM Manipulation
   ✗ HTML Generation

   Depends On

   • EligibilityService
   • RecommendationService (Future)

   Governance

   • Learning Journey Authority
   • Business Service
   • Resolver First
   • Single Responsibility
   • Dashboard consumes ViewModel only

========================================================== */

(function (window) {

    "use strict";

    const LearningJourneyService = {

        /* ==================================================
           PUBLIC API
        ================================================== */

        build(visibleCredentials = []) {

            const completedPrograms =
                this.extractCompletedPrograms(
                    visibleCredentials
                );

            const relationships =
                this.buildRelationships(
                    completedPrograms
                );

            const progression =
                this.buildProgression(
                    completedPrograms,
                    relationships
                );

            const bridgePrograms =
                this.buildBridgePrograms(
                    completedPrograms,
                    relationships
                );

            const recommendations =
                this.buildRecommendations({

                    completedPrograms,

                    relationships,

                    progression,

                    bridgePrograms

                });

            return this.validate({

                completedPrograms,

                relationships,

                progression,

                bridgePrograms,

                recommendations,

                summary:
                    this.buildSummary({

                        completedPrograms,

                        recommendations,

                        bridgePrograms

                    })

            });

        },

        /* ==================================================
           COMPLETED PROGRAMS
        ================================================== */

        extractCompletedPrograms(
            credentials = []
        ) {

            if (!Array.isArray(credentials)) {

                return [];

            }

            return credentials

                .filter(function (credential) {

                    return Boolean(
                        credential &&
                        credential.program_code
                    );

                })

                .map(function (credential) {

                    return {

                        programCode:
                            credential.program_code,

                        programName:
                            credential.program_name ||
                            credential.program_code,

                        credentialId:
                            credential.credential_id ||
                            null,

                        credentialType:
                            credential.credential_type ||
                            null,

                        issuedBy:
                            credential.issued_by ||
                            null,

                        issuedAt:
                            credential.issued_at ||
                            null,

                        validity:
                            credential.validity ||
                            "Lifetime"

                    };

                });

        },

                /* ==================================================
           PROGRAM RELATIONSHIPS
        ================================================== */

        buildRelationships(
            completedPrograms = []
        ) {

            /*
             * Sprint 3 Foundation
             * ------------------------------------------------
             * Future versions will resolve:
             *
             * • Program Equivalencies
             * • Capability Relationships
             * • Learning Dependencies
             * • Credential Hierarchy
             */

            return [];

        },

        /* ==================================================
           CAPABILITY PROGRESSION
        ================================================== */

        buildProgression(

            completedPrograms = [],

            relationships = []

        ) {

            /*
             * Sprint 3 Foundation
             * ------------------------------------------------
             * Future versions will determine:
             *
             * • Current Capability
             * • Next Capability
             * • Future Learning Path
             * • Upgrade Readiness
             */

            return {

                current: [],

                future: [],

                opportunities: []

            };

        },

        /* ==================================================
           BRIDGE PROGRAMS
        ================================================== */

        buildBridgePrograms(

            completedPrograms = [],

            relationships = []

        ) {

            /*
             * Sprint 3 Foundation
             * ------------------------------------------------
             * Future versions will evaluate:
             *
             * • Bridge Programs
             * • Recognition of Prior Learning
             * • Fast-track Eligibility
             * • Cross-program Pathways
             */

            return [];

        },

                /* ==================================================
           RECOMMENDATIONS
        ================================================== */

        buildRecommendations(journey) {

            /*
             * Recommendation Authority
             * ------------------------------------------------
             * Future versions delegate to:
             *
             * • RecommendationService
             * • EligibilityService
             * • AI Learning Coach
             *
             * Revenue Sprint v1 returns an
             * empty recommendation collection.
             */

            if (

                window.RecommendationService &&

                typeof window.RecommendationService.build ===
                    "function"

            ) {

                return window
                    .RecommendationService
                    .build(journey);

            }

            return [];

        },

        /* ==================================================
           JOURNEY SUMMARY
        ================================================== */

        buildSummary({

            completedPrograms = [],

            recommendations = [],

            bridgePrograms = []

        }) {

            return {

                completedProgramCount:
                    completedPrograms.length,

                recommendationCount:
                    recommendations.length,

                bridgeProgramCount:
                    bridgePrograms.length

            };

        },

        /* ==================================================
           EMPTY JOURNEY
        ================================================== */

        createEmptyJourney() {

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

        },

                /* ==================================================
           VALIDATION
        ================================================== */

        validate(journey) {

            if (

                !journey ||

                typeof journey !== "object"

            ) {

                return this.createEmptyJourney();

            }

            return journey;

        }

    };

    /* ======================================================
       GOVERNANCE
    ====================================================== */

    Object.freeze(
        LearningJourneyService
    );

    window.LearningJourneyService =
        LearningJourneyService;

})(window);