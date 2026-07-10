/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-asset-service.js
   Version   : 1.1.0
   Status    : ACTIVE
   Phase     : Credential Asset Consumption

   Purpose
   ----------------------------------------------------------
   Reads published credential assets from Firestore.

   Authority
   ----------------------------------------------------------
   Student Portal consumes assets published by Admin Portal.

   Governance
   ----------------------------------------------------------
   ✓ Reads credential_assets collection
   ✓ Returns published/latest assets only
   ✓ Enforces authenticated learner ownership
   ✓ Uses learner_uid as the asset-access boundary
   ✓ Does not generate assets
   ✓ Does not upload files
   ✓ Does not write to Firestore
   ✓ Does not modify credential registry

   Change History
   ----------------------------------------------------------
   v1.1.0
   • Added authenticated UID resolution
   • Added learner_uid constraint to collection queries
   • Added ownership validation during normalization
   • Added safer Firestore and authentication diagnostics
   • Preserved deterministic asset document IDs

========================================================== */

(function (window) {

    "use strict";

    const COLLECTION_NAME =
        "credential_assets";

    const ASSET_TYPES = {
        UNIVERSITY_CERTIFICATE: "university_certificate",
        TRAINER_CERTIFICATE: "trainer_certificate",
        DIGITAL_BADGE: "digital_badge",
        RECOGNITION_ASSET: "recognition_asset"
    };

    const CredentialAssetService = {

        /* ==================================================
           FIRESTORE
        ================================================== */

        getDb() {

            if (
                !window.firebase ||
                typeof window.firebase.firestore !== "function"
            ) {

                throw new Error(
                    "[CredentialAssetService] Firebase Firestore is not available."
                );

            }

            return window.firebase.firestore();

        },

        /* ==================================================
           AUTHENTICATED USER
        ================================================== */

        getCurrentUser() {

            if (
                !window.firebase ||
                typeof window.firebase.auth !== "function"
            ) {

                throw new Error(
                    "[CredentialAssetService] Firebase Authentication is not available."
                );

            }

            const user =
                window.firebase.auth().currentUser;

            if (!user) {

                throw new Error(
                    "[CredentialAssetService] No authenticated user is available."
                );

            }

            return user;

        },

        getCurrentUserUid() {

            const user =
                this.getCurrentUser();

            if (!user.uid) {

                throw new Error(
                    "[CredentialAssetService] Authenticated user UID is unavailable."
                );

            }

            return user.uid;

        },

        /* ==================================================
           DOCUMENT ID
        ================================================== */

        buildDocumentId(credentialId, assetType) {

            return `${credentialId}_${assetType}`;

        },

        /* ==================================================
           ASSET NORMALIZATION
        ================================================== */

        normalizeAsset(doc, expectedLearnerUid = "") {

            if (!doc || !doc.exists) {
                return null;
            }

            const data =
                doc.data() || {};

            if (data.status !== "published") {
                return null;
            }

            if (data.is_latest !== true) {
                return null;
            }

            if (!data.download_url && !data.preview_url) {
                return null;
            }

            /*
             * Defence-in-depth ownership validation.
             *
             * Firestore Security Rules remain the security authority.
             * This check prevents accidental client-side consumption
             * if inconsistent data is ever returned.
             */

            if (
                expectedLearnerUid &&
                data.learner_uid !== expectedLearnerUid
            ) {

                console.warn(
                    "[CredentialAssetService] Asset ownership mismatch:",
                    doc.id
                );

                return null;

            }

            return {
                id: doc.id,

                credentialId: data.credential_id || "",
                learnerUid: data.learner_uid || "",

                assetType: data.asset_type || "",
                assetLabel: data.asset_label || "",

                status: data.status || "",
                isLatest: data.is_latest === true,
                version: data.version || 1,

                storagePath: data.storage_path || "",
                downloadUrl: data.download_url || "",
                previewUrl:
                    data.preview_url ||
                    data.download_url ||
                    "",

                fileName: data.file_name || "",
                fileExtension: data.file_extension || "",
                mimeType: data.mime_type || "",
                assetFormat: data.asset_format || "",

                generatedBy: data.generated_by || "",
                generatedSource: data.generated_source || "",

                programCode: data.program_code || "",
                learnerEmail: data.learner_email || "",
                learnerName: data.learner_name || "",

                createdAt: data.created_at || null,
                updatedAt: data.updated_at || null
            };

        },

        /* ==================================================
           SINGLE ASSET READ
        ================================================== */

        async getAssetByType(
            credentialId,
            assetType
        ) {

            if (!credentialId || !assetType) {
                return null;
            }

            const db =
                this.getDb();

            const learnerUid =
                this.getCurrentUserUid();

            const documentId =
                this.buildDocumentId(
                    credentialId,
                    assetType
                );

            try {

                const snapshot =
                    await db
                        .collection(COLLECTION_NAME)
                        .doc(documentId)
                        .get();

                return this.normalizeAsset(
                    snapshot,
                    learnerUid
                );

            }
            catch (error) {

                console.error(
                    "[CredentialAssetService] Asset read failed:",
                    {
                        credentialId,
                        assetType,
                        documentId,
                        learnerUid,
                        error
                    }
                );

                throw error;

            }

        },

        /* ==================================================
           ALL ASSETS FOR CREDENTIAL
        ================================================== */

        async getAssets(credentialId) {

            if (!credentialId) {
                return [];
            }

            const db =
                this.getDb();

            const learnerUid =
                this.getCurrentUserUid();

            try {

                /*
                 * Security-rule-compatible query.
                 *
                 * Firestore rules require every returned asset to
                 * belong to request.auth.uid. The learner_uid filter
                 * therefore must be part of the query itself.
                 */

                const snapshot =
                    await db
                        .collection(COLLECTION_NAME)
                        .where(
                            "learner_uid",
                            "==",
                            learnerUid
                        )
                        .where(
                            "credential_id",
                            "==",
                            credentialId
                        )
                        .where(
                            "status",
                            "==",
                            "published"
                        )
                        .where(
                            "is_latest",
                            "==",
                            true
                        )
                        .get();

                const assets =
                    snapshot.docs
                        .map((doc) =>
                            this.normalizeAsset(
                                doc,
                                learnerUid
                            )
                        )
                        .filter(Boolean);

                console.info(
                    "[CredentialAssetService] Assets loaded:",
                    {
                        credentialId,
                        learnerUid,
                        count: assets.length
                    }
                );

                return assets;

            }
            catch (error) {

                console.error(
                    "[CredentialAssetService] Credential asset query failed:",
                    {
                        credentialId,
                        learnerUid,
                        error
                    }
                );

                throw error;

            }

        },

        /* ==================================================
           ASSET TYPE CONVENIENCE METHODS
        ================================================== */

        async getUniversityCertificate(
            credentialId
        ) {

            return this.getAssetByType(
                credentialId,
                ASSET_TYPES.UNIVERSITY_CERTIFICATE
            );

        },

        async getTrainerCertificate(
            credentialId
        ) {

            return this.getAssetByType(
                credentialId,
                ASSET_TYPES.TRAINER_CERTIFICATE
            );

        },

        async getDigitalBadge(
            credentialId
        ) {

            return this.getAssetByType(
                credentialId,
                ASSET_TYPES.DIGITAL_BADGE
            );

        },

        async getRecognitionAsset(
            credentialId
        ) {

            return this.getAssetByType(
                credentialId,
                ASSET_TYPES.RECOGNITION_ASSET
            );

        },

        /* ==================================================
           ASSET MAP
        ================================================== */

        async getAssetMap(credentialId) {

            const assets =
                await this.getAssets(
                    credentialId
                );

            return assets.reduce(
                (map, asset) => {

                    map[asset.assetType] =
                        asset;

                    return map;

                },
                {}
            );

        },

        /* ==================================================
           URL HELPERS
        ================================================== */

        getPreviewUrl(asset) {

            return (
                asset?.previewUrl ||
                asset?.downloadUrl ||
                ""
            );

        },

        getDownloadUrl(asset) {

            return asset?.downloadUrl || "";

        }

    };

    window.CredentialAssetService =
        CredentialAssetService;

    console.info(
        "[CredentialAssetService] Loaded v1.1.0"
    );

})(window);