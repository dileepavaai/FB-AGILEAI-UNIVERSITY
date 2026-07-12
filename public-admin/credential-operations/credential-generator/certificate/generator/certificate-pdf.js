/*

Agile AI University
Credential Operations Suite

Certificate Generator
PDF Export Engine

Version: 1.3.2

Purpose:
- Generate PDF from Certificate Template
- Enforce ISO A4 Landscape Standard
- Upload generated PDF to Firebase Storage
- Publish asset metadata to credential_assets
- Preserve local PDF download
- Emit Storage initialization diagnostics for upload troubleshooting

Governance:
- Admin Portal publishes generated assets
- Student Portal only consumes published assets
- credentials collection is the source of truth
- credential_assets is the asset registry only
- Generated assets must be uploaded before publication
- Published asset records must contain real Storage URLs
- Diagnostic logging must not modify credential or asset data

Change History:

v1.3.2
- Adds Firebase Storage initialization diagnostics
- Logs the active Storage bucket before upload
- Logs the active Firebase project ID before upload
- Logs the resolved credential asset storage path
- Supports troubleshooting of Admin credential asset publishing failures
- Preserves existing PDF generation, upload, publication, and local download behaviour

v1.3.1
- Generates an ISO A4 landscape certificate PDF
- Converts the certificate template into a PDF asset
- Uploads the generated PDF to Firebase Storage
- Retrieves the Firebase Storage download URL
- Publishes certificate metadata to credential_assets
- Preserves local certificate PDF download

*/

import {
    storage
} from "../../../../assets/js/core.js?v=3.0.1";

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

        console.info(
            "[CertificatePdf] Storage diagnostics:",
            {
                bucket:
                    storage?.app?.options?.storageBucket || "missing",
                projectId:
                    storage?.app?.options?.projectId || "missing",
                storagePath
            }
        );

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