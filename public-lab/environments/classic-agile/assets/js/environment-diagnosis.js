/* =========================================================
   Environment Diagnosis Engine
   Agile AI Leadership Lab

   Purpose:
   Centralized leadership diagnosis management,
   diagnosis rendering,
   diagnosis persistence,
   and outcome diagnosis summary generation.

   Version:
   v1.0 — Initial Governance Stabilization

   Architecture Upgrade:
   - Diagnosis Governance Layer
   - Diagnosis Persistence Layer
   - Outcome Summary Rendering
   - Runtime Diagnostics Visibility
   - Architecture Ownership Definition

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
        "The reviewed evidence indicates a Release Coordination Breakdown caused by fragmented ownership, dependency instability, delayed operational visibility, and unresolved recovery coordination."

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
    "[Environment Diagnosis] Engine v1.0 initialized"
);

console.log(
    "[Environment Diagnosis] Diagnosis Layer Ready"
);