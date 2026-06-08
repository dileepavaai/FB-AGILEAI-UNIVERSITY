/*
==================================================
Agile AI University
Credential Operations Suite

Certificate Generator
PDF Export Engine

Version: 1.1.0

Purpose:
- Generate PDF from Certificate Template
- Enforce ISO A4 Landscape Standard
- Governance-Compliant Certificate Export

Governance Lock:
- PDF Format: ISO A4 Landscape
- Page Size: 297mm × 210mm
- No Dynamic Page Sizing
- No Portrait Rendering
- Single Source Rendering:
  certificate-template.html

Locked:
March 2026
==================================================
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

        pdf.save(
            "certificate.pdf"
        );

    }
    catch (error) {

        console.error(error);

        alert(
            "PDF generation failed."
        );

    }

};