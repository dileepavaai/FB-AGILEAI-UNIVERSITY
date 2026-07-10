/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-asset-service.js
   Version   : 1.2.0
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
   ✓ Waits for Firebase authentication readiness
   ✓ Does not generate assets
   ✓ Does not upload files
   ✓ Does not write to Firestore
   ✓ Does not modify credential registry

   Change History
   ----------------------------------------------------------
   v1.2.0
   • Waits for Firebase authentication readiness
   • Uses learner_uid in all collection queries
   • Validates ownership during normalization
   • Preserves deterministic asset document IDs
   • Adds safe query and direct-read diagnostics
   • Preserves the existing CredentialAssetService API

   v1.1.0
   • Added authenticated UID resolution
   • Added learner_uid constraint to collection queries
   • Added ownership validation during normalization

========================================================== */

(function (window) {

    "use strict";

    const COLLECTION_NAME =
        "credential_assets";

    const ASSET_TYPES = Object.freeze({

        UNIVERSITY_CERTIFICATE:
            "university_certificate",

        TRAINER_CERTIFICATE:
            "trainer_certificate",

        DIGITAL_BADGE:
            "digital_badge",

        RECOGNITION_ASSET:
            "recognition_asset"

    });

    const CredentialAssetService = {

        /* ==================================================
           FIREBASE AVAILABILITY
        ================================================== */

        getFirebase() {

            if (!window.firebase) {

                throw new Error(
                    "[CredentialAssetService] Firebase SDK is not available."
                );

            }

            return window.firebase;

        },

        getDb() {

            const firebaseInstance =
                this.getFirebase();

            if (
                typeof firebaseInstance.firestore !==
                "function"
            ) {

                throw new Error(
                    "[CredentialAssetService] Firebase Firestore is not available."
                );

            }

            return firebaseInstance.firestore();

        },

        getAuth() {

            const firebaseInstance =
                this.getFirebase();

            if (
                typeof firebaseInstance.auth !==
                "function"
            ) {

                throw new Error(
                    "[CredentialAssetService] Firebase Authentication is not available."
                );

            }

            return firebaseInstance.auth();

        },

        /* ==================================================
           AUTHENTICATION READINESS
        ================================================== */

        async resolveCurrentUser() {

            const auth =
                this.getAuth();

            /*
             * Prefer the portal-wide authentication readiness
             * contract when it is available.
             */

            if (
                window.__AAIU_AUTH_READY__ &&
                typeof window.__AAIU_AUTH_READY__.then ===
                    "function"
            ) {

                const authState =
                    await window.__AAIU_AUTH_READY__;

                const resolvedUser =
                    authState?.user ||
                    auth.currentUser ||
                    null;

                if (!resolvedUser) {

                    throw new Error(
                        "[CredentialAssetService] No authenticated user is available."
                    );

                }

                if (!resolvedUser.uid) {

                    throw new Error(
                        "[CredentialAssetService] Authenticated user UID is unavailable."
                    );

                }

                return resolvedUser;

            }

            /*
             * Fallback for pages that do not expose
             * __AAIU_AUTH_READY__.
             */

            if (auth.currentUser) {

                if (!auth.currentUser.uid) {

                    throw new Error(
                        "[CredentialAssetService] Authenticated user UID is unavailable."
                    );

                }

                return auth.currentUser;

            }

            return new Promise((resolve, reject) => {

                let unsubscribe = null;

                const timeoutId =
                    window.setTimeout(() => {

                        if (
                            typeof unsubscribe ===
                            "function"
                        ) {

                            unsubscribe();

                        }

                        reject(
                            new Error(
                                "[CredentialAssetService] Authentication readiness timed out."
                            )
                        );

                    }, 10000);

                unsubscribe =
                    auth.onAuthStateChanged(
                        (user) => {

                            window.clearTimeout(
                                timeoutId
                            );

                            if (
                                typeof unsubscribe ===
                                "function"
                            ) {

                                unsubscribe();

                            }

                            if (!user) {

                                reject(
                                    new Error(
                                        "[CredentialAssetService] No authenticated user is available."
                                    )
                                );

                                return;

                            }

                            if (!user.uid) {

                                reject(
                                    new Error(
                                        "[CredentialAssetService] Authenticated user UID is unavailable."
                                    )
                                );

                                return;

                            }

                            resolve(user);

                        },
                        (error) => {

                            window.clearTimeout(
                                timeoutId
                            );

                            if (
                                typeof unsubscribe ===
                                "function"
                            ) {

                                unsubscribe();

                            }

                            reject(error);

                        }
                    );

            });

        },

        async getCurrentUserUid() {

            const user =
                await this.resolveCurrentUser();

            return user.uid;

        },

        /* ==================================================
           DOCUMENT ID
        ================================================== */

        buildDocumentId(
            credentialId,
            assetType
        ) {

            const normalizedCredentialId =
                String(
                    credentialId || ""
                ).trim();

            const normalizedAssetType =
                String(
                    assetType || ""
                ).trim();

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

        /* ==================================================
           INPUT VALIDATION
        ================================================== */

        normalizeCredentialId(
            credentialId
        ) {

            return String(
                credentialId || ""
            ).trim();

        },

        isValidAssetType(assetType) {

            return Object.values(
                ASSET_TYPES
            ).includes(assetType);

        },

        /* ==================================================
           ASSET NORMALIZATION
        ================================================== */

        normalizeAsset(
            documentSnapshot,
            expectedLearnerUid = ""
        ) {

            if (
                !documentSnapshot ||
                !documentSnapshot.exists
            ) {

                return null;

            }

            const data =
                documentSnapshot.data() || {};

            if (
                data.status !==
                "published"
            ) {

                return null;

            }

            if (
                data.is_latest !==
                true
            ) {

                return null;

            }

            if (
                !data.download_url &&
                !data.preview_url
            ) {

                console.warn(
                    "[CredentialAssetService] Asset has no usable URL:",
                    documentSnapshot.id
                );

                return null;

            }

            /*
             * Defence-in-depth ownership validation.
             *
             * Firestore Security Rules remain the security
             * authority. This client-side validation prevents
             * accidental consumption of inconsistent records.
             */

            if (
                expectedLearnerUid &&
                data.learner_uid !==
                    expectedLearnerUid
            ) {

                console.warn(
                    "[CredentialAssetService] Asset ownership mismatch:",
                    {
                        documentId:
                            documentSnapshot.id,

                        expectedLearnerUid,

                        actualLearnerUid:
                            data.learner_uid || ""
                    }
                );

                return null;

            }

            return {

                id:
                    documentSnapshot.id,

                credentialId:
                    data.credential_id || "",

                learnerUid:
                    data.learner_uid || "",

                assetType:
                    data.asset_type || "",

                assetLabel:
                    data.asset_label || "",

                status:
                    data.status || "",

                isLatest:
                    data.is_latest === true,

                version:
                    data.version || 1,

                storagePath:
                    data.storage_path || "",

                downloadUrl:
                    data.download_url || "",

                previewUrl:
                    data.preview_url ||
                    data.download_url ||
                    "",

                fileName:
                    data.file_name || "",

                fileExtension:
                    data.file_extension || "",

                mimeType:
                    data.mime_type || "",

                assetFormat:
                    data.asset_format || "",

                generatedBy:
                    data.generated_by || "",

                generatedSource:
                    data.generated_source || "",

                programCode:
                    data.program_code || "",

                learnerEmail:
                    data.learner_email || "",

                learnerName:
                    data.learner_name || "",

                createdAt:
                    data.created_at || null,

                updatedAt:
                    data.updated_at || null

            };

        },

        /* ==================================================
           SINGLE ASSET READ
        ================================================== */

        async getAssetByType(
            credentialId,
            assetType
        ) {

            const normalizedCredentialId =
                this.normalizeCredentialId(
                    credentialId
                );

            if (
                !normalizedCredentialId ||
                !assetType
            ) {

                return null;

            }

            if (
                !this.isValidAssetType(
                    assetType
                )
            ) {

                throw new Error(
                    `[CredentialAssetService] Invalid asset type: ${assetType}`
                );

            }

            const learnerUid =
                await this.getCurrentUserUid();

            const db =
                this.getDb();

            const documentId =
                this.buildDocumentId(
                    normalizedCredentialId,
                    assetType
                );

            try {

                const snapshot =
                    await db
                        .collection(
                            COLLECTION_NAME
                        )
                        .doc(
                            documentId
                        )
                        .get();

                const asset =
                    this.normalizeAsset(
                        snapshot,
                        learnerUid
                    );

                console.info(
                    "[CredentialAssetService] Asset read completed:",
                    {
                        credentialId:
                            normalizedCredentialId,

                        assetType,

                        documentId,

                        learnerUid,

                        found:
                            Boolean(asset)
                    }
                );

                return asset;

            }
            catch (error) {

                console.error(
                    "[CredentialAssetService] Asset read failed:",
                    {
                        credentialId:
                            normalizedCredentialId,

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

        async getAssets(
            credentialId
        ) {

            const normalizedCredentialId =
                this.normalizeCredentialId(
                    credentialId
                );

            if (!normalizedCredentialId) {

                return [];

            }

            const learnerUid =
                await this.getCurrentUserUid();

            const db =
                this.getDb();

            try {

                /*
                 * Firestore security-rule-compatible query.
                 *
                 * The learner_uid constraint is mandatory.
                 * Firestore rules are not result filters.
                 * The query itself must prove ownership.
                 */

                const snapshot =
                    await db
                        .collection(
                            COLLECTION_NAME
                        )
                        .where(
                            "learner_uid",
                            "==",
                            learnerUid
                        )
                        .where(
                            "credential_id",
                            "==",
                            normalizedCredentialId
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
                        .map(
                            (documentSnapshot) =>
                                this.normalizeAsset(
                                    documentSnapshot,
                                    learnerUid
                                )
                        )
                        .filter(Boolean);

                console.info(
                    "[CredentialAssetService] Assets loaded:",
                    {
                        credentialId:
                            normalizedCredentialId,

                        learnerUid,

                        count:
                            assets.length
                    }
                );

                return assets;

            }
            catch (error) {

                console.error(
                    "[CredentialAssetService] Credential asset query failed:",
                    {
                        credentialId:
                            normalizedCredentialId,

                        learnerUid,

                        error
                    }
                );

                throw error;

            }

        },

        /* ==================================================
           ASSET-TYPE CONVENIENCE METHODS
        ================================================== */

        async getUniversityCertificate(
            credentialId
        ) {

            return this.getAssetByType(
                credentialId,
                ASSET_TYPES
                    .UNIVERSITY_CERTIFICATE
            );

        },

        async getTrainerCertificate(
            credentialId
        ) {

            return this.getAssetByType(
                credentialId,
                ASSET_TYPES
                    .TRAINER_CERTIFICATE
            );

        },

        async getDigitalBadge(
            credentialId
        ) {

            return this.getAssetByType(
                credentialId,
                ASSET_TYPES
                    .DIGITAL_BADGE
            );

        },

        async getRecognitionAsset(
            credentialId
        ) {

            return this.getAssetByType(
                credentialId,
                ASSET_TYPES
                    .RECOGNITION_ASSET
            );

        },

        /* ==================================================
           ASSET MAP
        ================================================== */

        async getAssetMap(
            credentialId
        ) {

            const assets =
                await this.getAssets(
                    credentialId
                );

            return assets.reduce(
                (
                    assetMap,
                    asset
                ) => {

                    if (
                        asset &&
                        asset.assetType
                    ) {

                        assetMap[
                            asset.assetType
                        ] = asset;

                    }

                    return assetMap;

                },
                {}
            );

        },

        /* ==================================================
           URL HELPERS
        ================================================== */

        getPreviewUrl(
            asset
        ) {

            if (!asset) {
                return "";
            }

            return (
                asset.previewUrl ||
                asset.downloadUrl ||
                ""
            );

        },

        getDownloadUrl(
            asset
        ) {

            if (!asset) {
                return "";
            }

            return (
                asset.downloadUrl ||
                ""
            );

        },

        /* ==================================================
           PUBLIC CONSTANT ACCESS
        ================================================== */

        getAssetTypes() {

            return {
                ...ASSET_TYPES
            };

        }

    };

    window.CredentialAssetService =
        CredentialAssetService;

    console.info(
        "[CredentialAssetService] Loaded v1.2.0"
    );

})(window);