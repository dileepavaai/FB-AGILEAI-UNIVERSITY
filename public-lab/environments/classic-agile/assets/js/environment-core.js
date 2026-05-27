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
   v2.0 — Hybrid Persistence Runtime

   Architecture Upgrade:
   - Persistent Governance Layer (localStorage)
   - Runtime Session Layer (sessionStorage)
   - Controlled Reset Governance
   - Runtime Visibility Diagnostics

========================================================= */

/* =========================================================
   Environment Runtime State
========================================================= */

const environmentRuntimeState = {

    environmentInitialized:
        false,

    activeWorkspace:
        null,

    activeSignalWorkspace:
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

    defaultSignalTab:
        ".signal-workspace-tab",

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

    warRoomState:
        "warRoomActivated"

};

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
   Activate Default Signal Workspace
========================================================= */

function activateDefaultSignalWorkspace() {

    const defaultSignalTab =
        document.querySelector(
            environmentConfiguration
                .defaultSignalTab
        );

    if (defaultSignalTab) {

        defaultSignalTab.click();

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

    activateDefaultSignalWorkspace();

    /* =====================================================
       Initialize Runtime Session
    ===================================================== */

    initializeRuntimeSession();

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
            .warRoomState
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
        .activeSignalWorkspace = null;

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