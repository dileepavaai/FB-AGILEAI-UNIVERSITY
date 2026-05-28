/* =========================================================
   Environment UI Engine
   Agile AI Leadership Lab

   File:
   environment-ui.js

   Version:
   2.1

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

   Purpose:
   Display institutional preview governance
   messaging for restricted interaction layers.

   Future Expansion:
   - Portal entitlement routing
   - Learning Credit validation
   - Session-aware governance policies
   - Capability progression states

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
   Governance Access Router

   Purpose:
   Centralized access control routing for
   institutional preview experiences.

   Current Governance Layer:
   Session-based preview routing

   Future Governance Expansion:
   - Learning Credit validation
   - Portal entitlement orchestration
   - Institutional progression systems
   - Capability maturity unlock routing

========================================================= */

function handleWarRoomAccess() {

    /* =====================================================
       Session-Based Learning Credit Validation
    ===================================================== */

    const userHasLearningCredits =

        sessionStorage.getItem(
            "learningCreditsUnlocked"
        ) === "true";

    /* =====================================================
       Institutional Preview Mode
    ===================================================== */

    const previewMode =
        !userHasLearningCredits;

    /* =====================================================
       Preview Governance Routing
    ===================================================== */

    if (previewMode) {

        showPreviewMessage();

        return;

    }

    /* =====================================================
       Recovery Orchestration Activation

       NOTE:
       Recovery orchestration ownership belongs to:
       environment-recovery.js

    ===================================================== */

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

/* =========================================================
   War Room Interaction Binding

   Purpose:
   Connect operational recovery activation
   button with institutional governance router.

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