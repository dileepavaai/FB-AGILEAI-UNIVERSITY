/* =========================================================
   Environment Diagnosis Engine
   Agile AI Leadership Lab

   Purpose:
   Centralized leadership diagnosis management,
   diagnosis rendering,
   diagnosis persistence,
   diagnosis learning feedback,
   and outcome diagnosis summary generation.

   Version:
   v1.1 — Diagnosis Learning Feedback Stabilization

   Version History

   v1.0
   - Initial diagnosis rendering
   - Diagnosis persistence
   - Outcome diagnosis summary
   - Runtime diagnostics

   v1.1
   - Diagnosis learning feedback layer
   - Correct diagnosis reinforcement
   - Incorrect diagnosis coaching
   - Evidence-based explanation framework
   - Learner reasoning visibility

========================================================= */

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
        "The reviewed evidence indicates a Release Coordination Breakdown caused by fragmented ownership, dependency instability, delayed operational visibility, and unresolved recovery coordination.",

    diagnosisFeedback: {

        "Customer Demand Increase": {

            review:
                "Customer-facing pressure is visible through escalations and service concerns. It is reasonable to consider increased demand as a potential source of instability.",

            rationale:
                "The reviewed evidence does not indicate transaction growth, demand spikes, capacity saturation, or scaling constraints. The stronger pattern involves coordination breakdown across operational teams."

        },

        "Infrastructure Failure": {

            review:
                "Infrastructure dependencies appear throughout the investigation and contribute to operational disruption.",

            rationale:
                "The evidence does not indicate a major platform outage or widespread infrastructure collapse. Infrastructure concerns appear as symptoms of broader coordination and dependency management challenges."

        },

        "Release Coordination Breakdown": {

            review:
                "Multiple evidence sources point to fragmented ownership, unresolved dependencies, delayed operational visibility, escalation coordination challenges, and uncertainty around recovery actions.",

            rationale:
                "These signals collectively indicate a Release Coordination Breakdown."

        },

        "Resource Shortage": {

            review:
                "Teams are operating under pressure and delivery timelines are being affected, making resource constraints a reasonable consideration.",

            rationale:
                "The reviewed evidence does not consistently indicate staffing shortages or insufficient operational capacity. The stronger pattern involves fragmented ownership and recovery coordination gaps."

        }

    }

};

/* =========================================================
   Recovery Leadership Decision Configuration
========================================================= */

const recoveryDecision = {

    question:
        "As Recovery Lead, what should be your first stabilization action?",

    options: [

        "Executive Escalation",

        "Establish Recovery Ownership",

        "Freeze All Deployments",

        "Launch Customer Communications"

    ],

    correctAnswer:
        "Establish Recovery Ownership",

    explanation:
        "The reviewed evidence consistently points toward fragmented ownership, dependency instability, delayed visibility, and recovery coordination gaps. Before escalation, communications, or deployment controls can be effective, leadership must first establish clear recovery ownership and accountability."

};

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

    const isCorrect =
        selectedAnswer ===
        leadershipDiagnosis.correctAnswer;

    const diagnosisReview =
        leadershipDiagnosis
            .diagnosisFeedback[
                selectedAnswer
            ];

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

            <h3>
                Your Diagnosis
            </h3>

            <p>

                <strong>
                    ${selectedAnswer}
                </strong>

            </p>

            <h3>
                ${
                    isCorrect
                        ? "✓ Correct Diagnosis"
                        : "Diagnosis Review"
                }
            </h3>

            <p>
                ${diagnosisReview.review}
            </p>

            <p>
                ${diagnosisReview.rationale}
            </p>

            <h3>
                Recommended Diagnosis
            </h3>

            <p>

                <strong>
                    ${leadershipDiagnosis.correctAnswer}
                </strong>

            </p>

            <h3>
                Why This Diagnosis Fits Best
            </h3>

            <p>
                ${leadershipDiagnosis.explanation}
            </p>

            <h3>
                Leadership Interpretation
            </h3>

            <p>

                Effective operational leaders
                distinguish between symptoms
                and root causes.

                While customer pressure,
                infrastructure concerns,
                and delivery stress are visible
                across the environment,
                the strongest evidence pattern
                points toward coordination failure.

                Stabilizing ownership,
                dependencies,
                visibility,
                and recovery governance
                becomes the primary leadership
                responsibility.

            </p>

        </div>

    `;

    renderRecoveryDecision();

}

/* =========================================================
   Recovery Leadership Decision Renderer
========================================================= */

function renderRecoveryDecision() {

    const container =
        document.getElementById(
            "recovery-decision-container"
        );

    if (!container) {

        return;

    }

    container.style.display =
        "block";

    container.innerHTML = `

        <div class="info-card">

            <h3>
                Recovery Leadership Decision
            </h3>

            <p>
                ${recoveryDecision.question}
            </p>

            ${recoveryDecision.options
                .map(
                    option => `
                        <label
                            style="
                                display:block;
                                margin-bottom:12px;
                            "
                        >

                            <input
                                type="radio"
                                name="recovery-decision"
                                value="${option}"
                            >

                            ${option}

                        </label>
                    `
                )
                .join("")
            }

            <button
                class="simulation-button"
                onclick="submitRecoveryDecision()"
            >
                Submit Recovery Decision
            </button>

            <div
                id="recovery-decision-feedback"
                style="margin-top:1rem;"
            ></div>

        </div>

    `;

}

/* =========================================================
   Recovery Leadership Decision Submission
========================================================= */

function submitRecoveryDecision() {

    const selectedOption =
        document.querySelector(
            'input[name="recovery-decision"]:checked'
        );

    const feedback =
        document.getElementById(
            "recovery-decision-feedback"
        );

    if (
        !selectedOption ||
        !feedback
    ) {

        return;

    }

    const selectedAnswer =
        selectedOption.value;

    const isCorrect =
        selectedAnswer ===
        recoveryDecision.correctAnswer;

    sessionStorage.setItem(
        "recoveryDecision",
        selectedAnswer
    );

    feedback.innerHTML = `

        <div class="info-card">

            <h3>

                ${
                    isCorrect
                        ? "✓ Recommended Recovery Action"
                        : "Recovery Decision Review"
                }

            </h3>

            <p>

                Your Decision:

                <strong>
                    ${selectedAnswer}
                </strong>

            </p>

            <p>

                Recommended Action:

                <strong>
                    ${recoveryDecision.correctAnswer}
                </strong>

            </p>

            <p>
                ${recoveryDecision.explanation}
            </p>

        </div>

    `;

}

/* =========================================================
   Outcome Diagnosis Summary
========================================================= */

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

            Recommended Diagnosis:

            <strong>
                ${leadershipDiagnosis.correctAnswer}
            </strong>

        </p>

        <p>

            Effective leaders investigate
            evidence patterns before initiating
            recovery actions.

        </p>

    `;

}

/* =========================================================
   Runtime Diagnostics
========================================================= */

console.log(
    "[Environment Diagnosis] Engine v1.1 initialized"
);

console.log(
    "[Environment Diagnosis] Diagnosis Learning Feedback Active"
);