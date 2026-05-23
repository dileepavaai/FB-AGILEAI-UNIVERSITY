/* =========================================================
   Classic Incident Simulation Engine
   Agile AI Leadership Lab
   Version: 3.0
   Governance State: Stable
========================================================= */

/* =========================================================
   Main Operational Workspace Tabs
========================================================= */

function toggleSection(
    sectionId,
    buttonElement
) {

    const allPanels =
        document.querySelectorAll(
            ".horizontal-tab-content"
        );

    const allTabs =
        document.querySelectorAll(
            ".horizontal-tab"
        );

    const selectedPanel =
        document.getElementById(
            sectionId
        );

    allPanels.forEach((panel) => {

        panel.style.display = "none";

    });

    allTabs.forEach((tab) => {

        tab.classList.remove(
            "active-horizontal-tab"
        );

    });

    if (selectedPanel) {

        selectedPanel.style.display =
            "block";

    }

    if (buttonElement) {

        buttonElement.classList.add(
            "active-horizontal-tab"
        );

    }

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

    const allPanels =
        document.querySelectorAll(
            ".signal-workspace-panel"
        );

    const allTabs =
        document.querySelectorAll(
            ".signal-workspace-tab"
        );

    allPanels.forEach((panel) => {

        panel.classList.remove(
            "active-signal-workspace-panel"
        );

    });

    allTabs.forEach((tab) => {

        tab.classList.remove(
            "active-signal-workspace-tab"
        );

    });

    const selectedPanel =
        document.getElementById(
            panelId
        );

    if (selectedPanel) {

        selectedPanel.classList.add(
            "active-signal-workspace-panel"
        );

    }

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

    const allPanels =
        document.querySelectorAll(
            ".metric-insight-panel"
        );

    const selectedPanel =
        document.getElementById(
            panelId
        );

    if (!selectedPanel) {

        return;

    }

    const isVisible =
        selectedPanel.style.display ===
        "block";

    allPanels.forEach((panel) => {

        panel.style.display = "none";

    });

    if (!isVisible) {

        selectedPanel.style.display =
            "block";

    }

}

/* =========================================================
   Operational Decision Engine
========================================================= */

let warRoomActivated = false;

/* =========================================================
   Activate Operational War Room
========================================================= */

function activateWarRoom() {

    /* =====================================================
       Prevent Duplicate Execution
    ===================================================== */

    if (warRoomActivated) {

        return;

    }

    warRoomActivated = true;

    /* =====================================================
       Release Stability Score
    ===================================================== */

    updateMetricValue(
        "Release Stability Score",
        "72 / 100"
    );

    updateMetricTrend(
        "Release Stability Score",
        "↑ +14% stabilization recovery"
    );

    /* =====================================================
       Coordination Delay
    ===================================================== */

    updateMetricValue(
        "Coordination Delay",
        "18 hrs"
    );

    updateMetricTrend(
        "Coordination Delay",
        "Response coordination improving"
    );

    /* =====================================================
       Active Escalations
    ===================================================== */

    updateMetricValue(
        "Active Escalations",
        "14"
    );

    updateMetricTrend(
        "Active Escalations",
        "Escalation growth stabilizing"
    );

    /* =====================================================
       Queue Growth Rate
    ===================================================== */

    updateMetricValue(
        "Queue Growth Rate",
        "+6%"
    );

    updateMetricTrend(
        "Queue Growth Rate",
        "Escalation queue pressure reduced"
    );

    /* =====================================================
       SLA Breaches
    ===================================================== */

    updateMetricValue(
        "SLA Breaches",
        "5"
    );

    updateMetricTrend(
        "SLA Breaches",
        "Customer delivery recovery improving"
    );

    /* =====================================================
       Operational Notification
    ===================================================== */

    showOperationalNotification(
        "Operational War Room activated successfully. Cross-functional coordination recovery initiated."
    );

}

/* =========================================================
   Update Metric Value
========================================================= */

function updateMetricValue(
    metricLabel,
    newValue
) {

    const metricCards =
        document.querySelectorAll(
            ".metric-card"
        );

    metricCards.forEach((card) => {

        const label =
            card.querySelector(
                ".metric-label"
            );

        const value =
            card.querySelector(
                ".metric-value"
            );

        if (
            label &&
            value &&
            label.innerText.trim() ===
            metricLabel
        ) {

            value.innerText =
                newValue;

        }

    });

}

/* =========================================================
   Update Metric Trend
========================================================= */

function updateMetricTrend(
    metricLabel,
    newTrend
) {

    const metricCards =
        document.querySelectorAll(
            ".metric-card"
        );

    metricCards.forEach((card) => {

        const label =
            card.querySelector(
                ".metric-label"
            );

        const trend =
            card.querySelector(
                ".metric-trend"
            );

        if (
            label &&
            trend &&
            label.innerText.trim() ===
            metricLabel
        ) {

            trend.innerText =
                newTrend;

        }

    });

}

/* =========================================================
   Operational Notification Banner
========================================================= */

function showOperationalNotification(
    message
) {

    let notification =
        document.getElementById(
            "operational-notification"
        );

    if (!notification) {

        notification =
            document.createElement("div");

        notification.id =
            "operational-notification";

        notification.style.position =
            "fixed";

        notification.style.bottom =
            "24px";

        notification.style.right =
            "24px";

        notification.style.padding =
            "1rem 1.25rem";

        notification.style.background =
            "#111111";

        notification.style.color =
            "#ffffff";

        notification.style.borderRadius =
            "0.85rem";

        notification.style.zIndex =
            "9999";

        notification.style.maxWidth =
            "420px";

        notification.style.lineHeight =
            "1.6";

        notification.style.boxShadow =
            "0 6px 18px rgba(0,0,0,0.15)";

        document.body.appendChild(
            notification
        );

    }

    notification.innerText =
        message;

    notification.style.display =
        "block";

    setTimeout(function () {

        notification.style.display =
            "none";

    }, 4500);

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

}

/* =========================================================
   Default Initialization
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const defaultMainTab =
            document.querySelector(
                ".horizontal-tab"
            );

        if (defaultMainTab) {

            defaultMainTab.click();

        }

        const defaultSignalTab =
            document.querySelector(
                ".signal-workspace-tab"
            );

        if (defaultSignalTab) {

            defaultSignalTab.click();

        }

    }
);