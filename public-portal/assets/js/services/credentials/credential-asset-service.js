/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-asset-service.js
   Version   : 1.0.0
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
   ✓ Does not generate assets
   ✓ Does not upload files
   ✓ Does not write to Firestore
   ✓ Does not modify credential registry

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

        getDb() {

            if (!window.firebase || !firebase.firestore) {

                throw new Error(
                    "[CredentialAssetService] Firebase Firestore is not available."
                );

            }

            return firebase.firestore();

        },

        buildDocumentId(credentialId, assetType) {

            return `${credentialId}_${assetType}`;

        },

        normalizeAsset(doc) {

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

            return {
                id: doc.id,

                credentialId: data.credential_id || "",
                assetType: data.asset_type || "",
                assetLabel: data.asset_label || "",

                status: data.status || "",
                isLatest: data.is_latest === true,
                version: data.version || 1,

                storagePath: data.storage_path || "",
                downloadUrl: data.download_url || "",
                previewUrl: data.preview_url || data.download_url || "",

                fileName: data.file_name || "",
                fileExtension: data.file_extension || "",
                mimeType: data.mime_type || "",
                assetFormat: data.asset_format || "",

                generatedBy: data.generated_by || "",
                generatedSource: data.generated_source || "",

                createdAt: data.created_at || null,
                updatedAt: data.updated_at || null
            };

        },

        async getAssetByType(credentialId, assetType) {

            if (!credentialId || !assetType) {
                return null;
            }

            const db =
                this.getDb();

            const documentId =
                this.buildDocumentId(
                    credentialId,
                    assetType
                );

            const snapshot =
                await db
                    .collection(COLLECTION_NAME)
                    .doc(documentId)
                    .get();

            return this.normalizeAsset(snapshot);

        },

        async getAssets(credentialId) {

            if (!credentialId) {
                return [];
            }

            const db =
                this.getDb();

            const snapshot =
                await db
                    .collection(COLLECTION_NAME)
                    .where("credential_id", "==", credentialId)
                    .where("status", "==", "published")
                    .where("is_latest", "==", true)
                    .get();

            return snapshot.docs
                .map((doc) => this.normalizeAsset(doc))
                .filter(Boolean);

        },

        async getUniversityCertificate(credentialId) {

            return this.getAssetByType(
                credentialId,
                ASSET_TYPES.UNIVERSITY_CERTIFICATE
            );

        },

        async getTrainerCertificate(credentialId) {

            return this.getAssetByType(
                credentialId,
                ASSET_TYPES.TRAINER_CERTIFICATE
            );

        },

        async getDigitalBadge(credentialId) {

            return this.getAssetByType(
                credentialId,
                ASSET_TYPES.DIGITAL_BADGE
            );

        },

        async getRecognitionAsset(credentialId) {

            return this.getAssetByType(
                credentialId,
                ASSET_TYPES.RECOGNITION_ASSET
            );

        },

        async getAssetMap(credentialId) {

            const assets =
                await this.getAssets(credentialId);

            return assets.reduce(
                (map, asset) => {

                    map[asset.assetType] =
                        asset;

                    return map;

                },
                {}
            );

        },

        getPreviewUrl(asset) {

            return asset?.previewUrl ||
                asset?.downloadUrl ||
                "";

        },

        getDownloadUrl(asset) {

            return asset?.downloadUrl || "";

        }

    };

    window.CredentialAssetService =
        CredentialAssetService;

})(window);