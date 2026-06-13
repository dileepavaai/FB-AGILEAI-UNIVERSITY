/* =====================================================
Agile AI University
Credential Operations Suite

Badge Generator Controller

Version: 1.1.1

Purpose:

* Render Badge Preview
* Populate Badge Template
* Support Badge Visual Standard v2.1
* Prepare PNG Export Workflow

Governance:

* Read Only
* No Registry Writes
* No Credential Modification
* Professional Recognition Badge Only

Badge Standard:
v2.1

Rendering Authority:
Credential Operations Suite

Status:
LOCKED

Governance Lock:
June 2026

===================================================== */

document.addEventListener("DOMContentLoaded", () => {

console.log(
    "Badge Generator Started"
);

const badgePreview =
    document.getElementById(
        "badgePreview"
    );

if (!badgePreview) {

    console.error(
        "badgePreview container not found"
    );

    return;

}

async function renderBadgePreview() {

    try {

        console.log(
            "Fetching badge template..."
        );

        const response =
            await fetch(
                "./template/badge-template.html"
            );

        console.log(
            "Template Response Status:",
            response.status
        );

        if (!response.ok) {

            throw new Error(
                "Template fetch failed. HTTP " +
                response.status
            );

        }

        const template =
            await response.text();

        console.log(
            "Template Length:",
            template.length
        );

        badgePreview.innerHTML =
            template;

        console.log(
            "Template injected successfully"
        );

        const credentialTitle =
            badgePreview.querySelector(
                "#badgeCredentialTitle"
            );

        const credentialCode =
            badgePreview.querySelector(
                "#badgeCredentialCode"
            );

        const credentialId =
            badgePreview.querySelector(
                "#badgeCredentialId"
            );

        if (credentialTitle) {

            credentialTitle.innerHTML =
                "Artificial Intelligence<br>Professional Agilist";

        } else {

            console.warn(
                "#badgeCredentialTitle not found"
            );

        }

        if (credentialCode) {

            credentialCode.textContent =
                "AIPA";

        } else {

            console.warn(
                "#badgeCredentialCode not found"
            );

        }

        if (credentialId) {

            credentialId.textContent =
                "AAU-DEMO-001";

        } else {

            console.warn(
                "#badgeCredentialId not found"
            );

        }

        console.log(
            "Badge preview rendered successfully"
        );

    }
    catch (error) {

        console.error(
            "Badge Preview Error:",
            error
        );

        badgePreview.innerHTML =
            `
            <div style="padding:20px;">
                <h3>Badge Preview Error</h3>
                <p>${error.message}</p>
            </div>
            `;

    }

}

renderBadgePreview();

console.log(
    "Badge Generator Controller v1.1.1 loaded"
);

});