/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File    : learning-resource-controller.js
   Version : 1.0.1
   Status  : ACTIVE
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

const MODULE_NAME = "LearningResourceController";
const MODULE_VERSION = "1.0.1";

const state = {
    initialized: false,
    authorized: false,
    busy: false,
    resources: [],
    filters: {
        programCode: "",
        status: "",
        category: "",
        resourceType: "",
        search: ""
    }
};

function getElement(id) {
    return document.getElementById(id);
}

function getFormField(form, fieldName) {
    return form?.elements?.namedItem(fieldName) || null;
}

function getFieldValue(form, fieldName) {
    const field = getFormField(form, fieldName);
    return field ? String(field.value || "").trim() : "";
}

function getFieldChecked(form, fieldName) {
    return getFormField(form, fieldName)?.checked === true;
}

function getSelectedFile(form) {
    return getFormField(form, "resource_file")?.files?.[0] || null;
}

function setBusy(busy) {
    state.busy = busy === true;
    LearningResourceRenderer.setLoading(state.busy);

    const page = getElement("learning-resource-management");

    if (!page) {
        return;
    }

    page
        .querySelectorAll("button, input, select, textarea")
        .forEach((element) => {
            if (element.dataset.keepEnabled === "true") {
                return;
            }

            if (state.busy) {
                if (!element.disabled) {
                    element.disabled = true;
                    element.dataset.disabledByBusy = "true";
                }
                return;
            }

            if (element.dataset.disabledByBusy === "true") {
                element.disabled = false;
                delete element.dataset.disabledByBusy;
            }
        });
}

function getErrorMessage(
    error,
    fallback = "The operation could not be completed."
) {
    return String(error?.message || "").trim() || fallback;
}

function handleError(context, error) {
    console.error(`[${MODULE_NAME}] ${context}:`, error);

    LearningResourceRenderer.setStatus(
        getErrorMessage(error),
        "error"
    );
}

function readFilters() {
    state.filters = {
        programCode:
            getElement("learning-resource-filter-program")?.value || "",

        status:
            getElement("learning-resource-filter-status")?.value || "",

        category:
            getElement("learning-resource-filter-category")?.value || "",

        resourceType:
            getElement("learning-resource-filter-type")?.value || "",

        search:
            getElement("learning-resource-filter-search")?.value || ""
    };

    return state.filters;
}

async function loadResources({
    preserveStatus = false
} = {}) {
    if (state.busy || !state.authorized) {
        return;
    }

    setBusy(true);

    if (!preserveStatus) {
        LearningResourceRenderer.clearStatus();
    }

    try {
        const [
            resources,
            summary
        ] = await Promise.all([
            LearningResourceService.listResources(
                readFilters()
            ),

            LearningResourceService.getSummary()
        ]);

        state.resources = [
            ...resources
        ];

        LearningResourceRenderer.renderSummary(
            summary
        );

        LearningResourceRenderer.renderResources(
            resources
        );
    }
    catch (error) {
        state.resources = [];

        LearningResourceRenderer.renderResources(
            []
        );

        handleError(
            "Resource loading failed",
            error
        );
    }
    finally {
        setBusy(false);
    }
}

function readResourceForm(form) {
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
                ) || 1
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
            getFieldValue(
                form,
                "external_url"
            ) || null,

        display_order:
            Number(
                getFieldValue(
                    form,
                    "display_order"
                ) || 10
            ),

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

