/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File       : learning-resource-controller.js
   Version    : 1.3.0
   Status     : ACTIVE
   Authority  : Admin Portal

   Purpose
   ----------------------------------------------------------
   Orchestrates the governed administrative lifecycle for
   learning resources and licensed course materials.

   Responsibilities
   ----------------------------------------------------------
   • Wait for authenticated administrative identity
   • Enforce administrative authorization
   • Coordinate resource registry loading
   • Coordinate draft creation and updates
   • Coordinate protected-resource upload
   • Coordinate publication and withdrawal
   • Coordinate filtering and version-history display
   • Coordinate published-resource learner assignment
   • Read governed release metadata from the Admin form
   • Normalize availability-window values
   • Delegate rendering to LearningResourceRenderer
   • Keep Firestore and Storage logic outside the controller

   Non-Responsibilities
   ----------------------------------------------------------
   • Learner identity creation
   • Learner entitlement resolution
   • Learner release-policy evaluation
   • Firestore mutation implementation
   • Storage mutation implementation
   • Contract governance
   • HTML rendering

   Governance
   ----------------------------------------------------------
   • Admin Portal is the resource-management authority
   • Drafts may be edited
   • Published versions are immutable
   • Protected resources require an attached delivery asset
   • External resources require an external URL
   • Withdrawn resources remain available for audit history
   • Client-side deletion is prohibited
   • ADR-019 governs protected resource delivery
   • ADR-020 governs release-policy metadata
   • Admin records release metadata
   • Learning Resource Resolver evaluates learner visibility
   • Contract remains the validation authority

   Change History
   ----------------------------------------------------------
   v1.3.0
   • Added published-resource learner-assignment orchestration
   • Added governed learner_resource_access form submission
   • Added lazy access-service loading to preserve page startup
   • Added duplicate-safe assignment error handling
   • Added access-panel cancel and authorization cleanup
   • Preserved all existing resource lifecycle behaviour

   v1.2.0
   • Added release_policy form handling
   • Added module_number and session_number form handling
   • Added available_from and available_until handling
   • Added safe datetime-local to ISO conversion
   • Added availability-window consistency validation
   • Added release-governance information to resource details
   • Preserved all existing controller APIs and lifecycle flows

   v1.1.0
   • Established governed administrative lifecycle orchestration
   • Added filtering, upload, publication, withdrawal and history
========================================================== */

import {
    auth,
    onAuthStateChanged
} from "../../../assets/js/core.js";

import {
    LearningResourceContract
} from "./config/learning-resource-contract.js";

import {
    LearningResourceStorage,
    requireAuthorizedAdmin
} from "./service/learning-resource-storage.js";

import {
    LearningResourcePublisher
} from "./service/learning-resource-publisher.js";

import {
    LearningResourceService
} from "./service/learning-resource-service.js";

import {
    LearningResourceRenderer
} from "./ui/learning-resource-renderer.js";


/* ==========================================================
   MODULE METADATA
========================================================== */

const MODULE_NAME =
    "LearningResourceController";

const MODULE_VERSION =
    "1.3.0";

const SEARCH_DEBOUNCE_MS =
    250;

const AUTHORIZATION_TIMEOUT_MS =
    10000;

/* ==========================================================
   STATE
========================================================== */

const state = {

    initialized:
        false,

    authorized:
        false,

    busy:
        false,

    resources:
        [],

    filters: {

        programCode:
            "",

        status:
            "",

        category:
            "",

        resourceType:
            "",

        search:
            ""

    },

    searchTimer:
        null,

    accessService:
        null,

    accessServicePromise:
        null

};


/* ==========================================================
   DOM HELPERS
========================================================== */

function getElement(
    id
) {

    return document.getElementById(
        id
    );

}


function getFormField(
    form,
    fieldName
) {

    return (
        form?.elements?.namedItem(
            fieldName
        ) ||
        null
    );

}


function getFieldValue(
    form,
    fieldName
) {

    const field =
        getFormField(
            form,
            fieldName
        );

    return field
        ? String(
            field.value ?? ""
        ).trim()
        : "";

}


function getFieldChecked(
    form,
    fieldName
) {

    return (
        getFormField(
            form,
            fieldName
        )?.checked === true
    );

}


function getSelectedFile(
    form
) {

    return (
        getFormField(
            form,
            "resource_file"
        )?.files?.[0] ||
        null
    );

}


/* ==========================================================
   VALUE HELPERS
========================================================== */

function normalizeText(
    value
) {

    return String(
        value ?? ""
    ).trim();

}


function normalizeLowercase(
    value
) {

    return normalizeText(
        value
    ).toLowerCase();

}


function normalizeEmail(
    value
) {

    return normalizeLowercase(
        value
    );

}


function normalizeNullablePositiveInteger(
    value
) {

    const normalizedText =
        normalizeText(
            value
        );

    if (
        !normalizedText
    ) {

        return null;

    }

    const normalizedNumber =
        Number(
            normalizedText
        );

    if (
        !Number.isInteger(
            normalizedNumber
        ) ||
        normalizedNumber < 1
    ) {

        return null;

    }

    return normalizedNumber;

}


