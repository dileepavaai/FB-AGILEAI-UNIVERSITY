/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-detail-actions.js
   Version   : 2.0.0
   Status    : ACTIVE
   Phase     : Sprint 2E

   Purpose
   ----------------------------------------------------------
   Credential Detail Experience Actions

   Responsibilities

   ✓ Launch Credential Detail Experience
   ✓ Launch University Certificate
   ✓ Launch Trainer Certificate
   ✓ Launch Digital Badge
   ✓ Launch Recognition Experience
   ✓ Future LinkedIn Share
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

========================================================== */

(function (window) {

    "use strict";

    const CredentialDetailActions = {

        /* ==================================================
           OPEN EXPERIENCE
        ================================================== */

        open(
            credentialId
        ) {

            if (!credentialId) {

                console.warn(
                    "[CredentialDetailActions] Missing credential ID."
                );

                return;

            }

            if (

                !window.CredentialService ||

                typeof window.CredentialService
                    .getCredentialById !== "function"

            ) {

                console.warn(
                    "[CredentialDetailActions] CredentialService unavailable."
                );

                return;

            }

            const credential =

                window.CredentialService
                    .getCredentialById(
                        credentialId
                    );

            if (!credential) {

                console.warn(
                    "[CredentialDetailActions] Credential not found:",
                    credentialId
                );

                return;

            }

            if (

                window.CredentialDetailOverlay &&

                typeof window
                    .CredentialDetailOverlay
                    .open === "function"

            ) {

                console.info(

                    "[CredentialDetailActions] Opening credential detail experience:",

                    credential.credential_id

                );

                window
                    .CredentialDetailOverlay
                    .open(
                        credential
                    );

                return;

            }

            console.warn(

                "[CredentialDetailActions] CredentialDetailOverlay unavailable."

            );

        },

        

        /* ==================================================
        OPEN ASSET EXPERIENCE
        ================================================== */

        openAsset(
            credential,
            asset
        ) {

            if (!credential) {

                console.warn(
                    "[CredentialDetailActions] Missing credential."
                );

                return;

            }

            if (
                window.CredentialDetailOverlay &&
                typeof window.CredentialDetailOverlay.open === "function"
            ) {

                window.CredentialDetailOverlay.open(
                    credential,
                    {
                        section: "assets",
                        asset
                    }
                );

                return;

            }

            console.warn(
                "[CredentialDetailActions] CredentialDetailOverlay unavailable."
            );

        },

                /* ==================================================
           UNIVERSITY CERTIFICATE
        ================================================== */

        openUniversityCertificate(
            credential
        ) {

            this.openAsset(
                credential,
                "universityCertificate"
            );

        },

        /* ==================================================
           TRAINER CERTIFICATE
        ================================================== */

        openTrainerCertificate(
            credential
        ) {

            this.openAsset(
                credential,
                "trainerCertificate"
            );

        },

        /* ==================================================
           DIGITAL BADGE
        ================================================== */

        openDigitalBadge(
            credential
        ) {

            this.openAsset(
                credential,
                "digitalBadge"
            );

        },

        /* ==================================================
           RECOGNITION
        ================================================== */

        openRecognition(
            credential
        ) {

            this.openAsset(
                credential,
                "recognition"
            );

        },

        /* ==================================================
           FUTURE
        ================================================== */

        shareLinkedIn(
            credential
        ) {

            console.info(

                "[CredentialDetailActions] LinkedIn",

                credential

            );

        },

        exportWallet(
            credential
        ) {

            console.info(

                "[CredentialDetailActions] Wallet",

                credential

            );

        }

    };

    Object.freeze(
        CredentialDetailActions
    );

    window.CredentialDetailActions =
        CredentialDetailActions;

})(window);