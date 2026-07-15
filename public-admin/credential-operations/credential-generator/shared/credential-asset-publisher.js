/* ==========================================================
   Agile AI University
   Admin Credential Generator

   File      : credential-asset-publisher.js
   Version   : 1.4.0
   Status    : ACTIVE
   Phase     : Credential-First Asset Publication

   Purpose
   ----------------------------------------------------------
   Publishes generated credential asset metadata to the
   credential_assets Firestore registry.

   Firebase Standard
   ----------------------------------------------------------
   Uses Firebase Modular SDK v10 through:

   public-admin/assets/js/core.js

   Responsibilities
   ----------------------------------------------------------
   ✓ Validate credential asset publication payload
   ✓ Enforce credential-first asset authority
   ✓ Preserve learner ownership metadata when available
   ✓ Support historical credentials before portal activation
   ✓ Validate published Cloud Storage URLs
   ✓ Normalize credential asset metadata
   ✓ Publish latest asset metadata to Firestore
   ✓ Preserve deterministic document IDs
   ✓ Support certificate, trainer certificate, badge
     and recognition asset publication

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Generate certificates
   ✗ Generate badges
   ✗ Upload binary files
   ✗ Modify credentials collection
   ✗ Assign learner ownership
   ✗ Perform identity reconciliation
   ✗ Authenticate users
   ✗ Authorize administrators
   ✗ Render UI
   ✗ Read Student Portal data

   Governance
   ----------------------------------------------------------
   • Admin Platform is the asset publication authority
   • Student Portal is a read-only asset consumer
   • credentials is the credential metadata registry
   • credential_assets is the published asset registry
   • Cloud Storage stores binary assets
   • Firestore stores asset metadata and references
   • credential_id is the permanent asset authority
   • learner_uid is optional ownership metadata
   • Historical credentials may be published before activation
   • Existing learner ownership must never be removed
   • Identity reconciliation assigns learner_uid later
   • Only published HTTPS Cloud Storage URLs are accepted
   • No credential registry duplication

   Change History
   ----------------------------------------------------------
   v1.4.0
   • Adopted credential-first asset publication
   • Made learner_uid optional for historical credentials
   • Preserves an existing learner_uid during republication
   • Prevents republication from clearing established ownership
   • Added ownership_state metadata
   • Added learnerUidPresent diagnostics
   • Preserved deterministic document IDs
   • Preserved existing public publisher API
   • Preserved Storage URL validation
   • Preserved certificate, trainer certificate, badge
     and recognition publication support

   v1.3.0
   • Added mandatory learner_uid validation
   • Added learner ownership metadata persistence
   • Added HTTPS URL validation
   • Added Cloud Storage host validation
   • Added payload alias normalization
   • Added program and learner metadata support
   • Added published_by, published_at and source fields
   • Preserved existing public publisher API

   v1.2.0
   • Added modular Firebase publication
   • Added deterministic asset document IDs
   • Added published/latest asset metadata

========================================================== */

import {
    db
} from "../../../assets/js/core.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* ==========================================================
   CONSTANTS
========================================================== */

const MODULE_NAME =
    "CredentialAssetPublisher";

const MODULE_VERSION =
    "1.4.0";

const COLLECTION_NAME =
    "credential_assets";

const VALID_ASSET_TYPES =
    Object.freeze([
        "university_certificate",
        "trainer_certificate",
        "digital_badge",
        "recognition_asset"
    ]);

const ALLOWED_STORAGE_HOSTS =
    Object.freeze([
        "firebasestorage.googleapis.com",
        "storage.googleapis.com"
    ]);


/* ==========================================================
   CREDENTIAL ASSET PUBLISHER
========================================================== */