function normalizeNullableIsoDateTime(
    value
) {

    const normalizedValue =
        normalizeText(
            value
        );

    if (
        !normalizedValue
    ) {

        return null;

    }

    const date =
        new Date(
            normalizedValue
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }

    return date.toISOString();

}


function getErrorMessage(
    error,
    fallback =
        "The operation could not be completed."
) {

    return (
        normalizeText(
            error?.message
        ) ||
        fallback
    );

}


function isValidEmail(
    value
) {

    const normalizedEmail =
        normalizeEmail(
            value
        );

    if (
        !normalizedEmail ||
        normalizedEmail.length >
            320
    ) {

        return false;

    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail
    );

}

/* ==========================================================
   RELEASE-GOVERNANCE HELPERS
========================================================== */

function validateAvailabilityWindow(
    availableFrom,
    availableUntil
) {

    if (
        !availableFrom ||
        !availableUntil
    ) {

        return Object.freeze({

            valid:
                true,

            message:
                ""

        });

    }

    const fromDate =
        new Date(
            availableFrom
        );

    const untilDate =
        new Date(
            availableUntil
        );

    if (
        Number.isNaN(
            fromDate.getTime()
        ) ||
        Number.isNaN(
            untilDate.getTime()
        )
    ) {

        return Object.freeze({

            valid:
                false,

            message:
                "The learning-resource availability window is invalid."

        });

    }

    if (
        untilDate.getTime() <=
        fromDate.getTime()
    ) {

        return Object.freeze({

            valid:
                false,

            message:
                "Available Until must be later than Available From."

        });

    }

    return Object.freeze({

        valid:
            true,

        message:
            ""

    });

}


/* ==========================================================
   LEARNER-ACCESS SERVICE LOADING
========================================================== */

async function getLearnerResourceAccessService() {

    if (
        state.accessService
    ) {

        return state.accessService;

    }

    if (
        state.accessServicePromise
    ) {

        return state.accessServicePromise;

    }

    state.accessServicePromise =
        import(
            "./service/learner-resource-access-service.js"
        )
            .then(
                (
                    module
                ) => {

                    const service =
                        (
                            module
                                .LearnerResourceAccessService
                        ) ||
                        (
                            module
                                .default
                        ) ||
                        null;

                    if (
                        !service ||
                        typeof service !==
                            "object"
                    ) {

                        throw new Error(
                            "Learner resource access service is unavailable."
                        );

                    }

                    state.accessService =
                        service;

                    return service;

                }
            )
            .catch(
                (
                    error
                ) => {

                    state.accessServicePromise =
                        null;

                    throw error;

                }
            );

    return state.accessServicePromise;

}


function getCreateAccessMethod(
    service
) {

    if (
        typeof service?.createAccess ===
            "function"
    ) {

        return service
            .createAccess
            .bind(
                service
            );

    }

    if (
        typeof service?.createAssignment ===
            "function"
    ) {

        return service
            .createAssignment
            .bind(
                service
            );

    }

    if (
        typeof service?.grantAccess ===
            "function"
    ) {

        return service
            .grantAccess
            .bind(
                service
            );

    }

    return null;

}


/* ==========================================================
   BUSY STATE
========================================================== */

function setBusy(
    busy
) {

    state.busy =
        busy === true;

    LearningResourceRenderer.setLoading(
        state.busy
    );

    const page =
        getElement(
            "learning-resource-management"
        );

    if (
        !page
    ) {

        return;

    }

    page
        .querySelectorAll(
            "button, input, select, textarea"
        )
        .forEach(
            (
                element
            ) => {

                if (
                    element.dataset.keepEnabled ===
                    "true"
                ) {

                    return;

                }

                if (
                    state.busy
                ) {

                    if (
                        !element.disabled
                    ) {

                        element.disabled =
                            true;

                        element.dataset.disabledByBusy =
                            "true";

                    }

                    return;

                }

                if (
                    element.dataset.disabledByBusy ===
                    "true"
                ) {

                    element.disabled =
                        false;

                    delete element.dataset.disabledByBusy;

                }

            }
        );

}


/* ==========================================================
   ERROR HANDLING
========================================================== */

function handleError(
    context,
    error
) {

    console.error(
        `[${MODULE_NAME}] ${context}:`,
        error
    );

    LearningResourceRenderer.setStatus(
        getErrorMessage(
            error
        ),
        "error"
    );

}


/* ==========================================================
   FILTERS
========================================================== */

function readFilters() {

    state.filters = {

        programCode:
            normalizeText(
                getElement(
                    "learning-resource-filter-program"
                )?.value
            ),

        status:
            normalizeLowercase(
                getElement(
                    "learning-resource-filter-status"
                )?.value
            ),

        category:
            normalizeLowercase(
                getElement(
                    "learning-resource-filter-category"
                )?.value
            ),

        resourceType:
            normalizeLowercase(
                getElement(
                    "learning-resource-filter-type"
                )?.value
            ),

        search:
            normalizeText(
                getElement(
                    "learning-resource-filter-search"
                )?.value
            )

    };

    return {
        ...state.filters
    };

}


/* ==========================================================
   RESOURCE LOADING
========================================================== */

