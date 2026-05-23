/* =========================================================
   Classic Incident Simulation Engine
   Agile AI Leadership Lab
   Version: 2.1
   Governance State: Stable
========================================================= */

/* =========================================================
   Main Operational Workspace Tabs
========================================================= */

function toggleSection(
    sectionId,
    buttonElement
) {

    /* =====================================================
       Main Panels
    ===================================================== */

    const allPanels =
        document.querySelectorAll(
            ".horizontal-tab-content"
        );

    /* =====================================================
       Main Tabs
    ===================================================== */

    const allTabs =
        document.querySelectorAll(
            ".horizontal-tab"
        );

    /* =====================================================
       Selected Panel
    ===================================================== */

    const selectedPanel =
        document.getElementById(
            sectionId
        );

    /* =====================================================
       Hide All Panels
    ===================================================== */

    allPanels.forEach((panel) => {

        panel.style.display = "none";

    });

    /* =====================================================
       Reset All Tabs
    ===================================================== */

    allTabs.forEach((tab) => {

        tab.classList.remove(
            "active-horizontal-tab"
        );

    });

    /* =====================================================
       Activate Selected Panel
    ===================================================== */

    if (selectedPanel) {

        selectedPanel.style.display =
            "block";

    }

    /* =====================================================
       Activate Selected Tab
    ===================================================== */

    if (buttonElement) {

        buttonElement.classList.add(
            "active-horizontal-tab"
        );

    }

    /* =====================================================
       Smooth Operational Navigation
    ===================================================== */

    if (selectedPanel) {

        setTimeout(function () {

            selectedPanel.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }, 80);

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
       Signal Workspace Panels
    ===================================================== */

    const allPanels =
        document.querySelectorAll(
            ".signal-workspace-panel"
        );

    /* =====================================================
       Signal Workspace Tabs
    ===================================================== */

    const allTabs =
        document.querySelectorAll(
            ".signal-workspace-tab"
        );

    /* =====================================================
       Hide All Panels
    ===================================================== */

    allPanels.forEach((panel) => {

        panel.classList.remove(
            "active-signal-workspace-panel"
        );

    });

    /* =====================================================
       Reset All Tabs
    ===================================================== */

    allTabs.forEach((tab) => {

        tab.classList.remove(
            "active-signal-workspace-tab"
        );

    });

    /* =====================================================
       Activate Selected Panel
    ===================================================== */

    const selectedPanel =
        document.getElementById(
            panelId
        );

    if (selectedPanel) {

        selectedPanel.classList.add(
            "active-signal-workspace-panel"
        );

    }

    /* =====================================================
       Activate Selected Tab
    ===================================================== */

    if (buttonElement) {

        buttonElement.classList.add(
            "active-signal-workspace-tab"
        );

    }

}

/* =========================================================
   Expandable Operational Insight Panels
========================================================= */

function toggleMetricInsight(
    panelId
) {

    /* =====================================================
       All Insight Panels
    ===================================================== */

    const allPanels =
        document.querySelectorAll(
            ".metric-insight-panel"
        );

    /* =====================================================
       Selected Insight Panel
    ===================================================== */

    const selectedPanel =
        document.getElementById(
            panelId
        );

    if (!selectedPanel) {

        return;

    }

    /* =====================================================
       Current Visibility State
    ===================================================== */

    const isVisible =
        selectedPanel.style.display ===
        "block";

    /* =====================================================
       Close All Panels
    ===================================================== */

    allPanels.forEach((panel) => {

        panel.style.display = "none";

    });

    /* =====================================================
       Reopen Selected Panel
    ===================================================== */

    if (!isVisible) {

        selectedPanel.style.display =
            "block";

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

    completedStepSet.add(
        stepNumber
    );

    completedSteps++;

    const step =
        document.getElementById(
            `step-${stepNumber}`
        );

    if (step) {

        step.classList.add(
            "step-completed"
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

    /* =====================================================
       Completion State
    ===================================================== */

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
   Default Initialization
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* =================================================
           Default Main Workspace
        ================================================= */

        const defaultMainTab =
            document.querySelector(
                ".horizontal-tab"
            );

        if (defaultMainTab) {

            defaultMainTab.click();

        }

        /* =================================================
           Default Signal Workspace
        ================================================= */

        const defaultSignalTab =
            document.querySelector(
                ".signal-workspace-tab"
            );

        if (defaultSignalTab) {

            defaultSignalTab.click();

        }

    }
);