async function handleFormSubmit(event) {
    event.preventDefault();

    if (state.busy || !state.authorized) {
        return;
    }

    const form =
        event.currentTarget;

    const mode =
        form.dataset.mode ||
        "create";

    const existingDocumentId =
        form.dataset.documentId ||
        "";

    const normalizedInput =
        LearningResourceContract.normalizeResourceInput(
            readResourceForm(
                form
            )
        );

    const validation =
        LearningResourceContract.validateDraft(
            normalizedInput
        );

    if (!validation.valid) {
        LearningResourceRenderer.setStatus(
            validation.errors.join(
                " "
            ),
            "error"
        );

        return;
    }

    setBusy(true);

    LearningResourceRenderer.setStatus(
        mode === "edit"
            ? "Saving learning-resource draft…"
            : "Creating learning-resource draft…",
        "info"
    );

    try { 
        let documentId =
            existingDocumentId;

        if (mode === "edit") {
            if (!documentId) {
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
                createdDraft.documentId;
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
                await LearningResourceStorage.uploadProtectedResource({
                    programCode:
                        normalizedInput.program_code,

                    resourceId:
                        normalizedInput.resource_id,

                    version:
                        normalizedInput.version,

                    file:
                        selectedFile
                });

            await LearningResourcePublisher.attachProtectedAsset(
                documentId,
                uploadResult
            );
        }

        LearningResourceRenderer.closeForm();

        LearningResourceRenderer.setStatus(
            mode === "edit"
                ? "Learning-resource draft updated."
                : "Learning-resource draft created.",
            "success"
        );
    }
    catch (error) {
        handleError(
            "Draft save failed",
            error
        );

        return;
    }
    finally {
        setBusy(false);
    }

    await loadResources({
        preserveStatus: true
    });
}

function handleCreateResource() {
    if (state.busy || !state.authorized) {
        return;
    }

    LearningResourceRenderer.clearStatus();

    LearningResourceRenderer.openForm({
        mode: "create"
    });
}

async function handleEditResource(
    documentId,
    focusFile = false
) {
    if (state.busy || !state.authorized) {
        return;
    }

    setBusy(true);

    try {
        const resource =
            await LearningResourceService.getResource(
                documentId
            );

        if (!resource) {
            throw new Error(
                "Learning-resource draft was not found."
            );
        }

        if (resource.status !== "draft") {
            throw new Error(
                "Only draft resources can be edited."
            );
        }

        LearningResourceRenderer.openForm({
            mode: "edit",
            resource
        });

        if (focusFile) {
            getFormField(
                getElement(
                    "learning-resource-form"
                ),
                "resource_file"
            )?.focus();
        }
    }
    catch (error) {
        handleError(
            "Unable to open resource",
            error
        );
    }
    finally {
        setBusy(false);
    }
}

async function handlePublishResource(
    documentId
) {
    if (state.busy || !state.authorized) {
        return;
    }

    const confirmed =
        window.confirm(
            "Publish this learning resource? " +
            "Its delivery asset will become immutable."
        );

    if (!confirmed) {
        return;
    }

    setBusy(true);

    LearningResourceRenderer.setStatus(
        "Publishing learning resource…",
        "info"
    );

    try {
        await LearningResourcePublisher.publishResource(
            documentId
        );

        LearningResourceRenderer.setStatus(
            "Learning resource published successfully.",
            "success"
        );
    }
    catch (error) {
        handleError(
            "Publication failed",
            error
        );

        return;
    }
    finally {
        setBusy(false);
    }

    await loadResources({
        preserveStatus: true
    });
}

async function handleWithdrawResource(
    documentId
) {
    if (state.busy || !state.authorized) {
        return;
    }

    const reason =
        window.prompt(
            "Enter the reason for withdrawing this resource:"
        );

    if (reason === null) {
        return;
    }

    const normalizedReason =
        String(
            reason
        ).trim();

    if (!normalizedReason) {
        LearningResourceRenderer.setStatus(
            "A withdrawal reason is required.",
            "error"
        );

        return;
    }

    const confirmed =
        window.confirm(
            "Withdraw this learning resource? " +
            "Learner delivery will be disabled."
        );

    if (!confirmed) {
        return;
    }

    setBusy(true);

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
    catch (error) {
        handleError(
            "Withdrawal failed",
            error
        );

        return;
    }
    finally {
        setBusy(false);
    }

    await loadResources({
        preserveStatus: true
    });
}

async function handleViewResource(
    documentId
) {
    if (state.busy || !state.authorized) {
        return;
    }

    setBusy(true);

    try {
        const resource =
            await LearningResourceService.getResource(
                documentId
            );

        if (!resource) {
            throw new Error(
                "Learning resource was not found."
            );
        }

        LearningResourceRenderer.setStatus(
            [
                resource.title,

                `${resource.programCode} · v${resource.version}`,

                `Status: ${resource.status}`,

                `Delivery: ${resource.deliveryType}`,

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
    catch (error) {
        handleError(
            "Unable to display details",
            error
        );
    }
    finally {
        setBusy(false);
    }
}

async function handleViewVersions(
    documentId
) {
    if (state.busy || !state.authorized) {
        return;
    }

    setBusy(true);

    try {
        const resource =
            await LearningResourceService.getResource(
                documentId
            );

        if (!resource) {
            throw new Error(
                "Learning resource was not found."
            );
        }

        const versions =
            await LearningResourceService.listVersions(
                resource.resourceId
            );

        LearningResourceRenderer.renderResources(
            versions
        );

        LearningResourceRenderer.setStatus(
            `Showing ${versions.length} version(s) for ${resource.title}.`,
            "info"
        );
    }
    catch (error) {
        handleError(
            "Version history failed",
            error
        );
    }
    finally {
        setBusy(false);
    }
}

async function handleResourceAction(event) {
    const button =
        event.target.closest(
            "[data-action]"
        );

    if (!button) {
        return;
    }

    const action =
        button.dataset.action ||
        "";

    const documentId =
        button.dataset.documentId ||
        "";

    if (!documentId) {
        return;
    }

    const handlers = {
        "view-resource":
            () => handleViewResource(
                documentId
            ),

        "edit-resource":
            () => handleEditResource(
                documentId
            ),

        "upload-resource":
            () => handleEditResource(
                documentId,
                true
            ),

        "publish-resource":
            () => handlePublishResource(
                documentId
            ),

        "withdraw-resource":
            () => handleWithdrawResource(
                documentId
            ),

        "view-versions":
            () => handleViewVersions(
                documentId
            )
    };

    await handlers[action]?.();
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
        () => loadResources()
    );

    getElement(
        "learning-resource-form-cancel"
    )?.addEventListener(
        "click",
        () => LearningResourceRenderer.closeForm()
    );

    getElement(
        "learning-resource-form-cancel-secondary"
    )?.addEventListener(
        "click",
        () => LearningResourceRenderer.closeForm()
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
                () => loadResources()
            );
        }
    );

    let searchTimer =
        null;

    getElement(
        "learning-resource-filter-search"
    )?.addEventListener(
        "input",
        () => {
            window.clearTimeout(
                searchTimer
            );

            searchTimer =
                window.setTimeout(
                    () => loadResources(),
                    250
                );
        }
    );
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
    catch (error) {
        state.authorized =
            false;

        handleError(
            "Authorization failed",
            error
        );
    }
}

async function initialize() {
    if (!state.initialized) {
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
        if (!user) {
            state.authorized =
                false;

            LearningResourceRenderer.setStatus(
                "Administrator authentication is required.",
                "error"
            );

            return;
        }

        await initialize();
    }
);

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