async function loadResources({
    preserveStatus = false
} = {}) {

    if (
        state.busy ||
        !state.authorized
    ) {

        return;

    }

    setBusy(
        true
    );

    if (
        !preserveStatus
    ) {

        LearningResourceRenderer.clearStatus();

    }

    try {

        const filters =
            readFilters();

        const [
            resources,
            summary
        ] =
            await Promise.all([

                LearningResourceService.listResources(
                    filters
                ),

                LearningResourceService.getSummary()

            ]);

        state.resources =
            Array.isArray(
                resources
            )
                ? [
                    ...resources
                ]
                : [];

        LearningResourceRenderer.renderSummary(
            summary || {}
        );

        LearningResourceRenderer.renderResources(
            state.resources
        );

    }
    catch (
        error
    ) {

        state.resources =
            [];

        LearningResourceRenderer.renderResources(
            []
        );

        handleError(
            "Resource loading failed",
            error
        );

    }
    finally {

        setBusy(
            false
        );

    }

}

/* ==========================================================
   FORM DATA
========================================================== */

function readResourceForm(
    form
) {

    const availableFrom =
        normalizeNullableIsoDateTime(
            getFieldValue(
                form,
                "available_from"
            )
        );

    const availableUntil =
        normalizeNullableIsoDateTime(
            getFieldValue(
                form,
                "available_until"
            )
        );

    return {

        program_code:
            getFieldValue(
                form,
                "program_code"
            ),

        resource_id:
            getFieldValue(
                form,
                "resource_id"
            ),

        version:
            Number(
                getFieldValue(
                    form,
                    "version"
                ) ||
                1
            ),

        title:
            getFieldValue(
                form,
                "title"
            ),

        description:
            getFieldValue(
                form,
                "description"
            ),

        resource_type:
            getFieldValue(
                form,
                "resource_type"
            ),

        category:
            getFieldValue(
                form,
                "category"
            ),

        delivery_type:
            getFieldValue(
                form,
                "delivery_type"
            ),

        external_url:
            (
                getFieldValue(
                    form,
                    "external_url"
                ) ||
                null
            ),

        display_order:
            Number(
                getFieldValue(
                    form,
                    "display_order"
                ) ||
                0
            ),

        release_policy:
            normalizeLowercase(
                getFieldValue(
                    form,
                    "release_policy"
                )
            ),

        module_number:
            normalizeNullablePositiveInteger(
                getFieldValue(
                    form,
                    "module_number"
                )
            ),

        session_number:
            normalizeNullablePositiveInteger(
                getFieldValue(
                    form,
                    "session_number"
                )
            ),

        available_from:
            availableFrom,

        available_until:
            availableUntil,

        preview_allowed:
            getFieldChecked(
                form,
                "preview_allowed"
            ),

        download_allowed:
            getFieldChecked(
                form,
                "download_allowed"
            ),

        embed_allowed:
            getFieldChecked(
                form,
                "embed_allowed"
            )

    };

}


/* ==========================================================
   LEARNER-ACCESS FORM DATA
========================================================== */

function readAccessForm(
    form
) {

    const resourceDocumentId =
        normalizeText(
            form?.dataset
                ?.resourceDocumentId
        );

    const resourceId =
        normalizeText(
            form?.dataset
                ?.resourceId ||
            getFieldValue(
                form,
                "resource_id"
            )
        );

    const programCode =
        normalizeText(
            form?.dataset
                ?.programCode ||
            getFieldValue(
                form,
                "program_code"
            )
        ).toUpperCase();

    const resourceVersion =
        normalizeNullablePositiveInteger(
            form?.dataset
                ?.resourceVersion ||
            getFieldValue(
                form,
                "resource_version"
            )
        ) ||
        1;

    const learnerEmail =
        normalizeEmail(
            getFieldValue(
                form,
                "learner_email"
            )
        );

    const learnerUid =
        normalizeText(
            getFieldValue(
                form,
                "learner_uid"
            )
        ) ||
        null;

    const credentialId =
        normalizeText(
            getFieldValue(
                form,
                "credential_id"
            )
        ).toUpperCase() ||
        null;

    const availableFrom =
        normalizeNullableIsoDateTime(
            getFieldValue(
                form,
                "available_from"
            )
        );

    const availableUntil =
        normalizeNullableIsoDateTime(
            getFieldValue(
                form,
                "available_until"
            )
        );

    const identitySource =
        normalizeLowercase(
            getFieldValue(
                form,
                "identity_source"
            )
        ) ||
        (
            learnerUid
                ? "authenticated_identity"
                : credentialId
                    ? "historical_credential"
                    : "verified_email"
        );

    const identityStatus =
        learnerUid
            ? "activated"
            : (
                normalizeLowercase(
                    getFieldValue(
                        form,
                        "identity_status"
                    )
                ) ||
                "pending_activation"
            );

    const accessStatus =
        learnerUid
            ? "active"
            : (
                normalizeLowercase(
                    getFieldValue(
                        form,
                        "access_status"
                    )
                ) ||
                "pending_activation"
            );

    return {

        resource_document_id:
            resourceDocumentId,

        resource_id:
            resourceId,

        program_code:
            programCode,

        resource_version:
            resourceVersion,

        learner_uid:
            learnerUid,

        learner_email:
            learnerEmail,

        learner_email_normalized:
            learnerEmail,

        credential_id:
            credentialId,

        identity_source:
            identitySource,

        identity_status:
            identityStatus,

        access_status:
            accessStatus,

        access_type:
            normalizeLowercase(
                getFieldValue(
                    form,
                    "access_type"
                )
            ) ||
            "individual_licensed",

        release_status:
            normalizeLowercase(
                getFieldValue(
                    form,
                    "release_status"
                )
            ) ||
            "released",

        release_policy:
            normalizeLowercase(
                getFieldValue(
                    form,
                    "release_policy"
                )
            ) ||
            (
                learnerUid
                    ? "immediate"
                    : "on_activation"
            ),

        module_number:
            normalizeNullablePositiveInteger(
                getFieldValue(
                    form,
                    "module_number"
                )
            ),

        session_number:
            normalizeNullablePositiveInteger(
                getFieldValue(
                    form,
                    "session_number"
                )
            ),

        available_from:
            availableFrom,

        available_until:
            availableUntil,

        preview_allowed:
            getFieldChecked(
                form,
                "preview_allowed"
            ),

        download_allowed:
            getFieldChecked(
                form,
                "download_allowed"
            )

    };

}


