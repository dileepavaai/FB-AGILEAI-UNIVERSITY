/* =========================================================
   Classic Incident Simulation Engine
========================================================= */

let completedSteps = [];

/* =========================================================
   Complete Step
========================================================= */

function completeStep(stepNumber) {

    if (completedSteps.includes(stepNumber)) {
        return;
    }

    completedSteps.push(stepNumber);

    const stepElement =
        document.getElementById(`step-${stepNumber}`);

    if (stepElement) {
        stepElement.classList.add("step-completed");
    }

    updateSimulationProgress();

}

/* =========================================================
   Update Progress
========================================================= */

function updateSimulationProgress() {

    const totalSteps = 5;

    const completedCount =
        completedSteps.length;

    const progressPercentage =
        (completedCount / totalSteps) * 100;

    /* =====================================================
       Progress Text
    ===================================================== */

    const progressText =
        document.getElementById("progress-text");

    if (progressText) {

        progressText.innerText =
            `${completedCount} of ${totalSteps} operational actions completed.`;

    }

    /* =====================================================
       Progress Bar
    ===================================================== */

    const progressBar =
        document.getElementById("progress-bar");

    if (progressBar) {

        progressBar.style.width =
            `${progressPercentage}%`;

    }

    /* =====================================================
       Operational Status
    ===================================================== */

    const statusElement =
        document.getElementById("simulation-status");

    if (statusElement) {

        if (completedCount === 0) {

            statusElement.innerText =
                "Operational State: Active Incident Monitoring";

        }

        if (completedCount >= 2) {

            statusElement.innerText =
                "Operational State: Escalation Coordination Active";

        }

        if (completedCount >= 4) {

            statusElement.innerText =
                "Operational State: Leadership Response In Progress";

        }

        if (completedCount >= 5) {

            statusElement.innerText =
                "Operational State: Incident Coordination Completed";

        }

    }

    /* =====================================================
       Completion Banner
    ===================================================== */

    const completionBanner =
        document.getElementById("completion-banner");

    if (
        completionBanner &&
        completedCount >= totalSteps
    ) {

        completionBanner.style.display =
            "block";

    }

}

/* =========================================================
   Initialize
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateSimulationProgress();

    }
);