/**
 * ========================================================================
 * Agile AI University
 * Recommendation Service
 * ------------------------------------------------------------------------
 * File:
 * public-portal/assets/js/services/learning/recommendation-service.js
 *
 * Version        : 1.0.0
 * Status         : Foundation
 * Owner          : Agile AI University
 *
 * Description
 * ------------------------------------------------------------------------
 * Central service responsible for generating personalized learning
 * recommendations based on learner achievements, academic relationships
 * and capability progression.
 *
 * This service aggregates recommendations produced by the Learning
 * Services layer and prioritizes them for presentation.
 *
 * Responsibilities
 * ------------------------------------------------------------------------
 * • Generate personalized recommendations
 * • Prioritize learning opportunities
 * • Rank Bridge Program opportunities
 * • Recommend future capabilities
 * • Prepare dashboard recommendation model
 *
 * This service does NOT:
 *
 * • Determine academic eligibility
 * • Render UI
 * • Access Firestore
 * • Register learners
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
 * Generates learner recommendations.
 *
 * @param {Object} learningContext
 *
 * @returns {Array}
 */
export function generateRecommendations(
    learningContext = {}
) {

    const recommendations = [];

    recommendations.push(
        ...buildBridgeRecommendations(
            learningContext.bridgePrograms || []
        )
    );

    recommendations.push(
        ...buildCapabilityRecommendations(
            learningContext.progression || {}
        )
    );

    recommendations.push(
        ...buildLearningRecommendations(
            learningContext.relationships || {}
        )
    );

    return prioritizeRecommendations(
        recommendations
    );

}

/**
 * ========================================================================
 * Recommendation Builders
 * ========================================================================
 */

function buildBridgeRecommendations(
    bridgePrograms
) {

    return bridgePrograms.map(bridge => ({

        type: "BRIDGE",

        priority: 100,

        title:
            bridge.title,

        description:
            bridge.description || "",

        action:
            bridge.cta || "Upgrade Capability",

        target:
            bridge.targetProgram,

        data:
            bridge

    }));

}

function buildCapabilityRecommendations(
    progression
) {

    return (progression.future || []).map(capability => ({

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

    }));

}

function buildLearningRecommendations(
    relationships
) {

    return (relationships.recommendedPrograms || []).map(program => ({

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

    }));

}

/**
 * ========================================================================
 * Recommendation Prioritization
 * ========================================================================
 */

function prioritizeRecommendations(
    recommendations
) {

    return recommendations.sort(

        (a, b) =>

            b.priority - a.priority

    );

}

/**
 * ========================================================================
 * Helper Functions
 * ========================================================================
 */

/**
 * Returns only Bridge recommendations.
 */
export function getBridgeRecommendations(
    recommendations = []
) {

    return recommendations.filter(

        recommendation =>

            recommendation.type === "BRIDGE"

    );

}

/**
 * Returns only capability recommendations.
 */
export function getCapabilityRecommendations(
    recommendations = []
) {

    return recommendations.filter(

        recommendation =>

            recommendation.type === "CAPABILITY"

    );

}

/**
 * Returns only learning recommendations.
 */
export function getLearningRecommendations(
    recommendations = []
) {

    return recommendations.filter(

        recommendation =>

            recommendation.type === "LEARNING"

    );

}

/**
 * Returns the highest-priority recommendation.
 */
export function getPrimaryRecommendation(
    recommendations = []
) {

    if (!recommendations.length) {

        return null;

    }

    return recommendations[0];

}

/**
 * ========================================================================
 * Future Recommendation Types
 * ========================================================================
 *
 * BRIDGE
 * CAPABILITY
 * LEARNING
 * EXECUTIVE
 * CONTINUING_EDUCATION
 * SPECIALIZATION
 * AI_RECOMMENDATION
 * COMMUNITY
 * EVENT
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
 * • AI Recommendation Engine
 * • Recommendation Scoring
 * • Recommendation Analytics
 * • Executive Recommendations
 * • Personalized Learning Paths
 * • Continuing Education Guidance
 * • Skill Gap Analysis
 * • Learning Velocity
 * • Adaptive Recommendation Ranking
 *
 * ========================================================================
 */