/* ==========================================================
   LEARNER-ACCESS VALIDATION
========================================================== */

function validateAccessInput(
    input
) {

    const errors =
        [];

    if (
        !input.resource_document_id
    ) {

        errors.push(
            "The learning-resource document identity is missing."
        );

    }

    if (
        !input.resource_id
    ) {

        errors.push(
            "The learning-resource ID is missing."
        );

    }

    if (
        !input.program_code
    ) {

        errors.push(
            "The programme code is missing."
        );

    }

    if (
        !isValidEmail(
            input.learner_email
        )
    ) {

        errors.push(
            "Enter a valid learner email address."
        );

    }

    if (
        input.identity_status ===
            "activated" &&
        !input.learner_uid
    ) {

        errors.push(
            "An activated learner assignment requires a learner UID."
        );

    }

    if (
        input.learner_uid &&
        input.identity_status !==
            "activated"
    ) {

        errors.push(
            "A learner UID requires activated identity status."
        );

    }

    if (
        !input.learner_uid &&
        input.access_status ===
            "active"
    ) {

        errors.push(
            "Pending first-login assignments cannot use active access status."
        );

    }

    const availabilityValidation =
        validateAvailabilityWindow(
            input.available_from,
            input.available_until
        );

    if (
        !availabilityValidation.valid
    ) {

        errors.push(
            availabilityValidation.message
        );

    }

    return Object.freeze({

        valid:
            errors.length ===
                0,

        errors:
            Object.freeze(
                errors
            )

    });

}


/* ==========================================================
   DRAFT CREATION AND UPDATE
========================================================== */

async function handleFormSubmit(
    event
) {

    event.preventDefault();

    if (
        state.busy ||
        !state.authorized
    ) {

        return;

    }

    const form =
        event.currentTarget;

    const mode =
        form.dataset.mode ||
        "create";

    const existingDocumentId =
        normalizeText(
            form.dataset.documentId
        );

    const rawInput =
        readResourceForm(
            form
        );

    const availabilityValidation =
        validateAvailabilityWindow(
            rawInput.available_from,
            rawInput.available_until
        );

    if (
        !availabilityValidation.valid
    ) {

        LearningResourceRenderer.setStatus(
            availabilityValidation.message,
            "error"
        );

        return;

    }

    const normalizedInput =
        LearningResourceContract
            .normalizeResourceInput(
                rawInput
            );

    const validation =
        LearningResourceContract
            .validateDraft(
                normalizedInput
            );

    if (
        !validation.valid
    ) {

        LearningResourceRenderer.setStatus(
            validation.errors.join(
                " "
            ),
            "error"
        );

        return;

    }

    setBusy(
        true
    );

    LearningResourceRenderer.setStatus(
        mode ===
            "edit"
            ? "Saving learning-resource draft…"
            : "Creating learning-resource draft…",
        "info"
    );

        try {

        let documentId =
            existingDocumentId;

        if (
            mode ===
            "edit"
        ) {

            if (
                !documentId
            ) {

                throw new Error(
                    "Draft document identity is missing."
                );

            }

            await LearningResourcePublisher.updateDraft(
                documentId,
                normalizedInput
            );

        }
        else {

            const createdDraft =
                await LearningResourcePublisher.createDraft(
                    normalizedInput
                );

            documentId =
                normalizeText(
                    createdDraft?.documentId
                );

            if (
                !documentId
            ) {

                throw new Error(
                    "The learning-resource draft was created without a document identity."
                );

            }

        }

        const selectedFile =
            getSelectedFile(
                form
            );

        if (
            normalizedInput.delivery_type ===
                "protected_storage" &&
            selectedFile
        ) {

            LearningResourceRenderer.setStatus(
                "Uploading protected learning resource…",
                "info"
            );

            const uploadResult =
                await LearningResourceStorage
                    .uploadProtectedResource({

                        programCode:
                            normalizedInput.program_code,

                        resourceId:
                            normalizedInput.resource_id,

                        version:
                            normalizedInput.version,

                        file:
                            selectedFile

                    });

            await LearningResourcePublisher
                .attachProtectedAsset(
                    documentId,
                    uploadResult
                );

        }

        LearningResourceRenderer.closeForm();

        LearningResourceRenderer.setStatus(

            mode ===
                "edit"

                ? "Learning-resource draft updated."

                : "Learning-resource draft created.",

            "success"

        );

    }
    catch (
        error
    ) {

        handleError(
            "Draft save failed",
            error
        );

        return;

    }
    finally {

        setBusy(
            false
        );

    }

    await loadResources({

        preserveStatus:
            true

    });

}


