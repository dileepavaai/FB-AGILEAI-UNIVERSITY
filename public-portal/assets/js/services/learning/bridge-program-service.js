/**
 * ========================================================================
 * Agile AI University
 * Bridge Program Service
 * ------------------------------------------------------------------------
 * File:
 * public-portal/assets/js/services/learning/bridge-program-service.js
 *
 * Version        : 1.1.0
 * Status         : ACTIVE
 * Phase          : Revenue Sprint
 * Owner          : Agile AI University
 *
 * Description
 * ------------------------------------------------------------------------
 * Central service responsible for resolving governed Bridge Programme
 * opportunities within the Agile AI University ecosystem.
 *
 * Responsibilities
 * ------------------------------------------------------------------------
 * • Resolve Bridge Programme relationships
 * • Validate required source-programme completion
 * • Prevent offers when the target programme is completed
 * • Build immutable Bridge Programme ViewModels
 * • Support Learning Journey
 * • Support Capability Progression
 *
 * This service does NOT:
 *
 * • Determine campaign pricing
 * • Determine commercial offer expiry
 * • Register learners
 * • Process payments
 * • Create enrolments
 * • Issue credentials
 * • Access Firestore
 * • Render UI
 *
 * Governance
 * ------------------------------------------------------------------------
 * • EligibilityService remains the authoritative service for current
 *   commercial eligibility, pricing, GST and offer expiry.
 * • BridgeProgramService resolves academic bridge relationships only.
 * • A learner must have completed the required source programme.
 * • A learner must not have completed the target programme.
 * • Invalid, inactive or incomplete relationships are ignored.
 * • UI components consume service-produced ViewModels only.
 *
 * Change History
 * ------------------------------------------------------------------------
 * v1.1.0
 *
 * • Converted the service from ES-module exports to the established
 *   browser-global portal service architecture.
 * • Added mandatory source-programme completion validation.
 * • Added target-programme completion protection.
 * • Added programme-code normalization.
 * • Added relationship validation and inactive-relationship filtering.
 * • Added immutable Bridge Programme ViewModels.
 * • Preserved registration, payment, enrolment and UI separation.
 *
 * v1.0.0
 *
 * • Introduced the Bridge Program Service foundation.
 * • Added Bridge Programme opportunity resolution.
 * • Added basic opportunity helper functions.
 *
 * ========================================================================
 */

