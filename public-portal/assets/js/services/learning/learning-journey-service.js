/**
 * ================================================================
 * Agile AI University
 * Learning Journey Service
 * ---------------------------------------------------------------
 * File:
 * public-portal/assets/js/services/learning/learning-journey-service.js
 *
 * Version        : 1.0.0
 * Status         : Foundation
 * Owner          : Agile AI University
 *
 * Description
 * ---------------------------------------------------------------
 * Central orchestration service responsible for constructing a
 * learner's complete learning journey.
 *
 * Responsibilities
 * ---------------------------------------------------------------
 * • Load learner credentials
 * • Resolve completed programs
 * • Resolve capability relationships
 * • Resolve bridge opportunities
 * • Generate learning recommendations
 * • Build learner journey model
 *
 * This service does NOT perform rendering.
 * UI components consume the returned model.
 *
 * ================================================================
 */

import {
    getProgramRelationships
} from "./program-relationship-service.js";

import {
    resolveCapabilityProgression
} from "./capability-progression-service.js";

import {
    resolveBridgePrograms
} from "./bridge-program-service.js";

import {
    generateRecommendations
} from "./recommendation-service.js";


/**
 * ================================================================
 * Public API
 * ================================================================
 */

export async function buildLearningJourney(credentials = [], programs = {}) {

    const completedPrograms =
        extractCompletedPrograms(credentials);

    const relationships =
        getProgramRelationships(
            completedPrograms,
            programs
        );

    const progression =
        resolveCapabilityProgression(
            completedPrograms,
            relationships
        );

    const bridgePrograms =
        resolveBridgePrograms(
            completedPrograms,
            relationships
        );

    const recommendations =
        generateRecommendations({

            completedPrograms,

            relationships,

            progression,

            bridgePrograms

        });

    return {

        completedPrograms,

        relationships,

        progression,

        bridgePrograms,

        recommendations,

        summary:
            buildJourneySummary({
                completedPrograms,
                recommendations,
                bridgePrograms
            })

    };

}


/**
 * ================================================================
 * Internal Helpers
 * ================================================================
 */

function extractCompletedPrograms(credentials = []) {

    return credentials

        .filter(c => c.program_code)

        .map(c => ({

            programCode:
                c.program_code,

            programName:
                c.program_name,

            credentialId:
                c.credential_id,

            credentialType:
                c.credential_type,

            issuedStatus:
                c.issued_status,

            trainingEndDate:
                c.training_end_date

        }));

}


function buildJourneySummary(data) {

    return {

        completedProgramCount:
            data.completedPrograms.length,

        recommendationCount:
            data.recommendations.length,

        bridgeProgramCount:
            data.bridgePrograms.length

    };

}


/**
 * ================================================================
 * Future Extension Points
 * ================================================================
 *
 * Future versions may include:
 *
 * • Learning Timeline
 * • Skill Graph
 * • Competency Heatmap
 * • Executive Dashboard Insights
 * • Credential Equivalency Engine
 * • Learning Analytics
 * • AI Learning Coach
 * • Personalized Learning Paths
 *
 * ================================================================
 */