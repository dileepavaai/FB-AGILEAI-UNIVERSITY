/* ==========================================================
   Agile AI University
   Admin Credential Generator

   File      : credential-asset-publisher.js
   Version   : 1.2.0
   Status    : ACTIVE
   Phase     : Admin Credential Asset Publisher Sprint

   Purpose
   ----------------------------------------------------------
   Publishes generated credential asset metadata to Firestore.

   Firebase Standard
   ----------------------------------------------------------
   Uses Firebase Modular SDK v10 through public-admin/assets/js/core.js

   Governance
   ----------------------------------------------------------
   credentials collection = Credential Registry
   credential_assets collection = Asset Registry

   This file does not duplicate learner or program registry fields.
========================================================== */

import { db } from "../../../assets/js/core.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const COLLECTION_NAME =
    "credential_assets";

const VALID_ASSET_TYPES = [
    "university_certificate",
    "trainer_certificate",
    "digital_badge",
    "recognition_asset"
];

const CredentialAssetPublisher = {

    buildDocumentId(credentialId, assetType) {

        return `${credentialId}_${assetType}`;

    },

    validatePayload(payload) {

        if (!payload) {
            throw new Error("[CredentialAssetPublisher] Missing payload.");
        }

        if (!payload.credential_id) {
            throw new Error("[CredentialAssetPublisher] Missing credential_id.");
        }

        if (!payload.asset_type) {
            throw new Error("[CredentialAssetPublisher] Missing asset_type.");
        }

        if (!VALID_ASSET_TYPES.includes(payload.asset_type)) {
            throw new Error(
                `[CredentialAssetPublisher] Invalid asset_type: ${payload.asset_type}`
            );
        }

        if (!payload.download_url) {
            throw new Error("[CredentialAssetPublisher] Missing download_url.");
        }

    },

    normalizePayload(payload) {

        const now =
            serverTimestamp();

        return {
            credential_id: payload.credential_id,
            asset_type: payload.asset_type,
            asset_label: payload.asset_label || "",
            status: payload.status || "published",

            storage_path: payload.storage_path || "",
            download_url: payload.download_url,
            preview_url: payload.preview_url || payload.download_url,

            generated_by: "admin.agileai.university",
            generated_source: "admin_portal",

            version: payload.version || 1,
            is_latest: true,

            created_at: payload.created_at || now,
            updated_at: now,

            mime_type: payload.mime_type || "",
            file_extension: payload.file_extension || "",
            file_name: payload.file_name || "",
            asset_format: payload.asset_format || ""
        };

    },

    async publish(payload) {

        this.validatePayload(payload);

        const documentId =
            this.buildDocumentId(
                payload.credential_id,
                payload.asset_type
            );

        const data =
            this.normalizePayload(payload);

        const ref =
            doc(
                db,
                COLLECTION_NAME,
                documentId
            );

        await setDoc(
            ref,
            data,
            {
                merge: true
            }
        );

        console.info(
            "[CredentialAssetPublisher] Asset published:",
            documentId
        );

        return {
            documentId,
            data
        };

    },

    async publishUniversityCertificate(payload) {

        return this.publish({
            ...payload,
            asset_type: "university_certificate",
            asset_label: "University Certificate",
            mime_type: payload.mime_type || "application/pdf",
            file_extension: payload.file_extension || "pdf",
            asset_format: payload.asset_format || "pdf"
        });

    },

    async publishTrainerCertificate(payload) {

        return this.publish({
            ...payload,
            asset_type: "trainer_certificate",
            asset_label: "Trainer Certificate",
            mime_type: payload.mime_type || "application/pdf",
            file_extension: payload.file_extension || "pdf",
            asset_format: payload.asset_format || "pdf"
        });

    },

    async publishDigitalBadge(payload) {

        return this.publish({
            ...payload,
            asset_type: "digital_badge",
            asset_label: "Digital Badge",
            mime_type: payload.mime_type || "image/png",
            file_extension: payload.file_extension || "png",
            asset_format: payload.asset_format || "png"
        });

    },

    async publishRecognitionAsset(payload) {

        return this.publish({
            ...payload,
            asset_type: "recognition_asset",
            asset_label: "Recognition Asset"
        });

    }

};

window.CredentialAssetPublisher =
    CredentialAssetPublisher;

export {
    CredentialAssetPublisher
};