/* ==========================================================
   Agile AI University
   Admin Credential Generator

   File      : credential-asset-publisher.js
   Version   : 1.3.0
   Status    : ACTIVE
   Phase     : Admin Credential Asset Publisher Sprint

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
   ✓ Enforce learner ownership metadata
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
   • learner_uid is the learner ownership boundary
   • Only published HTTPS Cloud Storage URLs are accepted
   • No credential registry duplication

   Change History
   ----------------------------------------------------------
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
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ==========================================================
   CONSTANTS
========================================================== */

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

    normalizeInputPayload(payload) {

        const source =
            payload || {};

        return {

            credential_id:
                this.normalizeString(
                    source.credential_id ||
                    source.credentialId
                ),

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

    validatePayload(payload) {

        if (!payload) {

            throw new Error(
                "[CredentialAssetPublisher] Missing payload."
            );

        }

        if (!payload.credential_id) {

            throw new Error(
                "[CredentialAssetPublisher] Missing credential_id."
            );

        }

        if (!payload.learner_uid) {

            throw new Error(
                "[CredentialAssetPublisher] Missing learner_uid."
            );

        }

        if (!payload.asset_type) {

            throw new Error(
                "[CredentialAssetPublisher] Missing asset_type."
            );

        }

        if (
            !VALID_ASSET_TYPES.includes(
                payload.asset_type
            )
        ) {

            throw new Error(
                `[CredentialAssetPublisher] Invalid asset_type: ${payload.asset_type}`
            );

        }

        if (
            payload.status !==
            "published"
        ) {

            throw new Error(
                "[CredentialAssetPublisher] Asset status must be published."
            );

        }

        if (!payload.storage_path) {

            throw new Error(
                "[CredentialAssetPublisher] Missing storage_path."
            );

        }

        if (!payload.download_url) {

            throw new Error(
                "[CredentialAssetPublisher] Missing download_url."
            );

        }

        this.validatePublishedUrl(
            payload.download_url,
            "download_url"
        );

        if (payload.preview_url) {

            this.validatePublishedUrl(
                payload.preview_url,
                "preview_url"
            );

        }

    },

    validatePublishedUrl(
        value,
        fieldName
    ) {

        let parsedUrl;

        try {

            parsedUrl =
                new URL(value);

        }
        catch (error) {

            throw new Error(
                `[CredentialAssetPublisher] ${fieldName} must be a valid absolute URL.`
            );

        }

        if (
            parsedUrl.protocol !==
            "https:"
        ) {

            throw new Error(
                `[CredentialAssetPublisher] ${fieldName} must use HTTPS.`
            );

        }

        if (
            !ALLOWED_STORAGE_HOSTS.includes(
                parsedUrl.hostname
            )
        ) {

            throw new Error(
                `[CredentialAssetPublisher] ${fieldName} must be a Firebase or Google Cloud Storage URL. Received host: ${parsedUrl.hostname}`
            );

        }

    },

    /* ======================================================
       FIRESTORE NORMALIZATION
    ====================================================== */

    normalizePayload(payload) {

        const now =
            serverTimestamp();

        return {

            credential_id:
                payload.credential_id,

            learner_uid:
                payload.learner_uid,

            learner_name:
                payload.learner_name || "",

            learner_email:
                payload.learner_email || "",

            program_code:
                payload.program_code || "",

            asset_type:
                payload.asset_type,

            asset_label:
                payload.asset_label || "",

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
                payload.file_name || "",

            file_extension:
                payload.file_extension || "",

            mime_type:
                payload.mime_type || "",

            asset_format:
                payload.asset_format || "",

            version:
                payload.version || 1,

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

    async publish(payload) {

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

        if (!documentId) {

            throw new Error(
                "[CredentialAssetPublisher] Unable to create asset document ID."
            );

        }

        const data =
            this.normalizePayload(
                normalizedPayload
            );

        const reference =
            doc(
                db,
                COLLECTION_NAME,
                documentId
            );

        try {

            await setDoc(
                reference,
                data,
                {
                    merge: true
                }
            );

            console.info(
                "[CredentialAssetPublisher] Asset published:",
                {
                    documentId,
                    credentialId:
                        normalizedPayload.credential_id,
                    learnerUid:
                        normalizedPayload.learner_uid,
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
        catch (error) {

            console.error(
                "[CredentialAssetPublisher] Asset publication failed:",
                {
                    documentId,
                    credentialId:
                        normalizedPayload.credential_id,
                    learnerUid:
                        normalizedPayload.learner_uid,
                    assetType:
                        normalizedPayload.asset_type,
                    error
                }
            );

            throw error;

        }

    },

    /* ======================================================
       UNIVERSITY CERTIFICATE
    ====================================================== */

    async publishUniversityCertificate(payload) {

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

    async publishTrainerCertificate(payload) {

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

    async publishDigitalBadge(payload) {

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

    async publishRecognitionAsset(payload) {

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

    normalizeString(value) {

        return String(
            value || ""
        ).trim();

    },

    normalizeVersion(value) {

        const parsedVersion =
            Number(value);

        if (
            !Number.isFinite(parsedVersion) ||
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
    "[CredentialAssetPublisher] Loaded v1.3.0"
);

export {
    CredentialAssetPublisher
};