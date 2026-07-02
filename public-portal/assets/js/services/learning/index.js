/**
 * ================================================================
 * Agile AI University
 * ---------------------------------------------------------------
 * Learning Services Layer
 * ---------------------------------------------------------------
 * File:
 * index.js
 *
 * Purpose:
 * Central entry point for the Learning Services module.
 *
 * Responsibilities:
 * • Export Learning Services
 * • Centralize module access
 * • Simplify imports
 * • Maintain module boundaries
 *
 * Scope:
 * Student & Executive Portal
 *
 * Governance:
 * • Student Experience Principles v1.0
 * • Learning Journey Framework v1.0
 * • Capability Progression Framework v1.0
 * • Bridge Program Governance v1.0
 *
 * Architecture:
 * Domain Module
 * Service Layer
 *
 * Status:
 * Active
 *
 * Version:
 * 1.0.0
 *
 * Copyright © Agile AI University.
 * ================================================================
 */

"use strict";

/* ================================================================
 * Learning Journey
 * ================================================================ */

export {
    buildLearningJourney
}
from "./learning-journey-service.js";


/* ================================================================
 * Program Relationships
 * ================================================================ */

export {
    getProgramRelationships,
    hasCompletedProgram,
    findProgram,
    getOutgoingRelationships
}
from "./program-relationship-service.js";


/* ================================================================
 * Capability Progression
 * ================================================================ */

export {
    resolveCapabilityProgression,
    hasCapability,
    getCompletedCapabilityCodes,
    getCurrentCapability
}
from "./capability-progression-service.js";


/* ================================================================
 * Bridge Programs
 * ================================================================ */

export {
    resolveBridgePrograms,
    getEligibleBridgePrograms,
    getBridgeProgramCount,
    hasBridgeOpportunity
}
from "./bridge-program-service.js";


/* ================================================================
 * Recommendations
 * ================================================================ */

export {
    generateRecommendations,
    getPrimaryRecommendation,
    getBridgeRecommendations,
    getCapabilityRecommendations,
    getLearningRecommendations
}
from "./recommendation-service.js";