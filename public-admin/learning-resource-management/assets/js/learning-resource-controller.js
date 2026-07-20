/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File       : learning-resource-controller.js
   Version    : 1.2.0
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
   • Read governed release metadata from the Admin form
   • Normalize availability-window values
   • Delegate rendering to LearningResourceRenderer
   • Keep Firestore and Storage logic outside the controller

   Non-Responsibilities
   ----------------------------------------------------------
   • Learner identity resolution
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
    "1.2.0";

const SEARCH_DEBOUNCE_MS =
    250;


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
            "Learner delivery will be disabled, while the " +
            "resource remains available for governance history."
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
        "Withdrawing learning resource…",
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
                    releaseTargetParts.join(
                        ", "
                    ) ||
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

function deactivateAuthorizedView() {

    state.authorized =
        false;

    state.resources =
        [];

    window.clearTimeout(
        state.searchTimer
    );

    state.searchTimer =
        null;

    setBusy(
        false
    );

    if (
        state.initialized
    ) {

        LearningResourceRenderer.closeForm();

        LearningResourceRenderer.renderResources(
            []
        );

        LearningResourceRenderer.setStatus(
            "Administrator authentication is required.",
            "error"
        );

    }

}


async function activateAuthorizedView() {

    if (
        state.authorized ||
        !auth.currentUser
    ) {

        return;

    }

    try {

        await requireAuthorizedAdmin();

        state.authorized =
            true;

        await loadResources();

        console.info(
            `[${MODULE_NAME}] Initialized v${MODULE_VERSION}`
        );

    }
    catch (
        error
    ) {

        state.authorized =
            false;

        handleError(
            "Authorization failed",
            error
        );

    }

}


/* ==========================================================
   INITIALIZATION
========================================================== */

async function initialize() {

    if (
        !state.initialized
    ) {

        state.initialized =
            true;

        LearningResourceRenderer.initialize();

        bindEvents();

    }

    await activateAuthorizedView();

}


onAuthStateChanged(
    auth,
    async (
        user
    ) => {

        if (
            !user
        ) {

            deactivateAuthorizedView();

            return;

        }

        try {

            await initialize();

        }
        catch (
            error
        ) {

            handleError(
                "Controller initialization failed",
                error
            );

        }

    }
);


/* ==========================================================
   PUBLIC API
========================================================== */

const LearningResourceController =
    Object.freeze({

        moduleName:
            MODULE_NAME,

        version:
            MODULE_VERSION,

        initialize,

        loadResources

    });


window.LearningResourceController =
    LearningResourceController;


export {

    LearningResourceController,

    initialize,

    loadResources

};