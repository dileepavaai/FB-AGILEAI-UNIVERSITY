/*

Agile AI University
Credential Operations Suite

Certificate Generator
PDF Export Engine

Version: 1.1.0

Purpose:

* Generate PDF from Certificate Template
* Enforce ISO A4 Landscape Standard
* Governance-Compliant Certificate Export

PDF Governance:

* PDF Format: ISO A4 Landscape
* Page Size: 297mm × 210mm
* No Dynamic Page Sizing
* No Portrait Rendering
* Fixed Rendering Dimensions
* Single Source Rendering:
  certificate-template.html

Audit Event Governance:

Prepared Events:

* certificate.generate.started
* certificate.generate.completed
* certificate.download.completed

Purpose:
Prepare future audit logging integration
without introducing persistence or
backend dependencies.

Current Implementation:

* Console event placeholders only
* No database logging
* No API logging
* No audit persistence

Future Integration:
Audit event placeholders may be connected
to the Credential Operations Suite Audit Logs
module in a future phase.

Governance Lock:
June 2026
=========

*/

window.generateCertificatePdf = async function () {

try {

    const certificateElement =
        document.querySelector(
            "#pdfRenderContainer .certificate-template"
        );

    if (!certificateElement) {

        alert(
            "Certificate preview not found."
        );

        return;

    }

    console.log(
        "CERT DIMENSIONS",
        certificateElement.offsetWidth,
        certificateElement.offsetHeight,
        certificateElement.scrollWidth,
        certificateElement.scrollHeight
    );

    console.log(
        "certificate.generate.started"
    );

    const canvas =
        await html2canvas(
            certificateElement,
            {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff"
            }
        );

    console.log(
        "CANVAS DIMENSIONS",
        canvas.width,
        canvas.height
    );

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

    pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        297,
        210
    );

    console.log(
        "certificate.generate.completed"
    );

    pdf.save(
        "certificate.pdf"
    );

    console.log(
        "certificate.download.completed"
    );

}
catch (error) {

    console.error(error);

    alert(
        "PDF generation failed."
    );

}

};