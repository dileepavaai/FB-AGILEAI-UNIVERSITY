/* ==========================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Credential Validation

File        : credential-validation.js
Version     : 1.0.0
Status      : ACTIVE

Governance  : Portal Governance v1.0

Purpose
----------------------------------------------------------

Provides governed validation utilities for
credential objects consumed by the portal.

Responsibilities

✓ Validate credential object

✓ Validate required properties

✓ Validate credential identity

✓ Validate program association

✓ Validate lifecycle information

✓ Validate recognition readiness

Must Never

✗ Query Firestore

✗ Resolve Entitlements

✗ Perform Authorization

✗ Render UI

✗ Modify Credential Data

✗ Call APIs

Dependencies

None

Consumers

credential-service.js
credential-detail-overlay.js
credential-detail-actions.js

========================================================== */

(function (window) {

    "use strict";

    const CredentialValidation = {

        /* ==============================================
           CREDENTIAL
        ============================================== */

        validate(credential) {

            if (!credential) {

                console.warn(
                    "[CredentialValidation] Missing credential."
                );

                return false;

            }

            if (!credential.credential_id) {

                console.warn(
                    "[CredentialValidation] Missing credential_id."
                );

                return false;

            }

            if (!credential.program_code) {

                console.warn(
                    "[CredentialValidation] Missing program_code."
                );

                return false;

            }

            return true;

        },

        /* ==============================================
           IDENTITY
        ============================================== */

        validateIdentity(credential) {

            return Boolean(

                credential &&

                credential.credential_id &&

                credential.program_code

            );

        },

        /* ==============================================
           HOLDER
        ============================================== */

        validateHolder(credential) {

            return Boolean(

                credential &&

                (

                    credential.full_name ||

                    credential.learner_name

                )

            );

        },

        /* ==============================================
           PROGRAM
        ============================================== */

        validateProgram(credential) {

            return Boolean(

                credential &&

                credential.program_code

            );

        },

        /* ==============================================
           STATUS
        ============================================== */

        validateStatus(credential) {

            return Boolean(

                credential &&

                credential.status

            );

        },

        /* ==============================================
           VALIDITY
        ============================================== */

        validateValidity(credential) {

            return Boolean(

                credential &&

                credential.validity

            );

        },

        /* ==============================================
           RECOGNITION
        ============================================== */

        validateRecognition(credential) {

            return Boolean(

                credential &&

                credential.credential_id

            );

        }

    };

    Object.freeze(
        CredentialValidation
    );

    window.CredentialValidation =
        CredentialValidation;

})(window);