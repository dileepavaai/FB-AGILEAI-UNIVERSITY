/* =====================================================
Agile AI University
Credential Operations Suite

Badge Generator Controller

Version: 1.0.0

Purpose:

* Render Badge Preview
* Populate Badge Template
* Prepare PNG Export Workflow

Governance:

* Read Only
* No Registry Writes
* No Credential Modification
* Professional Recognition Badge Only

Badge Standard:
v1.0

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
                "./template/badge-template.html"
            );

        const template =
            await response.text();

        badgePreview.innerHTML =
            template;

        const credentialTitle =
            badgePreview.querySelector(
                "#badgeCredentialTitle"
            );

        const credentialId =
            badgePreview.querySelector(
                "#badgeCredentialId"
            );

        if (credentialTitle) {

            credentialTitle.textContent =
                "Artificial Intelligence Professional Agilist (AIPA)";

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
    "Badge Generator Controller v1.0.0 loaded"
);

});