/* ==========================================================
   LEARNER RESOURCE ACCESS
========================================================== */

async function handleAccessFormSubmit(
    event
) {

    event.preventDefault();

    if (
        state.busy ||
        !state.authorized
    ) {

        return;

    }

    const form =
        event.currentTarget;

    const input =
        readAccessForm(
            form
        );

    const validation =
        validateAccessInput(
            input
        );

    if (
        !validation.valid
    ) {

        LearningResourceRenderer.setStatus(

            validation.errors.join(
                " "
            ),

            "error"

        );

        return;

    }

    setBusy(
        true
    );

    LearningResourceRenderer.setStatus(

        "Assigning learning resource...",

        "info"

    );

    try {

        const service =
            await getLearnerResourceAccessService();

        const createAccess =
            getCreateAccessMethod(
                service
            );

        if (
            !createAccess
        ) {

            throw new Error(
                "The learner-resource-access service does not expose a supported create method."
            );

        }

        await createAccess(
            input
        );

        LearningResourceRenderer.closeAccessForm();

        LearningResourceRenderer.setStatus(

            input.identity_status ===
                "activated"

                ? "Learning resource assigned successfully."

                : "Learning resource staged successfully for first-login activation.",

            "success"

        );

    }
    catch (
        error
    ) {

        handleError(
            "Learner assignment failed",
            error
        );

        return;

    }
    finally {

        setBusy(
            false
        );

    }

}

/* ==========================================================
   CREATE FORM
========================================================== */

function handleCreateResource() {

    if (
        state.busy ||
        !state.authorized
    ) {

        return;

    }

    LearningResourceRenderer.clearStatus();

    LearningResourceRenderer.openForm({
        mode:
            "create"
    });

}


/* ==========================================================
   EDIT AND UPLOAD
========================================================== */

async function handleEditResource(
    documentId,
    focusFile = false
) {

    if (
        state.busy ||
        !state.authorized
    ) {

        return;

    }

    setBusy(
        true
    );

    try {

        const resource =
            await LearningResourceService.getResource(
                documentId
            );

        if (
            !resource
        ) {

            throw new Error(
                "Learning-resource draft was not found."
            );

        }

        if (
            resource.status !==
                "draft"
        ) {

            throw new Error(
                "Only draft resources can be edited."
            );

        }

        LearningResourceRenderer.openForm({
            mode:
                "edit",

            resource
        });

        if (
            focusFile
        ) {

            window.requestAnimationFrame(
                () => {

                    getFormField(
                        getElement(
                            "learning-resource-form"
                        ),
                        "resource_file"
                    )?.focus();

                }
            );

        }

    }
    catch (
        error
    ) {

        handleError(
            "Unable to open resource",
            error
        );

    }
    finally {

        setBusy(
            false
        );

    }

}


/* ==========================================================
   PUBLICATION PREFLIGHT
========================================================== */

function hasProtectedAsset(
    resource
) {

    return Boolean(

        normalizeText(
            resource?.storagePath
        ) ||

        normalizeText(
            resource?.fileName
        ) ||

        normalizeText(
            resource?.asset?.storagePath
        ) ||

        normalizeText(
            resource?.asset?.fileName
        )

    );

}


function hasExternalDeliveryUrl(
    resource
) {

    return Boolean(

        normalizeText(
            resource?.externalUrl
        ) ||

        normalizeText(
            resource?.external_url
        )

    );

}


function validatePublicationReadiness(
    resource
) {

    if (
        !resource
    ) {

        return Object.freeze({

            valid:
                false,

            message:
                "Learning resource was not found."

        });

    }

    if (
        resource.status !==
            "draft"
    ) {

        return Object.freeze({

            valid:
                false,

            message:
                "Only draft resources can be published."

        });

    }

    const deliveryType =
        normalizeLowercase(
            resource.deliveryType ||
            resource.delivery_type
        );

    if (
        deliveryType ===
            "protected_storage" &&
        !hasProtectedAsset(
            resource
        )
    ) {

        return Object.freeze({

            valid:
                false,

            message:
                "Upload the protected learning-resource file before publication."

        });

    }

    if (
        (
            deliveryType ===
                "external_video" ||
            deliveryType ===
                "external_link"
        ) &&
        !hasExternalDeliveryUrl(
            resource
        )
    ) {

        return Object.freeze({

            valid:
                false,

            message:
                "Add the external delivery URL before publication."

        });

    }

    const availabilityValidation =
        validateAvailabilityWindow(
            resource.availableFrom ||
                resource.available_from,
            resource.availableUntil ||
                resource.available_until
        );

    if (
        !availabilityValidation.valid
    ) {

        return availabilityValidation;

    }

    return Object.freeze({

        valid:
            true,

        message:
            ""

    });

}


