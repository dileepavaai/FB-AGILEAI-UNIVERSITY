/*

==================================================
Agile AI University

Credential Operations Suite

Trainer Certificate Generator
PDF Export Engine

Version: 1.3.0

Status:
Production

Purpose:

* Generate PDF from Trainer Certificate Template
* Enforce ISO A4 Landscape Standard
* Governance-Compliant Certificate Export
* Support Trainer Attribution Rendering
* Support Licensed Training Organization Rendering

PDF Governance:

* PDF Format: ISO A4 Landscape
* Page Size: 297mm × 210mm
* No Dynamic Page Sizing
* No Portrait Rendering
* Fixed Rendering Dimensions
* Single Source Rendering:
  trainer-certificate-template.html

Rendering Governance:

Trainer Certificate Rendering Standard v1.1

Must Render:

* Learner Name
* Credential Title
* Credential ID
* Accredited Trainer Name
* Trainer ID
* Licensed Training Organization Name
* Licensed Training Organization Emblem

Must Not Render:

* Trainer Signature
* Dynamic Layout Variations
* Non-Governed Content

Image Rendering Governance:

Purpose:

Ensure reliable rendering of
Licensed Training Organization emblems
during PDF generation.

Background:

Organization emblems are retrieved from
Firebase Storage and injected dynamically
into the Trainer Certificate Template.

Some browsers may complete DOM rendering
before remote image decoding is fully
completed.

Mitigation Controls:

* Wait for organization emblem load
* Support cached images
* Support newly downloaded images
* Enable html2canvas CORS mode
* Prevent tainted canvas rendering
* Apply render stabilization delay

Implementation Controls:

* useCORS = true
* allowTaint = false
* image load synchronization
* render stabilization delay

Audit Event Governance:

Prepared Events:

* trainercertificate.generate.started
* trainercertificate.generate.completed
* trainercertificate.download.completed

Current Implementation:

* Console event placeholders only
* No database logging
* No API logging
* No audit persistence

Future Integration:

Audit event placeholders may be connected
to the Credential Operations Audit Module
in a future release.

Change History:

v1.3.0
------------------------------------------
* Added organization emblem load
  synchronization
* Added PDF rendering stabilization delay
* Improved Firebase Storage image support
* Improved html2canvas rendering reliability

v1.2.0
------------------------------------------
* Initial PDF rendering implementation

Governance Lock:
June 2026

==================================================

*/

window.generateTrainerCertificatePdf = async function () {

    try {

        /*
        ==========================================
        Locate PDF Rendering Surface
        ==========================================
        */

        const certificateElement =
            document.querySelector(
                "#pdfRenderContainer .trainer-certificate-template"
            );

        if (!certificateElement) {

            alert(
                "Trainer certificate preview not found."
            );

            return;

        }

        console.log(
            "TRAINER CERTIFICATE GENERATION STARTED"
        );

        console.log(
            "TRAINER CERTIFICATE DIMENSIONS",
            certificateElement.offsetWidth,
            certificateElement.offsetHeight,
            certificateElement.scrollWidth,
            certificateElement.scrollHeight
        );

        /*
        ==========================================
        Wait For Organization Emblem

        Ensures Firebase Storage images are
        fully loaded before html2canvas capture.
        ==========================================
        */

        const organizationLogo =
            certificateElement.querySelector(
                "#trainercertOrganizationEmblem"
            );

        if (
            organizationLogo &&
            organizationLogo.src
        ) {

            console.log(
                "WAITING FOR ORGANIZATION EMBLEM..."
            );

            await new Promise(
                resolve => {

                    if (
                        organizationLogo.complete
                    ) {

                        resolve();

                    }
                    else {

                        organizationLogo.onload =
                            () => resolve();

                        organizationLogo.onerror =
                            () => resolve();

                    }

                }
            );

            /*
            ==========================================
            Render Stabilization Delay

            Allows browser image decoding and
            layout recalculation to complete
            before canvas capture.

            Particularly important for
            Firebase Storage hosted images.
            ==========================================
            */

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        500
                    )
            );

        }

        /*
        ==========================================
        Render Certificate To Canvas
        ==========================================
        */

        const canvas =
            await html2canvas(
                certificateElement,
                {
                    scale: 3,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: "#ffffff",
                    logging: false
                }
            );

        console.log(
            "CANVAS DIMENSIONS",
            canvas.width,
            canvas.height
        );

        /*
        ==========================================
        Convert Canvas To PNG
        ==========================================
        */

        const imageData =
            canvas.toDataURL(
                "image/png"
            );

        const {
            jsPDF
        } = window.jspdf;

        /*
        ==========================================
        ISO A4 Landscape Governance Lock

        Width  = 297 mm
        Height = 210 mm

        No dynamic sizing permitted.
        ==========================================
        */

        const pdf =
            new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4"
            });

        /*
        ==========================================
        Render Certificate Into PDF
        ==========================================
        */

        pdf.addImage(
            imageData,
            "PNG",
            0,
            0,
            297,
            210
        );

        console.log(
            "TRAINER CERTIFICATE GENERATION COMPLETED"
        );

        pdf.save(
            "trainer-certificate.pdf"
        );

        console.log(
            "TRAINER CERTIFICATE DOWNLOAD COMPLETED"
        );

    }
    catch (error) {

        console.error(error);

        alert(
            "Trainer certificate PDF generation failed."
        );

    }

};