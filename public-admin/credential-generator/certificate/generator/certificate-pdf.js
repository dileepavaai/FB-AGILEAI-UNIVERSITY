window.generateCertificatePdf = async function () {

    try {

        const certificateElement =
            document.querySelector(
                ".certificate-template"
            );

        if (!certificateElement) {

            alert(
                "Certificate preview not found."
            );

            return;

        }

        const canvas =
            await html2canvas(
                certificateElement,
                {
                    scale: 2
                }
            );

        const imageData =
            canvas.toDataURL(
                "image/png"
            );

        const {
            jsPDF
        } = window.jspdf;

        const pdf =
            new jsPDF(
                "portrait",
                "mm",
                "a4"
            );

        const pdfWidth =
            pdf.internal.pageSize.getWidth();

        const pdfHeight =
            (
                canvas.height *
                pdfWidth
            ) /
            canvas.width;

        pdf.addImage(
            imageData,
            "PNG",
            0,
            0,
            pdfWidth,
            pdfHeight
        );

        pdf.save(
            "certificate.pdf"
        );

    }
    catch (error) {

        console.error(
            error
        );

        alert(
            "PDF generation failed."
        );

    }

};