/* ==========================================================
   PUBLISH RESOURCE
========================================================== */

async function handlePublishResource(
    documentId
) {

    if (
        state.busy ||
        !state.authorized
    ) {

        return;

    }

    setBusy(
        true
    );

    LearningResourceRenderer.setStatus(
        "Validating publication readiness…",
        "info"
    );

    try {

        const resource =
            await LearningResourceService.getResource(
                documentId
            );

        const readiness =
            validatePublicationReadiness(
                resource
            );

        if (
            !readiness.valid
        ) {

            throw new Error(
                readiness.message
            );

        }

        setBusy(
            false
        );

        const confirmed =
            window.confirm(
                "Publish this learning resource? " +
                "The published version, delivery asset, and release " +
                "metadata will become immutable."
            );

        if (
            !confirmed
        ) {

            LearningResourceRenderer.clearStatus();

            return;

        }

        setBusy(
            true
        );

        LearningResourceRenderer.setStatus(
            "Publishing learning resource…",
            "info"
        );

        await LearningResourcePublisher.publishResource(
            documentId
        );

        LearningResourceRenderer.setStatus(
            "Learning resource published successfully.",
            "success"
        );

    }
    catch (
        error
    ) {

        handleError(
            "Publication failed",
            error
        );

        return;

    }
    finally {

        setBusy(
            false
        );

    }

    await loadResources({
        preserveStatus:
            true
    });

}

/* ==========================================================
   ASSIGN LEARNER
========================================================== */

async function handleAssignResource(
    documentId
) {

    if (
        state.busy ||
        !state.authorized
    ) {

        return;

    }

    setBusy(
        true
    );

    try {

        const resource =
            await LearningResourceService.getResource(
                documentId
            );

        if (
            !resource
        ) {

            throw new Error(
                "Learning resource was not found."
            );

        }

        if (
            normalizeLowercase(
                resource.status
            ) !==
            "published"
        ) {

            throw new Error(
                "Only published learning resources can be assigned."
            );

        }

        LearningResourceRenderer.openAccessForm({

            resource

        });

        LearningResourceRenderer.clearStatus();

    }
    catch (
        error
    ) {

        handleError(
            "Unable to open learner assignment",
            error
        );

    }
    finally {

        setBusy(
            false
        );

    }

}


/* ==========================================================
   WITHDRAW RESOURCE
========================================================== */

async function handleWithdrawResource(
    documentId
) {

    if (
        state.busy ||
        !state.authorized
    ) {

        return;

    }

    const reason =
        window.prompt(
            "Enter the reason for withdrawing this resource:"
        );

    if (
        reason ===
            null
    ) {

        return;

    }

    const normalizedReason =
        normalizeText(
            reason
        );

    if (
        !normalizedReason
    ) {

        LearningResourceRenderer.setStatus(

            "A withdrawal reason is required.",

            "error"

        );

        return;

    }

    const confirmed =
        window.confirm(

            "Withdraw this learning resource? " +
            "Learner delivery will be disabled while " +
            "the resource remains available for audit history."

        );

    if (
        !confirmed
    ) {

        return;

    }

    setBusy(
        true
    );

    LearningResourceRenderer.setStatus(

        "Withdrawing learning resource...",

        "info"

    );

    try {

        await LearningResourcePublisher.withdrawResource(

            documentId,

            normalizedReason

        );

        LearningResourceRenderer.setStatus(

            "Learning resource withdrawn.",

            "success"

        );

    }
    catch (
        error
    ) {

        handleError(
            "Withdrawal failed",
            error
        );

        return;

    }
    finally {

        setBusy(
            false
        );

    }

    await loadResources({

        preserveStatus:
            true

    });

}


/* ==========================================================
   RESOURCE DETAILS
========================================================== */

async function handleViewResource(
    documentId
) {

    if (
        state.busy ||
        !state.authorized
    ) {

        return;

    }

    setBusy(
        true
    );

    try {

        const resource =
            await LearningResourceService.getResource(
                documentId
            );

        if (
            !resource
        ) {

            throw new Error(
                "Learning resource was not found."
            );

        }

        const releaseTargetParts =
            [];

        if (
            resource.moduleNumber
        ) {

            releaseTargetParts.push(
                `Module ${resource.moduleNumber}`
            );

        }

        if (
            resource.sessionNumber
        ) {

            releaseTargetParts.push(
                `Session ${resource.sessionNumber}`
            );

        }

        LearningResourceRenderer.setStatus(

            [

                resource.title ||
                    "Untitled resource",

                `${
                    resource.programCode ||
                    "No programme"
                } · v${
                    resource.version ||
                    1
                }`,

                `Status: ${
                    resource.status ||
                    "unknown"
                }`,

                `Delivery: ${
                    resource.deliveryType ||
                    "not configured"
                }`,

                `Release: ${
                    resource.releasePolicy ||
                    "not configured"
                }`,

                `Target: ${
                    releaseTargetParts.join(", ") ||
                    "not specified"
                }`,

                `Available from: ${
                    resource.availableFrom ||
                    "not scheduled"
                }`,

                `Available until: ${
                    resource.availableUntil ||
                    "no scheduled expiry"
                }`,

                `File: ${
                    resource.fileName ||
                    "Not attached"
                }`,

                `Updated: ${
                    resource.updatedAt ||
                    "Not available"
                }`

            ].join(
                " | "
            ),

            "info"

        );

    }
    catch (
        error
    ) {

        handleError(
            "Unable to display details",
            error
        );

    }
    finally {

        setBusy(
            false
        );

    }

}

