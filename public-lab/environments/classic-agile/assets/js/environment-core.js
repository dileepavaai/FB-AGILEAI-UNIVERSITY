/* =========================================================
   Environment Core Engine
   Agile AI Leadership Lab

   Purpose:
   Centralized environment bootstrapping,
   lifecycle orchestration,
   runtime initialization,
   hybrid persistence governance,
   and shared simulation foundation layer.

   Version:
   v2.3 — Runtime Diagnostics Governance Stabilization

   Architecture Upgrade:
   - Persistent Governance Layer (localStorage)
   - Runtime Session Layer (sessionStorage)
   - Controlled Reset Governance
   - Runtime Visibility Diagnostics
   - Global Persistence Governance Exposure
   - Runtime Session Validation Stabilization
   - Persistence Diagnostics Visibility Correction

========================================================= */

/* =========================================================
   Environment Runtime State
========================================================= */

const environmentRuntimeState = {

    environmentInitialized:
        false,

    activeWorkspace:
        null,

    activeEvidenceWorkspace:
        null,

    simulationMode:
        "CLASSIC_AGILE",

    recoveryEngineActive:
        false,

    runtimeSessionActive:
        false

};

/* =========================================================
   Environment Configuration
========================================================= */

const environmentConfiguration = {

    defaultWorkspaceTab:
        ".horizontal-tab",

    defaultEvidenceTab:
        ".evidence-workspace-tab",

    smoothScrollDelay:
        80,

    initializationDelay:
        120

};

/* =========================================================
   Environment Persistence Keys
========================================================= */

const environmentPersistenceKeys = {

    runtimeSession:
        "classicAgileRuntimeActive",

    completionState:
        "classicAgileCompleted",

    launchRecoveryState:
        "recoveryCoordinationLaunched"

};

/* =========================================================
   Global Persistence Governance Exposure
========================================================= */

window.environmentPersistenceKeys =
    environmentPersistenceKeys;

/* =========================================================
   Environment Initialization Guard
========================================================= */

function isEnvironmentInitialized() {

    return environmentRuntimeState
        .environmentInitialized;

}

/* =========================================================
   Mark Environment Initialized
========================================================= */

function markEnvironmentInitialized() {

    environmentRuntimeState
        .environmentInitialized = true;

}

/* =========================================================
   Activate Default Workspace
========================================================= */

function activateDefaultWorkspace() {

    const defaultMainTab =
        document.querySelector(
            environmentConfiguration
                .defaultWorkspaceTab
        );

    if (defaultMainTab) {

        defaultMainTab.click();

    }

}

/* =========================================================
   Activate Default Evidence Workspace
========================================================= */

function activateDefaultEvidenceWorkspace() {

    const defaultEvidenceTab =
        document.querySelector(
            environmentConfiguration
                .defaultEvidenceTab
        );

    if (defaultEvidenceTab) {

        defaultEvidenceTab.click();

    }

}

/* =========================================================
   Initialize Runtime Session
========================================================= */

function initializeRuntimeSession() {

    sessionStorage.setItem(
        environmentPersistenceKeys
            .runtimeSession,
        "true"
    );

    environmentRuntimeState
        .runtimeSessionActive = true;

    console.log(
        "Runtime Session Activated:",
        sessionStorage.getItem(
            environmentPersistenceKeys
                .runtimeSession
        )
    );

}

/* =========================================================
   Validate Runtime Session Persistence
========================================================= */

function validateRuntimeSession() {

    const runtimeSessionValue =
        sessionStorage.getItem(
            environmentPersistenceKeys
                .runtimeSession
        );

    if (
        runtimeSessionValue === "true"
    ) {

        console.log(
            "Runtime Session Validation: SUCCESS"
        );

    } else {

        console.warn(
            "Runtime Session Validation: FAILED"
        );

    }

}

/* =========================================================
   Environment Runtime Visibility
========================================================= */

function logEnvironmentRuntimeState() {

    console.log(
        "Environment Runtime Initialized"
    );

    console.log(
        "Runtime State:",
        environmentRuntimeState
    );

    console.log(
        "Runtime Session:",
        sessionStorage.getItem(
            environmentPersistenceKeys
                .runtimeSession
        )
    );

    console.log(
        "Persistent Completion:",
        localStorage.getItem(
            environmentPersistenceKeys
                .completionState
        )
    );

    console.log(
        "Launch Recovery Coordination State:",
        localStorage.getItem(
            environmentPersistenceKeys
                .launchRecoveryState
        )
    );

    console.log(
        "Persistence Governance:",
        {

            runtimeSession:
                sessionStorage.getItem(
                    environmentPersistenceKeys
                        .runtimeSession
                ),

            completionState:
                localStorage.getItem(
                    environmentPersistenceKeys
                        .completionState
                ),

            launchRecoveryState:
                localStorage.getItem(
                    environmentPersistenceKeys
                        .launchRecoveryState
                )

        }
    );

}

/* =========================================================
   Initialize Environment Runtime
========================================================= */

function initializeEnvironmentRuntime() {

    /* =====================================================
       Prevent Duplicate Initialization
    ===================================================== */

    if (
        isEnvironmentInitialized()
    ) {

        return;

    }

    /* =====================================================
       Activate Default Workspaces
    ===================================================== */

    activateDefaultWorkspace();

    activateDefaultEvidenceWorkspace();

    /* =====================================================
       Initialize Runtime Session
    ===================================================== */

    initializeRuntimeSession();

    /* =====================================================
       Validate Runtime Session
    ===================================================== */

    validateRuntimeSession();

    /* =====================================================
       Runtime Initialization Complete
    ===================================================== */

    markEnvironmentInitialized();

    /* =====================================================
       Runtime Visibility Diagnostics
    ===================================================== */

    logEnvironmentRuntimeState();

}

/* =========================================================
   Reset Environment Progression
========================================================= */

function resetEnvironmentProgression() {

    /* =====================================================
       Persistent Governance Reset
    ===================================================== */

    localStorage.removeItem(
        environmentPersistenceKeys
            .completionState
    );

    localStorage.removeItem(
        environmentPersistenceKeys
            .launchRecoveryState
    );

    /* =====================================================
       Runtime Session Reset
    ===================================================== */

    sessionStorage.removeItem(
        environmentPersistenceKeys
            .runtimeSession
    );

    /* =====================================================
       Runtime State Reset
    ===================================================== */

    environmentRuntimeState
        .environmentInitialized = false;

    environmentRuntimeState
        .activeWorkspace = null;

    environmentRuntimeState
        .activeEvidenceWorkspace = null;

    environmentRuntimeState
        .recoveryEngineActive = false;

    environmentRuntimeState
        .runtimeSessionActive = false;

    /* =====================================================
       Console Visibility
    ===================================================== */

    console.log(
        "Environment Progression Reset"
    );

    /* =====================================================
       Reload Environment
    ===================================================== */

    location.reload();

}

/* =========================================================
   Environment Lifecycle Bootstrap
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setTimeout(function () {

            initializeEnvironmentRuntime();

        }, environmentConfiguration.initializationDelay);

    }
);