const CredentialAssetPublisher = {

    /* ======================================================
       DOCUMENT ID
    ====================================================== */

    buildDocumentId(
        credentialId,
        assetType
    ) {

        const normalizedCredentialId =
            this.normalizeString(
                credentialId
            );

        const normalizedAssetType =
            this.normalizeString(
                assetType
            );

        if (
            !normalizedCredentialId ||
            !normalizedAssetType
        ) {

            return "";

        }

        return (
            `${normalizedCredentialId}_${normalizedAssetType}`
        );

    },


    /* ======================================================
       PAYLOAD NORMALIZATION
    ====================================================== */

    normalizeInputPayload(
        payload
    ) {

        const source =
            payload || {};

        return {

            credential_id:
                this.normalizeString(
                    source.credential_id ||
                    source.credentialId
                ),

            /*
             * learner_uid is optional.
             *
             * Historical credentials may not have a Firebase
             * identity until the activation journey completes.
             */
            learner_uid:
                this.normalizeString(
                    source.learner_uid ||
                    source.learnerUid
                ),

            learner_name:
                this.normalizeString(
                    source.learner_name ||
                    source.learnerName
                ),

            learner_email:
                this.normalizeString(
                    source.learner_email ||
                    source.learnerEmail
                ),

            program_code:
                this.normalizeString(
                    source.program_code ||
                    source.programCode
                ),

            asset_type:
                this.normalizeString(
                    source.asset_type ||
                    source.assetType
                ),

            asset_label:
                this.normalizeString(
                    source.asset_label ||
                    source.assetLabel
                ),

            status:
                this.normalizeString(
                    source.status ||
                    "published"
                ),

            storage_path:
                this.normalizeString(
                    source.storage_path ||
                    source.storagePath
                ),

            download_url:
                this.normalizeString(
                    source.download_url ||
                    source.downloadUrl
                ),

            preview_url:
                this.normalizeString(
                    source.preview_url ||
                    source.previewUrl
                ),

            file_name:
                this.normalizeString(
                    source.file_name ||
                    source.fileName
                ),

            file_extension:
                this.normalizeString(
                    source.file_extension ||
                    source.fileExtension
                ),

            mime_type:
                this.normalizeString(
                    source.mime_type ||
                    source.mimeType
                ),

            asset_format:
                this.normalizeString(
                    source.asset_format ||
                    source.assetFormat
                ),

            version:
                this.normalizeVersion(
                    source.version
                ),

            created_at:
                source.created_at ||
                source.createdAt ||
                null

        };

    },


    /* ======================================================
       VALIDATION
    ====================================================== */

    validatePayload(
        payload
    ) {

        if (
            !payload
        ) {

            throw new Error(
                `[${MODULE_NAME}] Missing payload.`
            );

        }

        /*
         * credential_id is the permanent asset authority.
         */
        if (
            !payload.credential_id
        ) {

            throw new Error(
                `[${MODULE_NAME}] Missing credential_id.`
            );

        }

        /*
         * learner_uid is deliberately not mandatory.
         *
         * It may be unavailable for historical credentials
         * until identity activation is completed.
         */

        if (
            !payload.asset_type
        ) {

            throw new Error(
                `[${MODULE_NAME}] Missing asset_type.`
            );

        }

        if (
            !VALID_ASSET_TYPES.includes(
                payload.asset_type
            )
        ) {

            throw new Error(
                `[${MODULE_NAME}] Invalid asset_type: ` +
                `${payload.asset_type}`
            );

        }

        if (
            payload.status !==
            "published"
        ) {

            throw new Error(
                `[${MODULE_NAME}] Asset status must be published.`
            );

        }

        if (
            !payload.storage_path
        ) {

            throw new Error(
                `[${MODULE_NAME}] Missing storage_path.`
            );

        }

        if (
            !payload.download_url
        ) {

            throw new Error(
                `[${MODULE_NAME}] Missing download_url.`
            );

        }

        this.validatePublishedUrl(
            payload.download_url,
            "download_url"
        );

        if (
            payload.preview_url
        ) {

            this.validatePublishedUrl(
                payload.preview_url,
                "preview_url"
            );

        }

    },


    /* ======================================================
       PUBLISHED URL VALIDATION
    ====================================================== */

    validatePublishedUrl(
        value,
        fieldName
    ) {

        let parsedUrl;

        try {

            parsedUrl =
                new URL(
                    value
                );

        }
        catch (
            error
        ) {

            throw new Error(
                `[${MODULE_NAME}] ${fieldName} must be a valid absolute URL.`
            );

        }

        if (
            parsedUrl.protocol !==
            "https:"
        ) {

            throw new Error(
                `[${MODULE_NAME}] ${fieldName} must use HTTPS.`
            );

        }

        if (
            !ALLOWED_STORAGE_HOSTS.includes(
                parsedUrl.hostname
            )
        ) {

            throw new Error(
                `[${MODULE_NAME}] ${fieldName} must be a ` +
                `Firebase or Google Cloud Storage URL. ` +
                `Received host: ${parsedUrl.hostname}`
            );

        }

    },


    /* ======================================================
       EXISTING OWNERSHIP RESOLUTION
    ====================================================== */

    async resolveExistingLearnerUid(
        reference
    ) {

        const snapshot =
            await getDoc(
                reference
            );

        if (
            !snapshot.exists()
        ) {

            return "";

        }

        const existingData =
            snapshot.data() || {};

        return this.normalizeString(
            existingData.learner_uid ||
            existingData.learnerUid
        );

    },


    /* ======================================================
       FIRESTORE NORMALIZATION
    ====================================================== */

    normalizePayload(
        payload,
        effectiveLearnerUid
    ) {

        const now =
            serverTimestamp();

        const learnerUid =
            this.normalizeString(
                effectiveLearnerUid
            );

        return {

            credential_id:
                payload.credential_id,

            /*
             * null represents an asset published before
             * identity activation.
             */
            learner_uid:
                learnerUid ||
                null,

            ownership_state:
                learnerUid
                    ? "claimed"
                    : "pending_activation",

            learner_name:
                payload.learner_name ||
                "",

            learner_email:
                payload.learner_email ||
                "",

            program_code:
                payload.program_code ||
                "",

            asset_type:
                payload.asset_type,

            asset_label:
                payload.asset_label ||
                "",

            status:
                "published",

            is_latest:
                true,

            storage_path:
                payload.storage_path,

            download_url:
                payload.download_url,

            preview_url:
                payload.preview_url ||
                payload.download_url,

            file_name:
                payload.file_name ||
                "",

            file_extension:
                payload.file_extension ||
                "",

            mime_type:
                payload.mime_type ||
                "",

            asset_format:
                payload.asset_format ||
                "",

            version:
                payload.version ||
                1,

            generated_by:
                "admin.agileai.university",

            generated_source:
                "admin_portal",

            published_by:
                "admin.agileai.university",

            source:
                "admin",

            created_at:
                payload.created_at ||
                now,

            updated_at:
                now,

            published_at:
                now

        };

    },


    /* ======================================================
       GENERAL PUBLICATION
    ====================================================== */

    async publish(
        payload
    ) {

        const normalizedPayload =
            this.normalizeInputPayload(
                payload
            );

        this.validatePayload(
            normalizedPayload
        );

        const documentId =
            this.buildDocumentId(
                normalizedPayload.credential_id,
                normalizedPayload.asset_type
            );

        if (
            !documentId
        ) {

            throw new Error(
                `[${MODULE_NAME}] Unable to create asset document ID.`
            );

        }

        const reference =
            doc(
                db,
                COLLECTION_NAME,
                documentId
            );

        /*
         * Preserve established learner ownership.
         *
         * If a credential asset already contains learner_uid,
         * republication without learner_uid must not clear it.
         */
        const existingLearnerUid =
            await this.resolveExistingLearnerUid(
                reference
            );

        const incomingLearnerUid =
            normalizedPayload.learner_uid;

        /*
         * Existing ownership wins when the incoming payload
         * does not contain ownership.
         *
         * This publisher does not perform ownership transfer.
         */
        const effectiveLearnerUid =
            incomingLearnerUid ||
            existingLearnerUid ||
            "";

        const data =
            this.normalizePayload(
                normalizedPayload,
                effectiveLearnerUid
            );

        try {

            await setDoc(
                reference,
                data,
                {
                    merge:
                        true
                }
            );

            console.info(
                `[${MODULE_NAME}] Asset published:`,
                {
                    moduleVersion:
                        MODULE_VERSION,

                    documentId,

                    credentialId:
                        normalizedPayload.credential_id,

                    learnerUidPresent:
                        Boolean(
                            effectiveLearnerUid
                        ),

                    ownershipState:
                        data.ownership_state,

                    assetType:
                        normalizedPayload.asset_type,

                    storagePath:
                        normalizedPayload.storage_path
                }
            );

            return {
                documentId,
                data
            };

        }
        catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Asset publication failed:`,
                {
                    moduleVersion:
                        MODULE_VERSION,

                    documentId,

                    credentialId:
                        normalizedPayload.credential_id,

                    learnerUidPresent:
                        Boolean(
                            effectiveLearnerUid
                        ),

                    assetType:
                        normalizedPayload.asset_type,

                    storagePath:
                        normalizedPayload.storage_path,

                    error
                }
            );

            throw error;

        }

    },


    /* ======================================================
       UNIVERSITY CERTIFICATE
    ====================================================== */

    async publishUniversityCertificate(
        payload
    ) {

        return this.publish({

            ...payload,

            asset_type:
                "university_certificate",

            asset_label:
                "University Certificate",

            mime_type:
                payload?.mime_type ||
                payload?.mimeType ||
                "application/pdf",

            file_extension:
                payload?.file_extension ||
                payload?.fileExtension ||
                "pdf",

            asset_format:
                payload?.asset_format ||
                payload?.assetFormat ||
                "pdf"

        });

    },


    /* ======================================================
       TRAINER CERTIFICATE
    ====================================================== */

    async publishTrainerCertificate(
        payload
    ) {

        return this.publish({

            ...payload,

            asset_type:
                "trainer_certificate",

            asset_label:
                "Trainer Certificate",

            mime_type:
                payload?.mime_type ||
                payload?.mimeType ||
                "application/pdf",

            file_extension:
                payload?.file_extension ||
                payload?.fileExtension ||
                "pdf",

            asset_format:
                payload?.asset_format ||
                payload?.assetFormat ||
                "pdf"

        });

    },


    /* ======================================================
       DIGITAL BADGE
    ====================================================== */

    async publishDigitalBadge(
        payload
    ) {

        return this.publish({

            ...payload,

            asset_type:
                "digital_badge",

            asset_label:
                "Digital Badge",

            mime_type:
                payload?.mime_type ||
                payload?.mimeType ||
                "image/png",

            file_extension:
                payload?.file_extension ||
                payload?.fileExtension ||
                "png",

            asset_format:
                payload?.asset_format ||
                payload?.assetFormat ||
                "png"

        });

    },


    /* ======================================================
       RECOGNITION ASSET
    ====================================================== */

    async publishRecognitionAsset(
        payload
    ) {

        return this.publish({

            ...payload,

            asset_type:
                "recognition_asset",

            asset_label:
                payload?.asset_label ||
                payload?.assetLabel ||
                "Recognition Asset"

        });

    },


    /* ======================================================
       HELPERS
    ====================================================== */

    normalizeString(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        return String(
            value
        ).trim();

    },

    normalizeVersion(
        value
    ) {

        const parsedVersion =
            Number(
                value
            );

        if (
            !Number.isFinite(
                parsedVersion
            ) ||
            parsedVersion < 1
        ) {

            return 1;

        }

        return parsedVersion;

    },

    getValidAssetTypes() {

        return [
            ...VALID_ASSET_TYPES
        ];

    }

};


/* ==========================================================
   PUBLIC API
========================================================== */

window.CredentialAssetPublisher =
    CredentialAssetPublisher;

console.info(
    `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
);

export {
    CredentialAssetPublisher
};