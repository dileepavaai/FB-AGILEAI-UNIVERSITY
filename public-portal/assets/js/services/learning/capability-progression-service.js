/**
 * ========================================================================
 * Agile AI University
 * Capability Progression Service
 * ------------------------------------------------------------------------
 * File:
 * public-portal/assets/js/services/learning/capability-progression-service.js
 *
 * Version        : 1.0.0
 * Status         : Foundation
 * Owner          : Agile AI University
 *
 * Description
 * ------------------------------------------------------------------------
 * Central service responsible for evaluating learner capability
 * progression across the Agile AI University ecosystem.
 *
 * This service determines:
 *
 * • Current capabilities
 * • Completed capabilities
 * • Future capabilities
 * • Capability maturity
 * • Progression opportunities
 *
 * This service does NOT render UI.
 * This service does NOT access Firestore directly.
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
 * Builds the learner capability progression model.
 *
 * @param {Array} completedPrograms
 * @param {Object} relationships
 *
 * @returns {Object}
 */
export function resolveCapabilityProgression(
    completedPrograms = [],
    relationships = {}
) {

    return {

        currentCapabilities:
            buildCurrentCapabilities(
                completedPrograms
            ),

        completedCapabilities:
            buildCompletedCapabilities(
                completedPrograms
            ),

        futureCapabilities:
            buildFutureCapabilities(
                relationships
            ),

        progression:
            buildProgressionModel(
                completedPrograms,
                relationships
            ),

        summary:
            buildCapabilitySummary(
                completedPrograms,
                relationships
            )

    };

}

/**
 * ========================================================================
 * Capability Builders
 * ========================================================================
 */

function buildCurrentCapabilities(
    completedPrograms
) {

    return [];

}

function buildCompletedCapabilities(
    completedPrograms
) {

    return [];

}

function buildFutureCapabilities(
    relationships
) {

    return [];

}

function buildProgressionModel(
    completedPrograms,
    relationships
) {

    return {

        current: [],

        future: [],

        opportunities: []

    };

}

function buildCapabilitySummary(
    completedPrograms,
    relationships
) {

    return {

        completedCapabilityCount:
            completedPrograms.length,

        futureCapabilityCount:
            relationships.futurePrograms
                ? relationships.futurePrograms.length
                : 0,

        progressionAvailable:
            (relationships.futurePrograms || []).length > 0

    };

}

/**
 * ========================================================================
 * Capability Helpers
 * ========================================================================
 */

/**
 * Returns true if the learner possesses a capability.
 */
export function hasCapability(
    completedPrograms,
    programCode
) {

    return completedPrograms.some(

        program =>

            program.programCode === programCode

    );

}

/**
 * Returns all completed capability codes.
 */
export function getCompletedCapabilityCodes(
    completedPrograms
) {

    return completedPrograms.map(

        program =>

            program.programCode

    );

}

/**
 * Returns the learner's highest completed capability.
 *
 * NOTE:
 * Capability progression in Agile AI University is graph-based.
 * There is no mandatory linear hierarchy.
 *
 * This helper returns the most recently completed capability
 * until a graph-ranking strategy is introduced.
 */
export function getCurrentCapability(
    completedPrograms
) {

    if (!completedPrograms.length) {

        return null;

    }

    return completedPrograms[
        completedPrograms.length - 1
    ];

}

/**
 * ========================================================================
 * Future Capability Model
 * ========================================================================
 *
 * Planned capability dimensions
 *
 * • Professional Capability
 * • Leadership Capability
 * • AI Capability
 * • Executive Capability
 * • Specialist Capability
 * • Continuing Education
 *
 * Future versions may support:
 *
 * • Capability scoring
 * • Capability maturity
 * • Skill graph
 * • Competency matrix
 * • Executive readiness
 *
 * ========================================================================
 */

/**
 * ========================================================================
 * Future Extension Points
 * ========================================================================
 *
 * Planned Features
 *
 * • Capability Analytics
 * • Organizational Capability Mapping
 * • AI Capability Assessment
 * • Executive Capability Framework
 * • Learning Velocity
 * • Competency Heatmaps
 * • Skill Gap Analysis
 *
 * ========================================================================
 */