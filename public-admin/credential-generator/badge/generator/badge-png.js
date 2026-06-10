/*

Agile AI University
Credential Operations Suite

Badge Generator
PNG Export Engine

Version: 1.0.0

Purpose:

* Generate PNG from Badge Template
* Export Professional Recognition Badge
* Governance-Compliant Badge Download

Badge Governance:

* PNG Format Only
* Fixed Rendering Surface
* Single Source Rendering:
  badge-template.html
* No Registry Modification
* No Credential Mutation

Audit Event Governance:

Prepared Events:

* badge.generate.started
* badge.generate.completed
* badge.download.completed

Current Implementation:

* Console event placeholders only
* No database logging
* No API logging
* No audit persistence

Future Integration:

Audit event placeholders may be connected
to Credential Operations Suite Audit Logs.

Governance Lock:
June 2026

==================================================
*/

window.generateBadgePng = async function () {

    try {

        const badgeElement =
            document.querySelector(
                "#pngRenderContainer .badge-template"
            );

        if (!badgeElement) {

            alert(
                "Badge preview not found."
            );

            return;

        }

        console.log(
            "badge.generate.started"
        );

        const canvas =
            await html2canvas(
                badgeElement,
                {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff"
                }
            );

        console.log(
            "badge.generate.completed"
        );

        const imageData =
            canvas.toDataURL(
                "image/png"
            );

        const downloadLink =
            document.createElement(
                "a"
            );

        downloadLink.href =
            imageData;

        downloadLink.download =
            "professional-recognition-badge.png";

        document.body.appendChild(
            downloadLink
        );

        downloadLink.click();

        document.body.removeChild(
            downloadLink
        );

        console.log(
            "badge.download.completed"
        );

    }
    catch (error) {

        console.error(
            error
        );

        alert(
            "PNG generation failed."
        );

    }

};