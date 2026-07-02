/**
 * ========================================================================
 * Agile AI University
 * Bridge Program Service
 * ------------------------------------------------------------------------
 * File:
 * public-portal/assets/js/services/learning/bridge-program-service.js
 *
 * Version        : 1.0.0
 * Status         : Foundation
 * Owner          : Agile AI University
 *
 * Description
 * ------------------------------------------------------------------------
 * Central service responsible for identifying Bridge Program
 * opportunities within the Agile AI University ecosystem.
 *
 * Responsibilities
 * ------------------------------------------------------------------------
 * • Evaluate Bridge Program eligibility
 * • Resolve available Bridge Programs
 * • Build Bridge Program model
 * • Support Learning Journey
 * • Support Capability Progression
 *
 * This service does NOT:
 *
 * • Register learners
 * • Process payments
 * • Issue credentials
 * • Render UI
 *
 * ========================================================================
 */

"use strict";

/**
 * ========================================================================
 * Public API
 * ========================================================================
 */

/**
 * Resolves Bridge Program opportunities for a learner.
 *
 * @param {Array} completedPrograms
 * @param {Object} relationships
 *
 * @returns {Array}
 */
export function resolveBridgePrograms(
    completedPrograms = [],
    relationships = {}
) {

    const opportunities = [];

    const bridgePrograms =
        relationships.bridgePrograms || [];

    bridgePrograms.forEach(bridge => {

        const alreadyCompleted =

            hasCompletedProgram(
                completedPrograms,
                bridge.target
            );

        if (!alreadyCompleted) {

            opportunities.push({

                sourceProgram:
                    bridge.source,

                targetProgram:
                    bridge.target,

                relationship:
                    bridge.relationship,

                title:
                    bridge.title ||

                    "Capability Upgrade",

                description:
                    bridge.description ||

                    "",

                cta:

                    bridge.cta ||

                    "Upgrade Capability",

                registrationUrl:

                    bridge.registrationUrl ||

                    null,

                eligible: true,

                status: "AVAILABLE"

            });

        }

    });

    return opportunities;

}

/**
 * ========================================================================
 * Helper Functions
 * ========================================================================
 */

/**
 * Determines whether the learner has already
 * completed a program.
 */
function hasCompletedProgram(
    completedPrograms,
    programCode
) {

    return completedPrograms.some(

        program =>

            program.programCode === programCode

    );

}

/**
 * Returns only eligible Bridge Programs.
 */
export function getEligibleBridgePrograms(
    bridgePrograms = []
) {

    return bridgePrograms.filter(

        bridge => bridge.eligible

    );

}

/**
 * Returns the number of Bridge opportunities.
 */
export function getBridgeProgramCount(
    bridgePrograms = []
) {

    return bridgePrograms.length;

}

/**
 * Returns true when at least one Bridge Program
 * is available.
 */
export function hasBridgeOpportunity(
    bridgePrograms = []
) {

    return bridgePrograms.length > 0;

}

/**
 * ========================================================================
 * Future Bridge Program States
 * ========================================================================
 *
 * AVAILABLE
 * REGISTERED
 * IN_PROGRESS
 * COMPLETED
 * EXPIRED
 * CLOSED
 *
 * ========================================================================
 */

/**
 * ========================================================================
 * Future Enhancements
 * ========================================================================
 *
 * Planned Features
 *
 * • Registration Status
 * • Payment Status
 * • Enrollment Integration
 * • Batch Availability
 * • Seat Availability
 * • Eligibility Validation
 * • Executive Bridge Programs
 * • Continuing Education Bridges
 * • AI Bridge Recommendations
 *
 * ========================================================================
 */