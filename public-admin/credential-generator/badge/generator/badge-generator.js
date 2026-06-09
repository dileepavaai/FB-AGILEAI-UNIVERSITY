/* =====================================================
Agile AI University
Credential Operations Suite

Badge Generator Controller

Version: 1.1.0

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

const badgePreview =
    document.getElementById(
        "badgePreview"
    );

async function renderBadgePreview() {

    if (!badgePreview) return;

    try {

        const response =
            await fetch(
                "../template/badge-template.html"
            );

        const template =
            await response.text();

        badgePreview.innerHTML =
            template;

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

            credentialTitle.textContent =
                "Artificial Intelligence Professional Agilist (AIPA)";

        }

        if (credentialCode) {

            credentialCode.textContent =
                "AIPA";

        }

        if (credentialId) {

            credentialId.textContent =
                "AAU-DEMO-001";

        }

    }
    catch (error) {

        console.error(
            "Badge Preview Error:",
            error
        );

    }

}

renderBadgePreview();

console.log(
    "Badge Generator Controller v1.1.0 loaded"
);

});