(function (window) {

    "use strict";

    console.log(
        "[BridgeProgramService] Loaded v1.1.0"
    );

    /* ====================================================================
       CONSTANTS
    ==================================================================== */

    const DEFAULT_TITLE =
        "Capability Upgrade";

    const DEFAULT_CTA =
        "Upgrade Capability";

    const DEFAULT_STATUS =
        "AVAILABLE";

    const DEFAULT_REGISTRATION_URL =
        "/programmes/bridge-programme-registration.html";

    const ACTIVE_RELATIONSHIP_STATUSES =
        Object.freeze([
            "ACTIVE",
            "AVAILABLE",
            "OPEN",
            "PUBLISHED"
        ]);

    /* ====================================================================
       NORMALIZATION
    ==================================================================== */

    /**
     * Normalizes a programme code.
     *
     * @param {*} value
     *
     * @returns {string|null}
     */
    function normalizeProgramCode(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return null;

        }

        const normalized =
            String(value)
                .trim()
                .toUpperCase();

        return normalized || null;

    }

    /**
     * Normalizes a status value.
     *
     * @param {*} value
     *
     * @returns {string|null}
     */
    function normalizeStatus(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return null;

        }

        const normalized =
            String(value)
                .trim()
                .toUpperCase();

        return normalized || null;

    }

    /**
     * Resolves a programme code from supported programme
     * and credential object shapes.
     *
     * @param {*} program
     *
     * @returns {string|null}
     */
    function resolveProgramCode(program) {

        if (
            typeof program === "string" ||
            typeof program === "number"
        ) {

            return normalizeProgramCode(
                program
            );

        }

        if (
            !program ||
            typeof program !== "object"
        ) {

            return null;

        }

        return normalizeProgramCode(

            program.programCode ||
            program.program_code ||
            program.code ||
            program.program?.programCode ||
            program.program?.program_code ||
            program.program?.code ||
            null

        );

    }

    /**
     * Normalizes a completed-programme collection.
     *
     * @param {*} completedPrograms
     *
     * @returns {Array}
     */
    function normalizeCompletedPrograms(
        completedPrograms
    ) {

        if (!Array.isArray(completedPrograms)) {

            return [];

        }

        const normalizedCodes =
            completedPrograms
                .map(resolveProgramCode)
                .filter(Boolean);

        return Array.from(
            new Set(normalizedCodes)
        );

    }

    /* ====================================================================
       RELATIONSHIP VALIDATION
    ==================================================================== */

    /**
     * Determines whether a Bridge Programme relationship
     * is structurally valid.
     *
     * @param {*} bridge
     *
     * @returns {boolean}
     */
    function isValidBridgeRelationship(bridge) {

        if (
            !bridge ||
            typeof bridge !== "object"
        ) {

            return false;

        }

        const sourceProgram =
            normalizeProgramCode(
                bridge.source ||
                bridge.sourceProgram ||
                bridge.source_program
            );

        const targetProgram =
            normalizeProgramCode(
                bridge.target ||
                bridge.targetProgram ||
                bridge.target_program
            );

        if (
            !sourceProgram ||
            !targetProgram
        ) {

            return false;

        }

        if (sourceProgram === targetProgram) {

            return false;

        }

        return true;

    }

    /**
     * Determines whether a Bridge Programme relationship
     * is currently enabled.
     *
     * A relationship is treated as active when:
     *
     * • active is not explicitly false
     * • enabled is not explicitly false
     * • published is not explicitly false
     * • status, when supplied, is an active status
     *
     * @param {Object} bridge
     *
     * @returns {boolean}
     */
    function isBridgeRelationshipActive(bridge) {

        if (!bridge) {

            return false;

        }

        if (
            bridge.active === false ||
            bridge.enabled === false ||
            bridge.published === false
        ) {

            return false;

        }

        const status =
            normalizeStatus(
                bridge.status
            );

        if (!status) {

            return true;

        }

        return ACTIVE_RELATIONSHIP_STATUSES
            .includes(status);

    }

    /**
     * Resolves Bridge Programme relationships from the
     * supported relationship container shapes.
     *
     * @param {*} relationships
     *
     * @returns {Array}
     */
    function resolveBridgeRelationshipList(
        relationships
    ) {

        if (Array.isArray(relationships)) {

            return relationships;

        }

        if (
            !relationships ||
            typeof relationships !== "object"
        ) {

            return [];

        }

        if (
            Array.isArray(
                relationships.bridgePrograms
            )
        ) {

            return relationships.bridgePrograms;

        }

        if (
            Array.isArray(
                relationships.bridgeProgrammes
            )
        ) {

            return relationships.bridgeProgrammes;

        }

        if (
            Array.isArray(
                relationships.bridges
            )
        ) {

            return relationships.bridges;

        }

        return [];

    }

    /* ====================================================================
       COMPLETION HELPERS
    ==================================================================== */

    /**
     * Determines whether a programme has been completed.
     *
     * @param {Array} completedProgramCodes
     * @param {*} programCode
     *
     * @returns {boolean}
     */
    function hasCompletedProgram(
        completedProgramCodes,
        programCode
    ) {

        if (
            !Array.isArray(completedProgramCodes)
        ) {

            return false;

        }

        const normalizedProgramCode =
            normalizeProgramCode(
                programCode
            );

        if (!normalizedProgramCode) {

            return false;

        }

        return completedProgramCodes.includes(
            normalizedProgramCode
        );

    }

    /* ====================================================================
       VIEWMODEL BUILDING
    ==================================================================== */

    /**
     * Builds an immutable Bridge Programme ViewModel.
     *
     * @param {Object} bridge
     * @param {string} sourceProgram
     * @param {string} targetProgram
     *
     * @returns {Object}
     */
    function buildBridgeProgramModel(
        bridge,
        sourceProgram,
        targetProgram
    ) {

        const relationship =
            bridge.relationship ||
            bridge.relationshipType ||
            bridge.relationship_type ||
            "BRIDGE";

        const title =
            bridge.title ||
            bridge.name ||
            DEFAULT_TITLE;

        const description =
            bridge.description ||
            "";

        const cta =
            bridge.cta ||
            bridge.ctaText ||
            DEFAULT_CTA;

        const registrationUrl =
            bridge.registrationUrl ||
            bridge.registration_url ||
            DEFAULT_REGISTRATION_URL;

        const model = {

            sourceProgram:
                sourceProgram,

            targetProgram:
                targetProgram,

            relationship:
                relationship,

            relationshipId:
                bridge.relationshipId ||
                bridge.relationship_id ||
                bridge.id ||
                null,

            title:
                title,

            description:
                description,

            cta:
                cta,

            registrationUrl:
                registrationUrl,

            eligible:
                true,

            status:
                DEFAULT_STATUS

        };

        return Object.freeze(model);

    }

    /* ====================================================================
       PUBLIC API
    ==================================================================== */

    const BridgeProgramService = {

        /**
         * Resolves academic Bridge Programme opportunities
         * for a learner.
         *
         * This method evaluates relationship eligibility only.
         * Commercial offer eligibility, expiry and pricing remain
         * under EligibilityService authority.
         *
         * A Bridge Programme opportunity is returned only when:
         *
         * • the relationship is valid;
         * • the relationship is active;
         * • the required source programme is completed; and
         * • the target programme is not completed.
         *
         * @param {Array} completedPrograms
         * @param {Object|Array} relationships
         *
         * @returns {Array}
         */
        resolveBridgePrograms(
            completedPrograms = [],
            relationships = {}
        ) {

            const opportunities = [];

            const completedProgramCodes =
                normalizeCompletedPrograms(
                    completedPrograms
                );

            const bridgePrograms =
                resolveBridgeRelationshipList(
                    relationships
                );

            bridgePrograms.forEach(
                function (bridge) {

                    if (
                        !isValidBridgeRelationship(
                            bridge
                        )
                    ) {

                        console.warn(
                            "[BridgeProgramService] Invalid bridge relationship ignored.",
                            bridge
                        );

                        return;

                    }

                    if (
                        !isBridgeRelationshipActive(
                            bridge
                        )
                    ) {

                        return;

                    }

                    const sourceProgram =
                        normalizeProgramCode(

                            bridge.source ||
                            bridge.sourceProgram ||
                            bridge.source_program

                        );

                    const targetProgram =
                        normalizeProgramCode(

                            bridge.target ||
                            bridge.targetProgram ||
                            bridge.target_program

                        );

                    const sourceCompleted =
                        hasCompletedProgram(
                            completedProgramCodes,
                            sourceProgram
                        );

                    const targetCompleted =
                        hasCompletedProgram(
                            completedProgramCodes,
                            targetProgram
                        );

                    if (!sourceCompleted) {

                        return;

                    }

                    if (targetCompleted) {

                        return;

                    }

                    opportunities.push(
                        buildBridgeProgramModel(
                            bridge,
                            sourceProgram,
                            targetProgram
                        )
                    );

                }
            );

            return Object.freeze(
                opportunities
            );

        },

        /**
         * Returns only eligible Bridge Programmes.
         *
         * @param {Array} bridgePrograms
         *
         * @returns {Array}
         */
        getEligibleBridgePrograms(
            bridgePrograms = []
        ) {

            if (!Array.isArray(bridgePrograms)) {

                return Object.freeze([]);

            }

            const eligiblePrograms =
                bridgePrograms.filter(
                    function (bridge) {

                        return Boolean(
                            bridge &&
                            bridge.eligible === true
                        );

                    }
                );

            return Object.freeze(
                eligiblePrograms
            );

        },

        /**
         * Returns the number of resolved Bridge Programme
         * opportunities.
         *
         * @param {Array} bridgePrograms
         *
         * @returns {number}
         */
        getBridgeProgramCount(
            bridgePrograms = []
        ) {

            if (!Array.isArray(bridgePrograms)) {

                return 0;

            }

            return bridgePrograms.length;

        },

        /**
         * Returns true when at least one eligible Bridge
         * Programme opportunity is available.
         *
         * @param {Array} bridgePrograms
         *
         * @returns {boolean}
         */
        hasBridgeOpportunity(
            bridgePrograms = []
        ) {

            if (!Array.isArray(bridgePrograms)) {

                return false;

            }

            return bridgePrograms.some(
                function (bridge) {

                    return Boolean(
                        bridge &&
                        bridge.eligible === true
                    );

                }
            );

        },

        /**
         * Determines whether the learner has completed a
         * particular programme.
         *
         * Public read-only helper for programme pages and
         * learning-journey orchestration.
         *
         * @param {Array} completedPrograms
         * @param {*} programCode
         *
         * @returns {boolean}
         */
        hasCompletedProgram(
            completedPrograms = [],
            programCode = null
        ) {

            const completedProgramCodes =
                normalizeCompletedPrograms(
                    completedPrograms
                );

            return hasCompletedProgram(
                completedProgramCodes,
                programCode
            );

        }

    };

    Object.freeze(
        BridgeProgramService
    );

    window.BridgeProgramService =
        BridgeProgramService;

    /* ====================================================================
       FUTURE BRIDGE PROGRAMME STATES
    ====================================================================
    
       AVAILABLE
       REGISTERED
       PAYMENT_PENDING
       PAYMENT_CONFIRMED
       ENROLLED
       IN_PROGRESS
       COMPLETED
       EXPIRED
       CLOSED

    ==================================================================== */

    /* ====================================================================
       FUTURE ENHANCEMENTS
    ====================================================================
    
       Planned Features

       • Registration Status
       • Payment Status
       • Enrolment Integration
       • Batch Availability
       • Seat Availability
       • Executive Bridge Programmes
       • Continuing Education Bridges
       • AI Bridge Recommendations

    ==================================================================== */

})(window);