/* ==========================================================
   VERSION HISTORY
========================================================== */

async function handleViewVersions(
    documentId
) {

    if (
        state.busy ||
        !state.authorized
    ) {

        return;

    }

    setBusy(
        true
    );

    try {

        const resource =
            await LearningResourceService.getResource(
                documentId
            );

        if (
            !resource
        ) {

            throw new Error(
                "Learning resource was not found."
            );

        }

        const versions =
            await LearningResourceService.listVersions(
                resource.resourceId
            );

        const normalizedVersions =
            Array.isArray(
                versions
            )
                ? versions
                : [];

        LearningResourceRenderer.renderResources(
            normalizedVersions
        );

        LearningResourceRenderer.setStatus(
            `Showing ${normalizedVersions.length} version(s) for ${resource.title}.`,
            "info"
        );

    }
    catch (
        error
    ) {

        handleError(
            "Version history failed",
            error
        );

    }
    finally {

        setBusy(
            false
        );

    }

}


/* ==========================================================
   ACTION ROUTING
========================================================== */

async function handleResourceAction(
    event
) {

    const button =
        event.target.closest(
            "[data-action]"
        );

    if (
        !button ||
        !event.currentTarget.contains(
            button
        )
    ) {

        return;

    }

    const action =
        normalizeText(
            button.dataset.action
        );

    const documentId =
        normalizeText(
            button.dataset.documentId
        );

    if (
        !action ||
        !documentId
    ) {

        return;

    }

    const handlers = {

        "view-resource":
            () =>
                handleViewResource(
                    documentId
                ),

        "edit-resource":
            () =>
                handleEditResource(
                    documentId
                ),

        "upload-resource":
            () =>
                handleEditResource(
                    documentId,
                    true
                ),

        "publish-resource":
            () =>
                handlePublishResource(
                    documentId
                ),

        "assign-resource":
            () =>
                handleAssignResource(
                    documentId
                ),

        "withdraw-resource":
            () =>
                handleWithdrawResource(
                    documentId
                ),

        "view-versions":
            () =>
                handleViewVersions(
                    documentId
                )

    };

    const handler =
        handlers[
            action
        ];

    if (
        typeof handler !==
            "function"
    ) {

        console.warn(
            `[${MODULE_NAME}] Unsupported action:`,
            action
        );

        return;

    }

    await handler();

}


/* ==========================================================
   EVENT BINDING
========================================================== */

function scheduleFilteredLoad() {

    window.clearTimeout(
        state.searchTimer
    );

    state.searchTimer =
        window.setTimeout(
            () => {

                loadResources()
                    .catch(
                        (
                            error
                        ) => {

                            handleError(
                                "Filtered resource loading failed",
                                error
                            );

                        }
                    );

            },
            SEARCH_DEBOUNCE_MS
        );

}


function bindEvents() {

    getElement(
        "learning-resource-create"
    )?.addEventListener(
        "click",
        handleCreateResource
    );

    getElement(
        "learning-resource-refresh"
    )?.addEventListener(
        "click",
        () => {

            loadResources()
                .catch(
                    (
                        error
                    ) => {

                        handleError(
                            "Resource refresh failed",
                            error
                        );

                    }
                );

        }
    );

    getElement(
        "learning-resource-form-cancel"
    )?.addEventListener(
        "click",
        () =>
            LearningResourceRenderer.closeForm()
    );

    getElement(
        "learning-resource-form-cancel-secondary"
    )?.addEventListener(
        "click",
        () =>
            LearningResourceRenderer.closeForm()
    );

    getElement(
        "learning-resource-form"
    )?.addEventListener(
        "submit",
        handleFormSubmit
    );

    getElement(
        "learner-resource-access-form-cancel"
    )?.addEventListener(
        "click",
        () =>
            LearningResourceRenderer.closeAccessForm()
    );

    getElement(
        "learner-resource-access-form-cancel-secondary"
    )?.addEventListener(
        "click",
        () =>
            LearningResourceRenderer.closeAccessForm()
    );

    getElement(
        "learner-resource-access-form"
    )?.addEventListener(
        "submit",
        handleAccessFormSubmit
    );

    getElement(
        "learning-resource-list"
    )?.addEventListener(
        "click",
        handleResourceAction
    );

    [
        "learning-resource-filter-program",
        "learning-resource-filter-status",
        "learning-resource-filter-category",
        "learning-resource-filter-type"
    ].forEach(
        (
            elementId
        ) => {

            getElement(
                elementId
            )?.addEventListener(
                "change",
                () => {

                    loadResources()
                        .catch(
                            (
                                error
                            ) => {

                                handleError(
                                    "Filtered resource loading failed",
                                    error
                                );

                            }
                        );

                }
            );

        }
    );

    getElement(
        "learning-resource-filter-search"
    )?.addEventListener(
        "input",
        scheduleFilteredLoad
    );

}

