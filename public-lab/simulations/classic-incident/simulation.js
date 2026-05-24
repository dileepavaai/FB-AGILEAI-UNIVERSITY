/* =========================================================
   Classic Incident Simulation Engine
   Agile AI Leadership Lab

   Version: 6.0
   Governance State: Stable
   Architecture State: Guided Operational
   Recovery Simulation

   Purpose:
   Simulate enterprise operational instability,
   delivery escalation pressure,
   fragmented governance systems,
   operational recovery orchestration,
   and Agile coordination transformation workflows.

   Simulation Capability Layers:
   - Operational Scenario Navigation
   - Signal Workspace Simulation
   - Expandable Metric Intelligence
   - Interactive Recovery Actions
   - Persistent Operational Timeline
   - Agile Role Awareness Layer
   - Operational State Transition Engine
   - Humanized Enterprise Role Ownership
   - Progressive Transformation Reveal
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
   Centralized Operational Recovery State
   Version: 1.0
   Governance State: Stable Foundation

   Purpose:
   Create a centralized operational state layer
   to support future executive-grade operational
   recovery simulation progression.

   Future Expansion Possibilities:
   - SLA recovery progression
   - Operational pulse systems
   - Recovery confidence indicators
   - Escalation stabilization tracking
   - Time-based operational transitions
   - Executive operational simulation layers

========================================================= */

const operationalRecoveryState = {

    recoveryStage:
        "INITIAL",

    escalationPressure:
        "HIGH",

    coordinationHealth:
        "FRAGMENTED",

    operationalVisibility:
        "LIMITED",

    customerRisk:
        "CRITICAL",

    slaRecoveryState:
        "BREACHED",

    recoveryConfidence:
        18

};

