/* =========================================================
   Environment UI Engine
   Agile AI Leadership Lab

   File:
   environment-ui.js

   Version:
   3.0

   Governance State:
   Stable

   Architecture Role:
   UI Interaction Layer

   Purpose:
   Manage:
   - workspace navigation
   - panel visibility
   - signal workspace routing
   - operational insight expansion
   - institutional preview governance
   - guided interaction continuity
   - learning credit interaction gating
   - protected interaction governance
   - unlock-aware orchestration routing

   =========================================================
   ARCHITECTURE BOUNDARY
   =========================================================

   THIS FILE OWNS:
   - UI interaction
   - navigation state
   - visibility rendering
   - preview governance messaging
   - interaction continuity
   - session-based interaction routing
   - protected orchestration access gating

   THIS FILE DOES NOT OWN:
   - environment bootstrapping
   - runtime lifecycle
   - recovery orchestration
   - metric mutation
   - stream intelligence
   - environment initialization

   Bootstrap Ownership:
   environment-core.js

   Recovery Ownership:
   environment-recovery.js

========================================================= */

/* =========================================================
   Runtime Governance State
========================================================= */

const userHasLearningCredits =

    sessionStorage.getItem(
        "learningCreditsUnlocked"
    ) === "true";

/* =========================================================
   Institutional Preview State
========================================================= */

const previewMode =
    !userHasLearningCredits;

/* =========================================================
   Global Governance Body State
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /* =================================================
           Preview Governance State
        ================================================= */

        if (previewMode) {

            document.body.classList.add(
                "preview-mode"
            );

            console.log(
                "[Environment UI] Preview mode active"
            );

        }

        /* =================================================
           Unlock Governance State
        ================================================= */

        if (userHasLearningCredits) {

            document.body.classList.add(
                "learning-credits-unlocked"
            );

            console.log(
                "[Environment UI] Learning credits unlocked"
            );

        }

    }
);

/* =========================================================
   Main Operational Workspace Navigation
========================================================= */

function toggleSection(
    sectionId,
    buttonElement
) {

    /* =====================================================
       Workspace Panels
    ===================================================== */

    const allPanels =
        document.querySelectorAll(
            ".horizontal-tab-content"
        );

    /* =====================================================
       Navigation Tabs
    ===================================================== */

    const allTabs =
        document.querySelectorAll(
            ".horizontal-tab"
        );

    /* =====================================================
       Requested Panel
    ===================================================== */

    const selectedPanel =
        document.getElementById(
            sectionId
        );

    /* =====================================================
       Safety Validation
    ===================================================== */

    if (!selectedPanel) {

        console.warn(
            "[Environment UI] Invalid section:",
            sectionId
        );

        return;

    }

    /* =====================================================
       Hide Existing Panels
    ===================================================== */

    allPanels.forEach((panel) => {

        panel.style.display =
            "none";

    });

    /* =====================================================
       Reset Existing Tabs
    ===================================================== */

    allTabs.forEach((tab) => {

        tab.classList.remove(
            "active-horizontal-tab"
        );

    });

    /* =====================================================
       Activate Requested Panel
    ===================================================== */

    selectedPanel.style.display =
        "block";
        
        updateLearningStage(
        sectionId
    );

    /* =====================================================
       Activate Requested Tab
    ===================================================== */

    if (buttonElement) {

        buttonElement.classList.add(
            "active-horizontal-tab"
        );

    }

    /* =====================================================
       Guided Scroll Continuity
    ===================================================== */

    setTimeout(function () {

        selectedPanel.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }, 80);

}

/* =========================================================
   Learning Stage Progression
========================================================= */

function updateLearningStage(
    sectionId
) {

    const stageHeader =
        document.querySelector(
            ".learning-stage-header"
        );

    const stageFocus =
        document.querySelector(
            ".learning-stage-focus"
        );

    const stageProgress =
        document.getElementById(
            "learning-stage-progress-fill"
        );

    if (
        !stageHeader ||
        !stageFocus ||
        !stageProgress
    ) {

        return;

    }

    const stageMap = {

        scenario: {
            stage: "STAGE 1 OF 5",
            focus: "Context Awareness",
            progress: "20%"
        },

        signals: {
            stage: "STAGE 2 OF 5",
            focus: "Situation Diagnosis",
            progress: "40%"
        },

        teams: {
            stage: "STAGE 3 OF 5",
            focus: "Leadership Ownership",
            progress: "60%"
        },

        actions: {
            stage: "STAGE 4 OF 5",
            focus: "Recovery Decision Making",
            progress: "80%"
        },

        outcomes: {
            stage: "STAGE 5 OF 5",
            focus: "Outcome Evaluation",
            progress: "100%"
        }

    };

    const selectedStage =
        stageMap[sectionId];

    if (!selectedStage) {

        return;

    }

    stageHeader.textContent =
        selectedStage.stage;

    stageFocus.textContent =
        selectedStage.focus;

    stageProgress.style.width =
        selectedStage.progress;

}