/* ==========================================================
   AUTHORIZATION
========================================================== */

async function handleAuthorized(
    authorizationContext = {}
) {

    state.authorized =
        true;

    state.authorizationContext =
        authorizationContext;

    LearningResourceRenderer.setAuthorized(
        true
    );

    LearningResourceRenderer.clearStatus();

    await loadResources();

}


function handleUnauthorized(
    reason = "You are not authorized to manage learning resources."
) {

    state.authorized =
        false;

    state.authorizationContext =
        null;

    state.resources =
        [];

    state.accessService =
        null;

    state.accessServicePromise =
        null;

    window.clearTimeout(
        state.searchTimer
    );

    state.searchTimer =
        null;

    LearningResourceRenderer.closeForm();

    LearningResourceRenderer.closeAccessForm();

    LearningResourceRenderer.renderResources(
        []
    );

    LearningResourceRenderer.renderSummary(
        {}
    );

    LearningResourceRenderer.setAuthorized(
        false
    );

    LearningResourceRenderer.setStatus(
        reason,
        "error"
    );

}


/* ==========================================================
   AUTHORIZATION READINESS
========================================================== */

function waitForAuthorization() {

    return new Promise(
        (
            resolve
        ) => {

            let completed =
                false;

            const complete =
                (
                    result
                ) => {

                    if (
                        completed
                    ) {

                        return;

                    }

                    completed =
                        true;

                    resolve(
                        result
                    );

                };

            window.addEventListener(
                "admin:authorized",
                (
                    event
                ) => {

                    complete({

                        authorized:
                            true,

                        context:
                            event.detail ||
                            {}

                    });

                },
                {
                    once:
                        true
                }
            );

            window.addEventListener(
                "admin:unauthorized",
                (
                    event
                ) => {

                    complete({

                        authorized:
                            false,

                        reason:
                            event.detail?.reason ||
                            "You are not authorized to manage learning resources."

                    });

                },
                {
                    once:
                        true
                }
            );

            const existingAuthorization =
                window.AdminAuthorization ||
                window.adminAuthorization ||
                null;

            if (
                existingAuthorization
                    ?.ready ===
                    true
            ) {

                complete({

                    authorized:
                        existingAuthorization
                            .authorized ===
                            true,

                    context:
                        existingAuthorization
                            .context ||
                            {},

                    reason:
                        existingAuthorization
                            .reason ||
                            "You are not authorized to manage learning resources."

                });

                return;

            }

            window.setTimeout(
                () => {

                    complete({

                        authorized:
                            false,

                        reason:
                            "Administrative authorization was not confirmed."

                    });

                },
                AUTHORIZATION_TIMEOUT_MS
            );

        }
    );

}


/* ==========================================================
   INITIALIZATION
========================================================== */

async function initialize() {

    if (
        state.initialized
    ) {

        return;

    }

    state.initialized =
        true;

    LearningResourceRenderer.initialize();

    bindEvents();

    LearningResourceRenderer.setAuthorized(
        false
    );

    LearningResourceRenderer.setStatus(
        "Confirming administrative authorization…",
        "info"
    );

    try {

        const authorization =
            await waitForAuthorization();

        if (
            !authorization.authorized
        ) {

            handleUnauthorized(
                authorization.reason
            );

            return;

        }

        await handleAuthorized(
            authorization.context
        );

    }
    catch (
        error
    ) {

        handleUnauthorized(
            getErrorMessage(
                error
            )
        );

    }

}


/* ==========================================================
   PUBLIC API
========================================================== */

const LearningResourceController =
    Object.freeze({

        initialize,

        reload:
            () =>
                loadResources(),

        openCreateForm:
            handleCreateResource,

        openEditForm:
            (
                documentId
            ) =>
                handleEditResource(
                    documentId
                ),

        openLearnerAssignment:
            (
                documentId
            ) =>
                handleAssignResource(
                    documentId
                ),

        publish:
            (
                documentId
            ) =>
                handlePublishResource(
                    documentId
                ),

        withdraw:
            (
                documentId
            ) =>
                handleWithdrawResource(
                    documentId
                ),

        getState:
            () =>
                Object.freeze({

                    initialized:
                        state.initialized,

                    authorized:
                        state.authorized,

                    busy:
                        state.busy,

                    resourceCount:
                        state.resources.length,

                    filters:
                        Object.freeze({
                            ...state.filters
                        })

                })

    });


/* ==========================================================
   BOOTSTRAP
========================================================== */

if (
    document.readyState ===
        "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            initialize()
                .catch(
                    (
                        error
                    ) => {

                        handleError(
                            "Controller initialization failed",
                            error
                        );

                    }
                );

        },
        {
            once:
                true
        }
    );

}
else {

    initialize()
        .catch(
            (
                error
            ) => {

                handleError(
                    "Controller initialization failed",
                    error
                );

            }
        );

}


/* ==========================================================
   EXPORTS
========================================================== */

export {

    LearningResourceController,
    initialize

};

export default LearningResourceController;