/* =========================================================
   Activate Operational War Room
   Version: v3.0
   Governance State: Stable
   Architecture State:
   Centralized Operational Recovery Progression

   Purpose:
   - Operational recovery activation
   - Recovery state transitions
   - Progressive transformation reveal
   - Timeline activation experience
   - Agile operational role recovery state
   - Centralized operational recovery progression

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
       Centralized Operational Recovery State
       Transition Layer
    ===================================================== */

    operationalRecoveryState.recoveryStage =
        "RECOVERY_ACTIVE";

    operationalRecoveryState.escalationPressure =
        "STABILIZING";

    operationalRecoveryState.coordinationHealth =
        "CENTRALIZED";

    operationalRecoveryState.operationalVisibility =
        "ACTIVE";

    operationalRecoveryState.customerRisk =
        "REDUCING";

    operationalRecoveryState.slaRecoveryState =
        "RECOVERY_IN_PROGRESS";

    operationalRecoveryState.recoveryConfidence =
        52;

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
       Team Communication Recovery Transition
       Version: 6.2
    ===================================================== */

    updateTeamChatRecoveryState();

    /* =====================================================
       Operational Recovery Transition
    ===================================================== */

    revealOperationalRecoveryTransition();

    /* =====================================================
       Progressive Transformation Reveal
    ===================================================== */

    revealTransformationComparison();

    /* =====================================================
       JIRA Recovery Coordination Update
    ===================================================== */

    updateJiraRecoveryBoard();

    /* =====================================================
       Recovery Communication Update
    ===================================================== */

    updateMailCenterRecoveryState();

    /* =====================================================
       Recovery Experience Animation
    ===================================================== */

    const timelineCard = document.querySelector(
        ".timeline-card"
    );

    if (timelineCard) {

        timelineCard.classList.add(
            "war-room-activated"
        );

    }

    const agileRoleCard = document.querySelector(
        ".agile-role-card"
    );

    if (agileRoleCard) {

        agileRoleCard.classList.add(
            "role-recovery-active"
        );

    }

    /* =====================================================
       Operational Comparison Auto Scroll
       Purpose:
       Guide participant attention toward
       operational transformation visibility
    ===================================================== */

    const transformationSection = document.getElementById(
        "transformation-comparison-section"
    );

    if (transformationSection) {

        setTimeout(() => {

            transformationSection.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }, 700);

    }

    /* =====================================================
       Button Recovery State
    ===================================================== */

    const warRoomButton = document.getElementById(
        "activate-war-room-btn"
    );

    if (warRoomButton) {

        warRoomButton.innerHTML =
            "✓ War Room Activated";

        warRoomButton.disabled = true;

        warRoomButton.classList.add(
            "war-room-button-active"
        );

    }

    /* =====================================================
       Recovery Notification
    ===================================================== */

    showOperationalNotification(
        "Operational War Room activated successfully. Cross-functional coordination recovery initiated."
    );

    /* =====================================================
       Console Recovery State Visibility
       Purpose:
       Future-safe debugging foundation
    ===================================================== */

    console.log(
        "Operational Recovery State:",
        operationalRecoveryState
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
   Team Communication Recovery Engine
   Version: 6.2
   Governance State: Stable

   Purpose:
   Transform fragmented operational communication
   into coordinated Agile recovery governance
   after War Room activation.

   Experience Goals:
   - Reduce cognitive overload
   - Show behavioral transformation
   - Visualize operational maturity shift
   - Humanize Agile operational recovery

========================================================= */

function updateTeamChatRecoveryState() {

    /* =====================================================
       Team Chat Panel
    ===================================================== */

    const teamChatPanel =
        document.getElementById(
            "team-chat-panel"
        );

    /* =====================================================
       Null Protection
    ===================================================== */

    if (!teamChatPanel) {

        return;

    }

    /* =====================================================
       Recovery Transition Animation
    ===================================================== */

    teamChatPanel.style.opacity =
        "0.25";

    teamChatPanel.style.transform =
        "translateY(10px)";

    teamChatPanel.style.transition =
        "all 0.45s ease";

    /* =====================================================
       Progressive Recovery Communication Injection
    ===================================================== */

    setTimeout(function () {

        teamChatPanel.innerHTML = `

            <h3>
                Operational Recovery Coordination
            </h3>

            <p>

                <strong>
                    Incident Commander — Michael Foster:
                </strong>

                "War Room escalation governance
                is now active across operational teams."

            </p>

            <p>

                <strong>
                    Scrum Master — Elena Martinez:
                </strong>

                "Cross-functional recovery coordination
                synchronized across sprint delivery operations."

            </p>

            <p>

                <strong>
                    DevOps Lead — Priya Raman:
                </strong>

                "Infrastructure stabilization and deployment
                recovery workflows now operating
                under centralized visibility."

            </p>

            <p>

                <strong>
                    Product Owner — David Chen:
                </strong>

                "Enterprise rollout priorities re-aligned
                based on customer impact and escalation severity."

            </p>

            <p>

                <strong>
                    Recovery Status:
                </strong>

                Operational communication fragmentation reduced.
                Shared recovery ownership now active.

            </p>

        `;

        /* =================================================
           Recovery Animation Completion
        ================================================= */

        teamChatPanel.style.opacity =
            "1";

        teamChatPanel.style.transform =
            "translateY(0px)";

    }, 320);

}

/* =========================================================
   Operational Recovery Transition Reveal Engine
   Version: 7.0
   Governance State: Stable

   Purpose:
   Reveal guided operational recovery transition
   immediately after War Room activation
   to strengthen transformation storytelling
   and reduce cognitive overload.

========================================================= */

function revealOperationalRecoveryTransition() {

    /* =====================================================
       Recovery Transition Panel
    ===================================================== */

    const transitionPanel =
        document.getElementById(
            "operational-recovery-transition"
        );

    /* =====================================================
       Null Protection
    ===================================================== */

    if (!transitionPanel) {

        return;

    }

    /* =====================================================
       Reveal Transition Panel
    ===================================================== */

    transitionPanel.style.display =
        "block";

    /* =====================================================
       Guided Scroll Continuity
    ===================================================== */

    setTimeout(function () {

        transitionPanel.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }, 220);

}

/* =========================================================
   Progressive Transformation Reveal Engine
   Version: 6.1
   Governance Update:
   Dynamic War Room Transformation Injection

   Purpose:
   Reveal operational transformation comparison
   directly below War Room activation flow
   to strengthen guided operational learning.
========================================================= */

function revealTransformationComparison() {

    /* =====================================================
       Transformation Section
    ===================================================== */

    const comparisonSection =
        document.getElementById(
            "transformation-comparison-section"
        );

    /* =====================================================
       War Room Action Button
    ===================================================== */

    const warRoomButton =
        document.querySelector(
            ".simulation-button"
        );

    /* =====================================================
       Null Protection
    ===================================================== */

    if (
        !comparisonSection ||
        !warRoomButton
    ) {

        return;

    }

    /* =====================================================
       Reveal Hidden Section
    ===================================================== */

    comparisonSection.style.display =
        "block";

    /* =====================================================
       Dynamic Placement
       Move comparison directly below button
    ===================================================== */

    warRoomButton.insertAdjacentElement(
        "afterend",
        comparisonSection
    );

    /* =====================================================
       Button Recovery State
    ===================================================== */

    warRoomButton.innerText =
        "✓ War Room Activated";

    warRoomButton.disabled =
        true;

    warRoomButton.style.opacity =
        "0.85";

    warRoomButton.style.cursor =
        "not-allowed";

    /* =====================================================
       Progressive Reveal Animation
    ===================================================== */

    comparisonSection.style.opacity =
        "0";

    comparisonSection.style.transform =
        "translateY(24px)";

    comparisonSection.style.transition =
        "all 0.45s ease";

    setTimeout(function () {

        comparisonSection.style.opacity =
            "1";

        comparisonSection.style.transform =
            "translateY(0px)";

    }, 120);

    /* =====================================================
       Guided Scroll Continuity
    ===================================================== */

    setTimeout(function () {

        comparisonSection.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }, 260);

}

/* =========================================================
   Mail Center Recovery Governance Update
   Version: 8.0
   Governance State: Stable

   Purpose:
   Progressively evolve operational escalation
   communication into centralized recovery
   governance communication.

   Experience Goals:
   - Improve operational realism
   - Simulate enterprise escalation communication
   - Humanize operational ownership
   - Demonstrate governance recovery maturity
   - Preserve low cognitive overload

========================================================= */

function updateMailCenterRecoveryState() {

    /* =====================================================
       Mail Center Container
    ===================================================== */

    const mailContainer = document.getElementById(
        "mail-center-content"
    );

    /* =====================================================
       Safety Validation
    ===================================================== */

    if (!mailContainer) {

        return;

    }

    /* =====================================================
       Prevent Duplicate Recovery Messages
    ===================================================== */

    if (
        document.getElementById(
            "recovery-governance-update"
        )
    ) {

        return;

    }

    /* =====================================================
       Recovery Governance Message Container
    ===================================================== */

    const recoveryUpdate =
        document.createElement("div");

    recoveryUpdate.id =
        "recovery-governance-update";

    recoveryUpdate.className =
        "operational-recovery-update";

    /* =====================================================
       Enterprise Recovery Communication
    ===================================================== */

    recoveryUpdate.innerHTML = `

        <hr style="
            margin: 32px 0;
            opacity: 0.15;
        ">

        <h3>
            Recovery Coordination Update
        </h3>

        <p>
            <strong>From:</strong>

            Incident Command Center
            &lt;incident-command@nova-retailops.com&gt;
        </p>

        <p>
            <strong>To:</strong>

            Delivery Operations,
            DevOps Recovery Team,
            QA Coordination,
            Product Operations
        </p>

        <p>
            <strong>CC:</strong>

            Executive Recovery Governance,
            Enterprise Customer Operations
        </p>

        <p>
            <strong>Subject:</strong>

            War Room Recovery Governance Activated
        </p>

        <br>

        <p>
            Delivery and Operations Teams,
        </p>

        <p>
            Cross-functional operational recovery
            governance has now been activated
            through the centralized Incident
            Command escalation bridge.
        </p>

        <p>
            Active coordination is now underway
            across Delivery, DevOps, QA,
            and Product Operations to stabilize
            customer rollout dependencies
            and reduce escalation pressure.
        </p>

        <p>
            Priority operational blockers are
            now being tracked through the
            War Room recovery governance model.
        </p>

        <p>
            Recovery checkpoints will continue
            at structured coordination intervals
            until operational stability targets
            are restored.
        </p>

        <p>
            <strong>
                Next Recovery Checkpoint:
            </strong>

            2:30 PM PST
        </p>

        <p>
            <strong>Status:</strong>

            RECOVERY ACTIVE
        </p>

        <br>

        <p>
            Regards,
        </p>

        <p>
            Michael Foster
            <br>
            Incident Commander
            <br>
            Enterprise Recovery Governance
        </p>

    `;

    /* =====================================================
       Progressive Reveal Animation
    ===================================================== */

    recoveryUpdate.style.opacity = "0";

    recoveryUpdate.style.transform =
        "translateY(24px)";

    recoveryUpdate.style.transition =
        "all 0.6s ease";

    /* =====================================================
       Append Recovery Governance Message
    ===================================================== */

    mailContainer.appendChild(
        recoveryUpdate
    );

    /* =====================================================
       Trigger Recovery Animation
    ===================================================== */

    setTimeout(() => {

        recoveryUpdate.style.opacity = "1";

        recoveryUpdate.style.transform =
            "translateY(0px)";

    }, 100);

}

/* =========================================================
   JIRA Recovery Coordination Board
   Version: 7.0
   Governance State: Stable

   Purpose:
   Progressively transform operational task states
   after War Room activation to simulate
   real-time operational recovery orchestration.

   Experience Goals:
   - Visualize operational stabilization
   - Simulate Agile recovery governance
   - Reduce static content replacement
   - Improve experiential realism
   - Strengthen operational continuity

========================================================= */

function updateJiraRecoveryBoard() {

    /* =====================================================
       Locate JIRA Board Content Container
    ===================================================== */

    const jiraBoardContent = document.getElementById(
        "jira-board-content"
    );

    /* =====================================================
       Safety Validation
    ===================================================== */

    if (!jiraBoardContent) {

        return;

    }

    /* =====================================================
       Progressive Recovery Board Injection
    ===================================================== */

    jiraBoardContent.innerHTML = `

        <h3>
            Operational Recovery Coordination Board
        </h3>

        <ul id="jira-recovery-list">

            <li id="jira-task-1">

                Payment Service Migration —
                <strong>BLOCKED</strong>

            </li>

            <li id="jira-task-2">

                Customer Rollout Validation —
                <strong>BLOCKED</strong>

            </li>

            <li id="jira-task-3">

                Infrastructure Approval Review —
                <strong>DELAYED</strong>

            </li>

            <li id="jira-task-4">

                Release Stabilization Review —
                <strong>ESCALATED</strong>

            </li>

        </ul>

        <div
            id="jira-recovery-status"
            class="operational-recovery-update"
            style="
                margin-top: 24px;
                opacity: 0;
                transform: translateY(16px);
                transition: all 0.5s ease;
            "
        >

            <strong>
                Recovery Governance Status:
            </strong>

            Centralized operational coordination
            is now progressively stabilizing
            enterprise delivery workflows.

        </div>

    `;

    /* =====================================================
       Progressive Operational Recovery Mutation
    ===================================================== */

    setTimeout(() => {

        const task1 =
            document.getElementById(
                "jira-task-1"
            );

        if (task1) {

            task1.innerHTML = `

                Payment Service Migration —
                <strong>IN RECOVERY</strong>

            `;

        }

    }, 700);

    /* =====================================================
       Cross-Functional Coordination Recovery
    ===================================================== */

    setTimeout(() => {

        const task2 =
            document.getElementById(
                "jira-task-2"
            );

        if (task2) {

            task2.innerHTML = `

                Customer Rollout Validation —
                <strong>COORDINATED</strong>

            `;

        }

    }, 1300);

    /* =====================================================
       Infrastructure Governance Recovery
    ===================================================== */

    setTimeout(() => {

        const task3 =
            document.getElementById(
                "jira-task-3"
            );

        if (task3) {

            task3.innerHTML = `

                Infrastructure Approval Review —
                <strong>PRIORITIZED</strong>

            `;

        }

    }, 1900);

    /* =====================================================
       Operational Visibility Recovery
    ===================================================== */

    setTimeout(() => {

        const task4 =
            document.getElementById(
                "jira-task-4"
            );

        if (task4) {

            task4.innerHTML = `

                Release Stabilization Review —
                <strong>VISIBLE</strong>

            `;

        }

    }, 2500);

    /* =====================================================
       Recovery Governance Visibility
    ===================================================== */

    setTimeout(() => {

        const recoveryStatus =
            document.getElementById(
                "jira-recovery-status"
            );

        if (recoveryStatus) {

            recoveryStatus.style.opacity =
                "1";

            recoveryStatus.style.transform =
                "translateY(0px)";

        }

    }, 2800);

}

/* =========================================================
   Dynamic Metric Evolution Engine
   Version: 8.0
   Governance State: Stable

   Purpose:
   Transform static metric replacement into
   operational recovery evolution visibility.

   Experience Goals:
   - Preserve historical operational state
   - Show recovery progression
   - Visualize stabilization movement
   - Reduce hard replacement behavior
   - Improve executive simulation realism

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

            /* =============================================
               Preserve Existing Operational State
            ============================================= */

            const previousValue =
                value.innerText.trim();

            /* =============================================
               Prevent Duplicate Mutation
            ============================================= */

            if (
                previousValue === newValue
            ) {

                return;

            }

            /* =============================================
               Operational Recovery Evolution
            ============================================= */

            value.innerHTML = `

                <span
                    class="metric-previous-state"
                    style="
                        opacity: 0.55;
                        text-decoration: line-through;
                        margin-right: 10px;
                    "
                >
                    ${previousValue}
                </span>

                <span
                    class="metric-evolution-arrow"
                    style="
                        margin-right: 10px;
                        opacity: 0.7;
                    "
                >
                    →
                </span>

                <span
                    class="metric-current-state"
                    style="
                        font-weight: 700;
                    "
                >
                    ${newValue}
                </span>

            `;

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