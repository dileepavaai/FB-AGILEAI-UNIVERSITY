/* =========================================================
   Environment Metrics Engine
   Agile AI Leadership Lab

   Purpose:
   Manage operational metric evolution,
   progress tracking,
   stabilization visibility,
   and simulation completion metrics.

========================================================= */

/* =========================================================
   Dynamic Metric Evolution Engine
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

            const previousValue =
                value.innerText.trim();

            if (
                previousValue === newValue
            ) {

                return;

            }

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