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
   - evidence workspace routing
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
   Leadership Diagnosis Configuration
========================================================= */

const leadershipDiagnosis = {

    question:
        "What appears to be the primary source of operational instability?",

    options: [

        "Customer Demand Increase",

        "Infrastructure Failure",

        "Release Coordination Breakdown",

        "Resource Shortage"

    ],

    correctAnswer:
        "Release Coordination Breakdown",

    explanation:
        "The reviewed evidence indicates a Release Coordination Breakdown caused by fragmented ownership, dependency instability, delayed operational visibility, and unresolved recovery coordination."

};

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
)

{

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
    Outcomes Diagnosis Rendering
    ===================================================== */

    if (
        sectionId ===
        "outcomes-tab"
    ) {

        renderOutcomeDiagnosis();

    }

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

        evidence: {
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

    const normalizedSectionId =
    sectionId
        .replace("-tab", "")
        .replace("-panel", "");

    const selectedStage =
        stageMap[
            normalizedSectionId
        ];

    if (!selectedStage) {

        console.warn(
            "[Environment UI] Unknown learning stage:",
            sectionId
        );

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
   Evidence Workspace Navigation
========================================================= */

function openEvidenceWorkspaceTab(
    panelId,
    buttonElement
) {

    /* =====================================================
       Activate Evidence Workspace Panels
    ===================================================== */

    const allPanels =
        document.querySelectorAll(
            ".evidence-workspace-panel"
        );

    /* =====================================================
       Activate Evidence Workspace Tabs
    ===================================================== */

    const allTabs =
        document.querySelectorAll(
            ".evidence-workspace-tab"
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
            "active-evidence-workspace-panel"
        );

    });

    /* =====================================================
       Reset Existing Tabs
    ===================================================== */

    allTabs.forEach((tab) => {

        tab.classList.remove(
            "active-evidence-workspace-tab"
        );

    });

    /* =====================================================
       Activate Requested Panel
    ===================================================== */

    selectedPanel.classList.add(
        "active-evidence-workspace-panel"
    );

    /* =====================================================
       Activate Requested Tab
    ===================================================== */

    if (buttonElement) {

        buttonElement.classList.add(
            "active-evidence-workspace-tab"
        );

    }

    /* =====================================================
        Workspace Investigation Progress
    ===================================================== */

    /* =====================================================
        Workspace Investigation Progress
        Governance State:
        Evidence-Based Investigation Tracking
    ===================================================== */

    window.visitedEvidenceWorkspaces =
        window.visitedEvidenceWorkspaces ||
        new Set();

    window.visitedEvidenceWorkspaces.add(
        panelId
    );

    const workspaceFocusMap = {

    "customer-escalations-workspace":
        "Review Customer Escalations",

    "team-coordination-workspace":
        "Assess Team Coordination",

    "delivery-status-workspace":
        "Evaluate Delivery Status",

    "operational-incidents-workspace":
        "Assess Operational Incidents",

    "release-readiness-workspace":
        "Evaluate Release Readiness",

    "support-operations-workspace":
        "Assess Support Operations",

    "executive-escalations-workspace":
        "Review Executive Escalations",

    "dependency-analysis-workspace":
        "Analyze Dependencies"

};

    const workspaceLabels = {

    "customer-escalations-workspace":
        "Customer Escalations",

    "team-coordination-workspace":
        "Team Coordination",

    "delivery-status-workspace":
        "Delivery Status",

    "operational-incidents-workspace":
        "Operational Incidents",

    "release-readiness-workspace":
        "Release Readiness",

    "support-operations-workspace":
        "Support Operations",

    "executive-escalations-workspace":
        "Executive Escalations",

    "dependency-analysis-workspace":
        "Dependency Analysis"

};

    const totalWorkspaces = 8;

    const reviewedCount =
        window
            .visitedEvidenceWorkspaces
            .size;

    const progressPercentage =
        (
            reviewedCount /
            totalWorkspaces
        ) * 100;

    const focusElement =
        document.getElementById(
            "workspace-focus-text"
        );

    const counterElement =
        document.querySelector(
            ".workspace-progress-counter"
        );

    const progressFill =
        document.querySelector(
            ".workspace-progress-fill"
        );

    const pendingReviewElement =
        document.getElementById(
            "workspace-pending-review"
        );

    const readinessElement =
        document.getElementById(
            "workspace-readiness-status"
        );

    /* =====================================================
    Current Focus
    ===================================================== */

    if (
        focusElement &&
        workspaceFocusMap[panelId]
    ) {

        focusElement.textContent =
            workspaceFocusMap[
                panelId
            ];

    }

    /* =====================================================
    Progress Counter
    ===================================================== */

    if (counterElement) {

        counterElement.textContent =
            `${reviewedCount} OF ${totalWorkspaces} REVIEWED`;

    }

    /* =====================================================
    Progress Bar
    ===================================================== */

    if (progressFill) {

        progressFill.style.width =
            `${progressPercentage}%`;

    }

    /* =====================================================
    Pending Review
    ===================================================== */

    if (pendingReviewElement) {

        const pendingWorkspaces =
            Object.keys(
                workspaceLabels
            ).filter(
                (workspaceId) =>
                    !window
                        .visitedEvidenceWorkspaces
                        .has(
                            workspaceId
                        )
            );

        if (
            pendingWorkspaces.length === 0
        ) {

            pendingReviewElement.innerHTML =
                `
                <strong>
                    PENDING REVIEW
                </strong>
                All investigation sources reviewed.
                `;

        } else {

            pendingReviewElement.innerHTML =
                `
                <strong>
                    PENDING REVIEW
                </strong>
                <ul>
                    ${
                        pendingWorkspaces
                            .map(
                                (
                                    workspaceId
                                ) =>
                                    `<li>${workspaceLabels[workspaceId]}</li>`
                            )
                            .join("")
                    }
                </ul>
                `;

        }

    }

    /* =====================================================
        Decision Readiness
    ===================================================== */

    if (readinessElement) {

        if (
            reviewedCount ===
            totalWorkspaces
        ) {
            renderDiagnosisSection();
            readinessElement.className =
                "readiness-complete";

            readinessElement.innerHTML =
                `
                DECISION READINESS<br>
                Investigation complete.<br>
                Ready to proceed.
                `;

        } else {

            readinessElement.className =
                "readiness-pending";

            readinessElement.innerHTML =
                `
                DECISION READINESS<br>
                Additional evidence review recommended.
                `;

        }

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
                typeof LaunchRecoveryCoordination ===
                "function"
            ) {

                LaunchRecoveryCoordination();

            } else {

                console.error(
                    "[Environment UI] LaunchRecoveryCoordination() unavailable"
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
                "launch-recovery-coordination-btn"
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
   Leadership Diagnosis Renderer
========================================================= */

function renderDiagnosisSection() {

    const container =
        document.getElementById(
            "leadership-diagnosis-container"
        );

    if (!container) {

        return;

    }

    container.style.display =
        "block";

    container.innerHTML = `
        <h3>
            Leadership Diagnosis
        </h3>

        <p>
            ${leadershipDiagnosis.question}
        </p>

        <div id="diagnosis-options">

            ${leadershipDiagnosis.options
                .map(
                    option => `
                        <label style="display:block;margin-bottom:12px;">
                            <input
                                type="radio"
                                name="diagnosis-option"
                                value="${option}"
                            >
                            ${option}
                        </label>
                    `
                )
                .join("")
            }

        </div>

        <button
            class="simulation-button"
            onclick="submitDiagnosis()"
        >
            Submit Diagnosis
        </button>

        <div
            id="diagnosis-feedback"
            style="margin-top:1rem;"
        ></div>
    `;

}

/* =========================================================
   Leadership Diagnosis Submission
========================================================= */

function submitDiagnosis() {

    const selectedOption =
        document.querySelector(
            'input[name="diagnosis-option"]:checked'
        );

    const feedback =
        document.getElementById(
            "diagnosis-feedback"
        );

    if (
        !selectedOption ||
        !feedback
    ) {

        return;

    }

    const selectedAnswer =
        selectedOption.value;

    sessionStorage.setItem(
        "classicDiagnosis",
        selectedAnswer
    );

    sessionStorage.setItem(
        "classicDiagnosisCompleted",
        "true"
    );

    feedback.innerHTML = `
        <div class="info-card">

            <strong>
                ✓ Diagnosis Captured
            </strong>

            <p>
                ${leadershipDiagnosis.explanation}
            </p>

        </div>
    `;

}

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

function renderOutcomeDiagnosis() {

    const container =
        document.getElementById(
            "leadership-diagnosis-summary"
        );

    if (!container) {

        return;

    }

    const diagnosis =
        sessionStorage.getItem(
            "classicDiagnosis"
        );

    if (!diagnosis) {

        return;

    }

    container.innerHTML = `

        <h3>
            Leadership Diagnosis Summary
        </h3>

        <p>

            Your investigation identified:

            <strong>
                ${diagnosis}
            </strong>

        </p>

        <p>

            Effective leaders investigate
            evidence patterns before initiating
            recovery actions.

        </p>

    `;

}