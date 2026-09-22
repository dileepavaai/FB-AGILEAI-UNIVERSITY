/* ==========================================================
   LAAU
   Admin Credential Generator

   File      : credential-asset-publisher.js
   Version   : 1.5.0
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
   v1.5.0
   • Resolves migrated assets by published metadata
   • Preserves the existing registry document during republication
   • Uses transactions to preserve ownership and publication versions
   • Retains up to 50 previous publications and their Storage URLs
   • Requires a new Storage object for every replacement

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
    collection,
    query,
    where,
    limit,
    getDocs,
    runTransaction,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* ==========================================================
   CONSTANTS
========================================================== */

const MODULE_NAME =
    "CredentialAssetPublisher";

const MODULE_VERSION =
    "1.5.0";

const COLLECTION_NAME =
    "credential_assets";

const MAX_PUBLICATION_HISTORY =
    50;

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
                "admin.laau.university",

            generated_source:
                "admin_portal",

            published_by:
                "admin.laau.university",

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
       EXISTING PUBLICATION VALIDATION
    ====================================================== */

    validateExistingPublication(data, payload) {

        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data) ||
            data.credential_id !== payload.credential_id ||
            data.asset_type !== payload.asset_type ||
            data.status !== "published" ||
            data.is_latest !== true ||
            typeof data.storage_path !== "string" ||
            !data.storage_path.trim()
        ) {
            throw new Error(
                `[${MODULE_NAME}] Existing publication metadata is inconsistent.`
            );
        }

        for (const field of ["learner_uid", "learnerUid"]) {
            if (
                data[field] !== undefined &&
                data[field] !== null &&
                typeof data[field] !== "string"
            ) {
                throw new Error(
                    `[${MODULE_NAME}] Existing learner ownership is malformed.`
                );
            }
        }

        if (typeof data.download_url !== "string" || !data.download_url) {
            throw new Error(`[${MODULE_NAME}] Existing download_url is missing.`);
        }

        this.validatePublishedUrl(data.download_url, "existing download_url");
        if (data.preview_url) {
            this.validatePublishedUrl(data.preview_url, "existing preview_url");
        }

        const version = data.version === undefined ? 1 : data.version;
        if (!Number.isSafeInteger(version) || version < 1) {
            throw new Error(`[${MODULE_NAME}] Existing asset version is invalid.`);
        }

        return version;
    },

    resolvePublicationOwner(payload, publications) {

        const owners = new Set();
        const incomingUid = this.normalizeString(payload.learner_uid);
        if (incomingUid) owners.add(incomingUid);

        for (const data of publications) {
            for (const field of ["learner_uid", "learnerUid"]) {
                const uid = this.normalizeString(data[field]);
                if (uid) owners.add(uid);
            }
        }

        if (owners.size > 1) {
            throw new Error(
                `[${MODULE_NAME}] Republication cannot transfer learner ownership.`
            );
        }

        return owners.values().next().value || "";
    },

    /* ======================================================
       GENERAL PUBLICATION
    ====================================================== */

    async publish(payload) {

        const normalizedPayload = this.normalizeInputPayload(payload);
        this.validatePayload(normalizedPayload);

        const canonicalId = this.buildDocumentId(
            normalizedPayload.credential_id,
            normalizedPayload.asset_type
        );
        if (!canonicalId || canonicalId.includes("/")) {
            throw new Error(`[${MODULE_NAME}] Unable to create asset document ID.`);
        }

        const canonicalReference = doc(db, COLLECTION_NAME, canonicalId);

        try {
            // Metadata is authoritative after migration: a published asset can
            // retain its original AAU-prefixed registry document ID.
            const candidates = await getDocs(query(
                collection(db, COLLECTION_NAME),
                where("credential_id", "==", normalizedPayload.credential_id),
                where("asset_type", "==", normalizedPayload.asset_type),
                where("status", "==", "published"),
                where("is_latest", "==", true),
                limit(2)
            ));

            if (candidates.docs.length > 1) {
                throw new Error(
                    `[${MODULE_NAME}] Multiple published/latest assets match this credential and asset type.`
                );
            }

            const discoveredReference = candidates.docs[0]?.ref;
            const reference = discoveredReference || canonicalReference;

            const result = await runTransaction(db, async transaction => {
                // Always read the canonical slot. It serializes new issuance
                // and detects a collision with a discovered legacy pointer.
                const canonicalSnapshot = await transaction.get(canonicalReference);
                const existingSnapshot = reference.id === canonicalId
                    ? canonicalSnapshot
                    : await transaction.get(reference);

                if (
                    reference.id !== canonicalId &&
                    canonicalSnapshot.exists()
                ) {
                    throw new Error(
                        `[${MODULE_NAME}] Canonical asset document collides with the existing publication.`
                    );
                }

                if (discoveredReference && !existingSnapshot.exists()) {
                    throw new Error(
                        `[${MODULE_NAME}] Existing publication changed; reload before publishing.`
                    );
                }

                let previous = null;
                let history = [];
                let version = normalizedPayload.version;
                let effectiveLearnerUid = normalizedPayload.learner_uid;

                if (existingSnapshot.exists()) {
                    previous = existingSnapshot.data();
                    const previousVersion = this.validateExistingPublication(
                        previous, normalizedPayload
                    );

                    const storedHistory = previous.publication_history;
                    if (storedHistory !== undefined && !Array.isArray(storedHistory)) {
                        throw new Error(`[${MODULE_NAME}] Publication history is malformed.`);
                    }
                    history = storedHistory ? [...storedHistory] : [];
                    if (history.length >= MAX_PUBLICATION_HISTORY) {
                        throw new Error(
                            `[${MODULE_NAME}] Publication history limit reached; no history was discarded.`
                        );
                    }
                    let lastHistoryVersion = 0;
                    for (const entry of history) {
                        const historyVersion = this.validateExistingPublication(
                            entry, normalizedPayload
                        );
                        if (
                            Object.prototype.hasOwnProperty.call(entry, "publication_history") ||
                            historyVersion <= lastHistoryVersion ||
                            historyVersion >= previousVersion
                        ) {
                            throw new Error(`[${MODULE_NAME}] Publication history is inconsistent.`);
                        }
                        lastHistoryVersion = historyVersion;
                    }

                    effectiveLearnerUid = this.resolvePublicationOwner(
                        normalizedPayload, [...history, previous]
                    );

                    // The export engine must upload a unique object before
                    // calling this publisher; previous files remain usable.
                    if (
                        [previous, ...history].some(entry =>
                            entry.storage_path.trim() === normalizedPayload.storage_path
                        )
                    ) {
                        throw new Error(
                            `[${MODULE_NAME}] Republication requires a new Storage path.`
                        );
                    }
                    version = previousVersion + 1;
                    if (!Number.isSafeInteger(version)) {
                        throw new Error(`[${MODULE_NAME}] Asset version limit reached.`);
                    }

                    // Preserve the complete previous metadata, excluding its
                    // own history so snapshots never recursively nest.
                    const { publication_history: ignoredHistory, ...snapshot } = previous;
                    history.push(snapshot);
                }

                const data = this.normalizePayload(
                    { ...normalizedPayload, version }, effectiveLearnerUid
                );
                if (previous) {
                    data.publication_history = history;
                    if (previous.created_at) data.created_at = previous.created_at;
                }

                // Firestore rules require this pointer to stay published and
                // latest. Keeping its document ID avoids creating a duplicate
                // after an AAU -> LAAU credential metadata migration.
                transaction.set(reference, data, { merge: true });
                return { documentId: reference.id, data };
            });

            console.info(`[${MODULE_NAME}] Asset published:`, {
                moduleVersion: MODULE_VERSION,
                documentId: result.documentId,
                credentialId: normalizedPayload.credential_id,
                learnerUidPresent: Boolean(result.data.learner_uid),
                ownershipState: result.data.ownership_state,
                assetType: normalizedPayload.asset_type,
                storagePath: normalizedPayload.storage_path,
                version: result.data.version
            });
            return result;
        }
        catch (error) {
            console.error(`[${MODULE_NAME}] Asset publication failed:`, {
                moduleVersion: MODULE_VERSION,
                credentialId: normalizedPayload.credential_id,
                assetType: normalizedPayload.asset_type,
                error
            });
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