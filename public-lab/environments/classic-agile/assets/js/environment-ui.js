/* =========================================================
   Environment UI Engine
   Agile AI Leadership Lab

   Purpose:
   Manage environment navigation,
   panel visibility,
   workspace interaction,
   and guided UI continuity.

   Architecture Boundary:
   This file owns ONLY UI interaction logic.

   DOES NOT OWN:
   - runtime bootstrapping
   - environment lifecycle initialization
   - recovery orchestration
   - metric mutation
   - stream engines

   Bootstrap responsibility belongs exclusively to:
   environment-core.js

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

    if (selectedPanel) {

        selectedPanel.style.display =
            "block";

    }

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
       Requested Panel
    ===================================================== */

    const selectedPanel =
        document.getElementById(
            panelId
        );

    /* =====================================================
       Activate Requested Panel
    ===================================================== */

    if (selectedPanel) {

        selectedPanel.classList.add(
            "active-signal-workspace-panel"
        );

    }

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