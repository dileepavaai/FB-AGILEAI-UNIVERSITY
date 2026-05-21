/* =========================================================
   Horizontal Expand / Collapse Sections
========================================================= */

function toggleSection(sectionId, buttonElement) {

    const section = document.getElementById(sectionId);

    if (!section) {
        return;
    }

    const isVisible =
        section.style.display === "block";

    /* =====================================================
       Close All Sections
    ===================================================== */

    const allSections =
        document.querySelectorAll(
            ".horizontal-tab-content"
        );

    allSections.forEach((item) => {
        item.style.display = "none";
    });

    /* =====================================================
       Reset All Buttons
    ===================================================== */

    const allButtons =
        document.querySelectorAll(
            ".horizontal-tab"
        );

    allButtons.forEach((button) => {

        button.innerHTML =
            button.innerHTML.replace("−", "+");

    });

    /* =====================================================
       Toggle Current Section
    ===================================================== */

    if (!isVisible) {

        section.style.display = "block";

        buttonElement.innerHTML =
            buttonElement.innerHTML.replace("+", "−");

    }

}

/* =========================================================
   Vertical Workspace Tabs
========================================================= */

function openVerticalTab(panelId) {

    const panels =
        document.querySelectorAll(
            ".workspace-content"
        );

    panels.forEach((panel) => {
        panel.classList.remove(
            "active-workspace"
        );
    });

    const tabs =
        document.querySelectorAll(
            ".vertical-tab"
        );

    tabs.forEach((tab) => {
        tab.classList.remove(
            "active-vertical-tab"
        );
    });

    const selectedPanel =
        document.getElementById(panelId);

    if (selectedPanel) {

        selectedPanel.classList.add(
            "active-workspace"
        );

    }

    event.target.classList.add(
        "active-vertical-tab"
    );

}

/* =========================================================
   Simulation Progress Engine
========================================================= */

let completedSteps = 0;

const completedStepSet = new Set();

/* ========================================================= */

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

/* ========================================================= */

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