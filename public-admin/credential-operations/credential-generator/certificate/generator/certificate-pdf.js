/*

Agile AI University
Credential Operations Suite

Certificate Generator
PDF Export Engine

Version: 1.3.1

Purpose:
- Generate PDF from Certificate Template
- Enforce ISO A4 Landscape Standard
- Upload generated PDF to Firebase Storage
- Publish asset metadata to credential_assets
- Preserve local PDF download

Governance:
- Admin Portal publishes generated assets
- Student Portal only consumes published assets
- credentials collection is the source of truth
- credential_assets is the asset registry only

*/

import { storage } from "../../../../assets/js/core.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

window.generateCertificatePdf = async function () {

    try {

        const certificateElement =
            document.querySelector(
                "#pdfRenderContainer .certificate-template"
            );

        if (!certificateElement) {

            alert("Certificate preview not found.");

            return;

        }

        const credential =
            window.loadedCredential ||
            window.currentCredential ||
            window.selectedCredential ||
            null;

        if (!credential || !credential.credential_id) {

            alert(
                "Credential data not available for asset publishing."
            );

            return;

        }

        if (!window.CredentialAssetPublisher) {

            throw new Error(
                "CredentialAssetPublisher is not available."
            );

        }

        console.log("certificate.generate.started");

        const canvas =
            await html2canvas(
                certificateElement,
                {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: "#ffffff"
                }
            );

        const imageData =
            canvas.toDataURL("image/png");

        const {
            jsPDF
        } = window.jspdf;

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

        console.log("certificate.generate.completed");

        const credentialId =
            credential.credential_id;

        const fileName =
            `${credentialId}_university_certificate.pdf`;

        const storagePath =
            `credential-assets/${credentialId}/university-certificate/${fileName}`;

        const pdfBlob =
            pdf.output("blob");

        const storageRef =
            ref(
                storage,
                storagePath
            );

        await uploadBytes(
            storageRef,
            pdfBlob,
            {
                contentType: "application/pdf"
            }
        );

        const downloadUrl =
            await getDownloadURL(storageRef);

        await window.CredentialAssetPublisher
            .publishUniversityCertificate({
                credential_id: credentialId,
                download_url: downloadUrl,
                preview_url: downloadUrl,
                storage_path: storagePath,
                file_name: fileName,
                version: 1
            });

        pdf.save(fileName);

        console.log("certificate.download.completed");

        alert(
            "University Certificate generated and published successfully."
        );

    }
    catch (error) {

        console.error(
            "PDF generation or publishing failed:",
            error
        );

        alert(
            "PDF generation or publishing failed."
        );

    }

};