/* =========================================================
   Classic Incident Simulation Engine
   Agile AI Leadership Lab
========================================================= */

/* =========================================================
   Main Operational Workspace Tabs
========================================================= */

function openMainWorkspaceTab(
    panelId,
    buttonElement
) {

    /* =====================================================
       Hide All Main Workspace Panels
    ===================================================== */

    const allPanels =
        document.querySelectorAll(
            ".main-workspace-panel"
        );

    allPanels.forEach((panel) => {

        panel.classList.remove(
            "active-main-workspace-panel"
        );

    });

    /* =====================================================
       Reset Main Workspace Tabs
    ===================================================== */

    const allTabs =
        document.querySelectorAll(
            ".main-workspace-tab"
        );

    allTabs.forEach((tab) => {

        tab.classList.remove(
            "active-main-workspace-tab"
        );

    });

    /* =====================================================
       Activate Selected Main Workspace Panel
    ===================================================== */

    const selectedPanel =
        document.getElementById(panelId);

    if (selectedPanel) {

        selectedPanel.classList.add(
            "active-main-workspace-panel"
        );

    }

    /* =====================================================
       Activate Selected Main Workspace Tab
    ===================================================== */

    if (buttonElement) {

        buttonElement.classList.add(
            "active-main-workspace-tab"
        );

    }

}

/* =========================================================
   Signal Workspace Tabs
========================================================= */

function openSignalWorkspaceTab(
    panelId,
    buttonElement
) {

    /* =====================================================
       Hide All Signal Workspace Panels
    ===================================================== */

    const allPanels =
        document.querySelectorAll(
            ".signal-workspace-panel"
        );

    allPanels.forEach((panel) => {

        panel.classList.remove(
            "active-signal-workspace-panel"
        );

    });

    /* =====================================================
       Reset Signal Workspace Tabs
    ===================================================== */

    const allTabs =
        document.querySelectorAll(
            ".signal-workspace-tab"
        );

    allTabs.forEach((tab) => {

        tab.classList.remove(
            "active-signal-workspace-tab"
        );

    });

    /* =====================================================
       Activate Selected Signal Workspace Panel
    ===================================================== */

    const selectedPanel =
        document.getElementById(panelId);

    if (selectedPanel) {

        selectedPanel.classList.add(
            "active-signal-workspace-panel"
        );

    }

    /* =====================================================
       Activate Selected Signal Workspace Tab
    ===================================================== */

    if (buttonElement) {

        buttonElement.classList.add(
            "active-signal-workspace-tab"
        );

    }

}

/* =========================================================
   Simulation Progress Engine
========================================================= */

let completedSteps = 0;

const completedStepSet = new Set();

/* =========================================================
   Complete Operational Step
========================================================= */

function completeStep(stepNumber) {

    if (
        completedStepSet.has(stepNumber)
    ) {
        return;
    }

    completedStepSet.add(stepNumber);

    completedSteps++;

    const step =
        document.getElementById(
            `step-${stepNumber}`
        );

    if (step) {

        step.classList.add(
            "completed-step"
        );

    }

    updateProgress();

}

/* =========================================================
   Update Progress State
========================================================= */

function updateProgress() {

    const progressPercentage =
        (completedSteps / 5) * 100;

    const progressBar =
        document.getElementById(
            "progress-bar"
        );

    const progressText =
        document.getElementById(
            "progress-text"
        );

    if (progressBar) {

        progressBar.style.width =
            `${progressPercentage}%`;

    }

    if (progressText) {

        progressText.innerHTML =
            `${completedSteps} of 5 operational actions completed.`;

    }

    if (completedSteps === 5) {

        const completionBanner =
            document.getElementById(
                "completion-banner"
            );

        if (completionBanner) {

            completionBanner.style.display =
                "block";

        }

        const simulationStatus =
            document.getElementById(
                "simulation-status"
            );

        if (simulationStatus) {

            simulationStatus.innerHTML =
                "Operational State: Incident Stabilized";

        }

    }

}

/* =========================================================
   Default Workspace Initialization
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* =================================================
           Initialize Main Workspace
        ================================================= */

        const defaultMainTab =
            document.querySelector(
                ".main-workspace-tab.active-main-workspace-tab"
            );

        if (defaultMainTab) {

            defaultMainTab.click();

        }

        /* =================================================
           Initialize Signal Workspace
        ================================================= */

        const defaultSignalTab =
            document.querySelector(
                ".signal-workspace-tab.active-signal-workspace-tab"
            );

        if (defaultSignalTab) {

            defaultSignalTab.click();

        }

    }
);