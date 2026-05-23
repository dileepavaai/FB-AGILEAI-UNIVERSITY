/* =========================================================
   Classic Incident Simulation Engine
   Agile AI Leadership Lab

   Version: 5.0
   Governance State: Stable
   Architecture State: Interactive Operational
   Transformation Simulation

   Purpose:
   Simulate enterprise operational instability,
   escalation growth,
   delivery coordination pressure,
   fragmented governance,
   and Agile recovery orchestration workflows.

   Simulation Capability Layers:
   - Operational Scenario Navigation
   - Signal Workspace Simulation
   - Expandable Metric Intelligence
   - Interactive Recovery Actions
   - Persistent Operational Timeline
   - Agile Role Awareness Layer
   - Operational State Transition Engine
   - Humanized Enterprise Role Ownership
   - Comparative Operational Learning

========================================================= */

/* =========================================================
   Main Operational Workspace Navigation
========================================================= */

function toggleSection(
    sectionId,
    buttonElement
) {

    /* =====================================================
       All Workspace Panels
    ===================================================== */

    const allPanels =
        document.querySelectorAll(
            ".horizontal-tab-content"
        );

    /* =====================================================
       All Navigation Tabs
    ===================================================== */

    const allTabs =
        document.querySelectorAll(
            ".horizontal-tab"
        );

    /* =====================================================
       Selected Active Panel
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
       Reset Existing Navigation Tabs
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
       Activate Selected Navigation Tab
    ===================================================== */

    if (buttonElement) {

        buttonElement.classList.add(
            "active-horizontal-tab"
        );

    }

    /* =====================================================
       Smooth Navigation Continuity
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
       Reset Existing Workspace Panels
    ===================================================== */

    allPanels.forEach((panel) => {

        panel.classList.remove(
            "active-signal-workspace-panel"
        );

    });

    /* =====================================================
       Reset Existing Workspace Tabs
    ===================================================== */

    allTabs.forEach((tab) => {

        tab.classList.remove(
            "active-signal-workspace-tab"
        );

    });

    /* =====================================================
       Activate Selected Workspace Panel
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
       Activate Selected Workspace Tab
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
       All Insight Panels
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
       Null Protection
    ===================================================== */

    if (!selectedPanel) {

        return;

    }

    /* =====================================================
       Existing Visibility State
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
   Operational Recovery Engine
========================================================= */

/* =========================================================
   Recovery State Lock
========================================================= */

let warRoomActivated = false;

/* =========================================================
   Activate Operational War Room
========================================================= */

function activateWarRoom() {

    /* =====================================================
       Prevent Duplicate Activation
    ===================================================== */

    if (warRoomActivated) {

        return;

    }

    warRoomActivated = true;

    /* =====================================================
       Release Stability Recovery
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
       Coordination Delay Recovery
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
       Escalation Recovery
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
       Queue Pressure Recovery
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
       Customer Recovery
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
       Persistent Timeline Update
    ===================================================== */

    updateOperationalTimeline();

    /* =====================================================
       Agile Operational Role Update
    ===================================================== */

    updateAgileRoleState();

    /* =====================================================
       Recovery Notification
    ===================================================== */

    showOperationalNotification(
        "Operational War Room activated successfully. Cross-functional coordination recovery initiated."
    );

}

/* =========================================================
   Persistent Operational Timeline Engine
========================================================= */

function updateOperationalTimeline() {

    const timelinePanel =
        document.getElementById(
            "timeline-state-panel"
        );

    if (!timelinePanel) {

        return;

    }

    timelinePanel.innerHTML = `

        <p>

            <strong>
                🔴 Initial State:
            </strong>

            Escalation growth increasing
            across delivery coordination systems.

        </p>

        <p>

            <strong>
                ⚡ Action Taken:
            </strong>

            Operational War Room activated
            for centralized recovery governance.

        </p>

        <p>

            <strong>
                🟢 Current Recovery State:
            </strong>

            Cross-functional operational recovery
            coordination is now active.

        </p>

    `;

}

/* =========================================================
   Agile Operational Role Awareness Engine
========================================================= */

function updateAgileRoleState() {

    const rolePanel =
        document.getElementById(
            "agile-role-state-panel"
        );

    if (!rolePanel) {

        return;

    }

    rolePanel.innerHTML = `

        <p>

            <strong>
                Scrum Master — Elena Martinez:
            </strong>

            Coordinating rapid escalation reviews
            across sprint delivery teams.

        </p>

        <p>

            <strong>
                Product Owner — David Chen:
            </strong>

            Re-prioritizing enterprise rollout
            commitments based on customer impact.

        </p>

        <p>

            <strong>
                DevOps Lead — Priya Raman:
            </strong>

            Monitoring infrastructure stabilization
            and deployment recovery workflows.

        </p>

        <p>

            <strong>
                Incident Commander — Michael Foster:
            </strong>

            Centralized operational governance
            activated through War Room escalation control.

        </p>

    `;

}

/* =========================================================
   Dynamic Metric Value Engine
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
   Dynamic Metric Trend Engine
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
   Operational Notification Engine
========================================================= */

function showOperationalNotification(
    message
) {

    let notification =
        document.getElementById(
            "operational-notification"
        );

    /* =====================================================
       Create Notification Container
    ===================================================== */

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

    /* =====================================================
       Activate Notification
    ===================================================== */

    notification.innerText =
        message;

    notification.style.display =
        "block";

    /* =====================================================
       Auto Hide Notification
    ===================================================== */

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
   Complete Simulation Step
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
   Default Simulation Initialization
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