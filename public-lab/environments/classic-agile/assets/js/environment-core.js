/* =========================================================
   Environment Core Engine
   Agile AI Leadership Lab

   Purpose:
   Centralized environment bootstrapping,
   lifecycle orchestration,
   runtime initialization,
   and shared simulation foundation layer.

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
       Runtime Initialization Complete
    ===================================================== */

    markEnvironmentInitialized();

    /* =====================================================
       Console Visibility
    ===================================================== */

    console.log(
        "Environment Runtime Initialized"
    );

    console.log(
        "Runtime State:",
        environmentRuntimeState
    );

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