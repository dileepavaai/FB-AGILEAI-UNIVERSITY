/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : recommendation-service.js
   Version   : 2.0.0
   Status    : ACTIVE
   Phase     : Sprint 3

   Purpose
   ----------------------------------------------------------
   Learning Recommendation Service

   Responsibilities

   ✓ Generate learning recommendations
   ✓ Prioritize recommendations
   ✓ Build recommendation ViewModel
   ✓ Return immutable recommendation collection

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Dashboard Rendering
   ✗ DOM Manipulation
   ✗ HTML Generation
   ✗ Academic Eligibility

   Depends On

   • LearningJourneyService

   Governance

   • Recommendation Authority
   • Business Service
   • Resolver First
   • Single Responsibility
   • Dashboard consumes ViewModel only

========================================================== */

(function (window) {

    "use strict";

    const RecommendationService = {

        /* ==================================================
           PUBLIC API
        ================================================== */

        build(learningContext = {}) {

            const recommendations = [];

            recommendations.push(

                ...this.buildBridgeRecommendations(

                    learningContext.bridgePrograms || []

                )

            );

            recommendations.push(

                ...this.buildCapabilityRecommendations(

                    learningContext.progression || {}

                )

            );

            recommendations.push(

                ...this.buildLearningRecommendations(

                    learningContext.relationships || {}

                )

            );

            return this.validate(

                this.prioritizeRecommendations(
                    recommendations
                )

                );

        },

        /* ==================================================
           BRIDGE RECOMMENDATIONS
        ================================================== */

            buildBridgeRecommendations(
                    bridgePrograms = []
                ) {

                    return bridgePrograms.map(

                function (bridge) {

                    return {

                        type: "BRIDGE",

                        priority: 100,

                        title:
                            bridge.title || "",

                        description:
                            bridge.description || "",

                        action:
                            bridge.cta ||
                            "Upgrade Capability",

                        target:
                            bridge.targetProgram ||
                            null,

                        data:
                            bridge

                    };

                }

            );

        },

        /* ==================================================
           CAPABILITY RECOMMENDATIONS
        ================================================== */

        buildCapabilityRecommendations(
            progression = {}
        ) {

            return (

                progression.future || []

            ).map(

                function (capability) {

                    return {

                        type: "CAPABILITY",

                        priority: 80,

                        title:

                            capability.title ||

                            capability.programName ||

                            "",

                        description:

                            capability.description ||

                            "",

                        action:

                            "Continue Learning",

                        target:

                            capability.programCode ||

                            null,

                        data:

                            capability

                    };

                }

            );

        },

        /* ==================================================
           LEARNING RECOMMENDATIONS
        ================================================== */

        buildLearningRecommendations(
            relationships = {}
        ) {

            return (

                relationships.recommendedPrograms || []

            ).map(

                function (program) {

                    return {

                        type: "LEARNING",

                        priority: 60,

                        title:

                            program.title ||

                            program.programName ||

                            "",

                        description:

                            program.description ||

                            "",

                        action:

                            "Learn More",

                        target:

                            program.programCode ||

                            null,

                        data:

                            program

                    };

                }

            );

        },

                /* ==================================================
           PRIORITIZATION
        ================================================== */

        prioritizeRecommendations(
            recommendations = []
        ) {

            return recommendations.sort(

                function (left, right) {

                    return (
                        right.priority -
                        left.priority
                    );

                }

            );

        },

        /* ==================================================
           PRIMARY RECOMMENDATION
        ================================================== */

        getPrimary(
            recommendations = []
        ) {

            if (
                !Array.isArray(recommendations) ||
                recommendations.length === 0
            ) {

                return null;

            }

            return recommendations[0];

        },

        /* ==================================================
           BRIDGE RECOMMENDATIONS
        ================================================== */

        getBridge(
            recommendations = []
        ) {

            return recommendations.filter(

                function (recommendation) {

                    return (
                        recommendation.type ===
                        "BRIDGE"
                    );

                }

            );

        },

        /* ==================================================
           CAPABILITY RECOMMENDATIONS
        ================================================== */

        getCapability(
            recommendations = []
        ) {

            return recommendations.filter(

                function (recommendation) {

                    return (
                        recommendation.type ===
                        "CAPABILITY"
                    );

                }

            );

        },

        /* ==================================================
           LEARNING RECOMMENDATIONS
        ================================================== */

        getLearning(
            recommendations = []
        ) {

            return recommendations.filter(

                function (recommendation) {

                    return (
                        recommendation.type ===
                        "LEARNING"
                    );

                }

            );

        },

                /* ==================================================
           VALIDATION
        ================================================== */

        validate(
            recommendations = []
        ) {

            if (
                !Array.isArray(recommendations)
            ) {

                return this.createEmptyRecommendations();

            }

            return recommendations;

        },

        /* ==================================================
           EMPTY RECOMMENDATIONS
        ================================================== */

        createEmptyRecommendations() {

            return [];

        }

    };

    /* ======================================================
       GOVERNANCE
    ====================================================== */

    Object.freeze(
        RecommendationService
    );

    window.RecommendationService =
        RecommendationService;

})(window);