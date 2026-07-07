/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-detail-actions.js
   Version   : 2.1.0
   Status    : ACTIVE
   Phase     : Sprint 2E.1

   Purpose
   ----------------------------------------------------------
   Credential Detail Experience Actions

   Responsibilities

   ✓ Launch Credential Detail Experience
   ✓ Launch Credential Asset Preview
   ✓ Download Credential Assets
   ✓ Share Credential on LinkedIn
   ✓ Launch Recognition Experience
   ✓ Future Wallet Export

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ Dashboard Rendering
   ✗ Overlay Rendering

   Governance

   • Credential Experience Action Authority
   • Experience Orchestration Layer
   • Single Responsibility
   • Enterprise Portal Standard
   • No Nested Overlay

========================================================== */

(function (window) {

    "use strict";

    let activeCredential = null;

    const CredentialDetailActions = {

        open(credentialId) {

            const credential =
                this.resolveCredential(
                    credentialId
                );

            if (!credential) {
                return;
            }

            activeCredential =
                credential;

            if (
                window.CredentialDetailOverlay &&
                typeof window.CredentialDetailOverlay.open === "function"
            ) {

                window.CredentialDetailOverlay.open(
                    credential
                );

                return;

            }

            console.warn(
                "[CredentialDetailActions] CredentialDetailOverlay unavailable."
            );

        },

        previewAsset(assetType) {

            const credential =
                this.getActiveCredential();

            if (!credential || !assetType) {
                return;
            }

            if (
                window.CredentialDetailOverlay &&
                typeof window.CredentialDetailOverlay.showAssetPreview === "function"
            ) {

                window.CredentialDetailOverlay.showAssetPreview(
                    assetType
                );

                return;

            }

            console.warn(
                "[CredentialDetailActions] Asset preview unavailable."
            );

        },

        download(assetType) {

            const credential =
                this.getActiveCredential();

            if (
                !credential ||
                !assetType ||
                !window.CredentialAssetPreview ||
                typeof window.CredentialAssetPreview.download !== "function"
            ) {

                console.warn(
                    "[CredentialDetailActions] Download unavailable."
                );

                return;

            }

            window.CredentialAssetPreview.download(
                credential,
                assetType
            );

        },

        shareLinkedIn() {

            const credential =
                this.getActiveCredential();

            if (
                !credential ||
                !window.CredentialAssetPreview ||
                typeof window.CredentialAssetPreview.shareOnLinkedIn !== "function"
            ) {

                console.warn(
                    "[CredentialDetailActions] LinkedIn share unavailable."
                );

                return;

            }

            window.CredentialAssetPreview.shareOnLinkedIn(
                credential
            );

        },

        backToDetails() {

            if (
                window.CredentialDetailOverlay &&
                typeof window.CredentialDetailOverlay.showDetails === "function"
            ) {

                window.CredentialDetailOverlay.showDetails();

            }

        },

        close() {

            activeCredential = null;

            if (
                window.CredentialDetailOverlay &&
                typeof window.CredentialDetailOverlay.close === "function"
            ) {

                window.CredentialDetailOverlay.close();

            }

        },

        openUniversityCertificate(credential) {

            activeCredential =
                credential || activeCredential;

            this.previewAsset(
                "university-certificate"
            );

        },

        openTrainerCertificate(credential) {

            activeCredential =
                credential || activeCredential;

            this.previewAsset(
                "trainer-certificate"
            );

        },

        openDigitalBadge(credential) {

            activeCredential =
                credential || activeCredential;

            this.previewAsset(
                "digital-badge"
            );

        },

        openRecognition(credential) {

            activeCredential =
                credential || activeCredential;

            console.info(
                "[CredentialDetailActions] Recognition experience:",
                activeCredential
            );

        },

        exportWallet(credential) {

            activeCredential =
                credential || activeCredential;

            console.info(
                "[CredentialDetailActions] Wallet export:",
                activeCredential
            );

        },

        resolveCredential(credentialId) {

            if (!credentialId) {

                console.warn(
                    "[CredentialDetailActions] Missing credential ID."
                );

                return null;

            }

            if (
                !window.CredentialService ||
                typeof window.CredentialService.getCredentialById !== "function"
            ) {

                console.warn(
                    "[CredentialDetailActions] CredentialService unavailable."
                );

                return null;

            }

            const credential =
                window.CredentialService.getCredentialById(
                    credentialId
                );

            if (!credential) {

                console.warn(
                    "[CredentialDetailActions] Credential not found:",
                    credentialId
                );

                return null;

            }

            return credential;

        },

        getActiveCredential() {

            if (!activeCredential) {

                console.warn(
                    "[CredentialDetailActions] No active credential."
                );

            }

            return activeCredential;

        }

    };

    Object.freeze(
        CredentialDetailActions
    );

    window.CredentialDetailActions =
        CredentialDetailActions;

})(window);