/* =========================================================
   Signal Workspace Navigation
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
       Requested Panel
    ===================================================== */

    const selectedPanel =
        document.getElementById(
            panelId
        );

    /* =====================================================
       Safety Validation
    ===================================================== */

    if (!selectedPanel) {

        console.warn(
            "[Environment UI] Invalid workspace panel:",
            panelId
        );

        return;

    }

    /* =====================================================
       Reset Existing Panels
    ===================================================== */

    allPanels.forEach((panel) => {

        panel.classList.remove(
            "active-signal-workspace-panel"
        );

    });

    /* =====================================================
       Reset Existing Tabs
    ===================================================== */

    allTabs.forEach((tab) => {

        tab.classList.remove(
            "active-signal-workspace-tab"
        );

    });

    /* =====================================================
       Activate Requested Panel
    ===================================================== */

    selectedPanel.classList.add(
        "active-signal-workspace-panel"
    );

    /* =====================================================
       Activate Requested Tab
    ===================================================== */

    if (buttonElement) {

        buttonElement.classList.add(
            "active-signal-workspace-tab"
        );

    }

}

/* =========================================================
   Expandable Operational Metric Insights
========================================================= */

function toggleMetricInsight(
    panelId
) {

    /* =====================================================
       Insight Panels
    ===================================================== */

    const allPanels =
        document.querySelectorAll(
            ".metric-insight-panel"
        );

    /* =====================================================
       Requested Panel
    ===================================================== */

    const selectedPanel =
        document.getElementById(
            panelId
        );

    /* =====================================================
       Safety Validation
    ===================================================== */

    if (!selectedPanel) {

        console.warn(
            "[Environment UI] Invalid metric insight:",
            panelId
        );

        return;

    }

    /* =====================================================
       Current Visibility State
    ===================================================== */

    const isVisible =
        selectedPanel.style.display ===
        "block";

    /* =====================================================
       Close Existing Panels
    ===================================================== */

    allPanels.forEach((panel) => {

        panel.style.display =
            "none";

    });

    /* =====================================================
       Reopen Requested Panel
    ===================================================== */

    if (!isVisible) {

        selectedPanel.style.display =
            "block";

    }

}

/* =========================================================
   Institutional Preview Governance Layer
========================================================= */

/* =========================================================
   Preview Governance Message Toggle
========================================================= */

function showPreviewMessage() {

    const message =
        document.getElementById(
            "preview-governance-message"
        );

    /* =====================================================
       Safety Validation
    ===================================================== */

    if (!message) {

        console.warn(
            "[Environment UI] Preview governance message missing"
        );

        return;

    }

    /* =====================================================
       Visibility Toggle
    ===================================================== */

    if (
        message.style.display === "none"
    ) {

        message.style.display =
            "block";

    } else {

        message.style.display =
            "none";

    }

}

/* =========================================================
   Protected Interaction Governance Router

   Purpose:
   Centralized governance validation for
   protected orchestration interactions.

========================================================= */

function handleProtectedInteraction(
    protectedAction
) {

    /* =====================================================
       Institutional Preview Governance
    ===================================================== */

    if (previewMode) {

        showPreviewMessage();

        console.warn(
            "[Environment UI] Preview access restricted"
        );

        return;

    }

    /* =====================================================
       Execute Protected Action
    ===================================================== */

    if (
        typeof protectedAction ===
        "function"
    ) {

        protectedAction();

    } else {

        console.error(
            "[Environment UI] Invalid protected action"
        );

    }

}

/* =========================================================
   Governance Access Router
========================================================= */

function handleWarRoomAccess() {

    handleProtectedInteraction(
        function () {

            /* =============================================
               Recovery Orchestration Activation

               Ownership:
               environment-recovery.js
            ============================================= */

            if (
                typeof activateWarRoom ===
                "function"
            ) {

                activateWarRoom();

            } else {

                console.error(
                    "[Environment UI] activateWarRoom() unavailable"
                );

            }

        }
    );

}

/* =========================================================
   War Room Interaction Binding
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const activateButton =
            document.getElementById(
                "activate-war-room-btn"
            );

        /* =================================================
           Safety Validation
        ================================================= */

        if (!activateButton) {

            console.warn(
                "[Environment UI] War room button missing"
            );

            return;

        }

        /* =================================================
           Governance Interaction Binding
        ================================================= */

        activateButton.addEventListener(
            "click",
            handleWarRoomAccess
        );

    }
);

/* =========================================================
   Runtime Diagnostics
========================================================= */

console.log(
    "[Environment UI] Engine v3.0 initialized"
);

console.log(
    "[Environment UI] Preview Mode:",
    previewMode
);

console.log(
    "[Environment UI] Learning Credits:",
    userHasLearningCredits
);