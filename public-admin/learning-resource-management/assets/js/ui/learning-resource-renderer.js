/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-renderer.js
   Version   : 1.2.0
   Status    : ACTIVE
   Authority : Admin Portal

   Purpose
   ----------------------------------------------------------
   Renders governed learning-resource administration ViewModels.

   Responsibilities
   ----------------------------------------------------------
   • Render administrative summary metrics
   • Render governed learning-resource cards
   • Render lifecycle, release, and consumption indicators
   • Render administrative action controls
   • Render loading, success, information, and error messages
   • Render empty states
   • Populate the resource form for draft editing
   • Populate governed release-policy metadata
   • Reset form presentation safely between modes
   • Control presentation visibility and accessibility state

   Non-Responsibilities
   ----------------------------------------------------------
   • Authentication
   • Authorization
   • Firestore operations
   • Storage operations
   • Publication decisions
   • Entitlement resolution
   • Learner release-policy evaluation
   • Business validation

   Governance
   ----------------------------------------------------------
   • Renderer consumes ViewModels only
   • Renderer makes no authorization decisions
   • Renderer never queries Firebase
   • Renderer never publishes or withdraws resources
   • Renderer records no business decisions
   • Dynamic values are inserted through textContent
   • Action buttons expose intent through data attributes
   • Service and Publisher remain lifecycle authorities
   • Learning Resource Resolver remains learner-visibility authority
   • ADR-020 release metadata is presented but never evaluated here

   Change History
   ----------------------------------------------------------
   v1.2.0
   • Added release-policy form population
   • Added module and session metadata population
   • Added availability-window population
   • Added release-governance metadata to resource cards
   • Added safe datetime-local formatting
   • Added release-policy field presentation support
   • Preserved existing public renderer API

   v1.1.0
   • Added administrative summary metrics
   • Added governed resource cards
   • Added form editing and reset support
   • Added accessible status and loading states
========================================================== */


/* ==========================================================
   MODULE METADATA
========================================================== */

const MODULE_NAME =
    "LearningResourceRenderer";

const MODULE_VERSION =
    "1.2.0";

const ALLOWED_STATUS_TYPES =
    Object.freeze([
        "info",
        "success",
        "warning",
        "error"
    ]);

const MODULE_RELEASE_POLICIES =
    Object.freeze([
        "pre_module",
        "post_module"
    ]);

const SESSION_RELEASE_POLICIES =
    Object.freeze([
        "post_session"
    ]);


/* ==========================================================
   STATE
========================================================== */

let initialized =
    false;

let elements =
    null;


/* ==========================================================
   DOM INITIALIZATION
========================================================== */

function initialize() {

    if (
        initialized
    ) {

        return elements;

    }

    elements = {

        page:
            document.getElementById(
                "learning-resource-management"
            ),

        summary:
            document.getElementById(
                "learning-resource-summary"
            ),

        resourceList:
            document.getElementById(
                "learning-resource-list"
            ),

        emptyState:
            document.getElementById(
                "learning-resource-empty-state"
            ),

        statusMessage:
            document.getElementById(
                "learning-resource-status"
            ),

        loadingState:
            document.getElementById(
                "learning-resource-loading"
            ),

        formPanel:
            document.getElementById(
                "learning-resource-form-panel"
            ),

        form:
            document.getElementById(
                "learning-resource-form"
            ),

        formHeading:
            document.getElementById(
                "learning-resource-form-heading"
            )

    };

    if (
        elements.statusMessage
    ) {

        elements.statusMessage.setAttribute(
            "role",
            "status"
        );

        elements.statusMessage.setAttribute(
            "aria-live",
            "polite"
        );

        elements.statusMessage.setAttribute(
            "aria-atomic",
            "true"
        );

    }

    if (
        elements.loadingState
    ) {

        elements.loadingState.setAttribute(
            "role",
            "status"
        );

        elements.loadingState.setAttribute(
            "aria-live",
            "polite"
        );

    }

    if (
        elements.formPanel
    ) {

        elements.formPanel.setAttribute(
            "aria-hidden",
            elements.formPanel.hidden
                ? "true"
                : "false"
        );

    }

    bindReleasePolicyPresentation();

    initialized =
        true;

    return elements;

}


/* ==========================================================
   GENERAL HELPERS
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


function normalizeCount(
    value
) {

    const count =
        Number(
            value
        );

    if (
        !Number.isFinite(
            count
        ) ||
        count < 0
    ) {

        return 0;

    }

    return Math.trunc(
        count
    );

}


function normalizeNullablePositiveInteger(
    value
) {

    if (
        value ===
            null ||
        value ===
            undefined ||
        value ===
            ""
    ) {

        return null;

    }

    const normalizedValue =
        Number(
            value
        );

    if (
        !Number.isInteger(
            normalizedValue
        ) ||
        normalizedValue < 1
    ) {

        return null;

    }

    return normalizedValue;

}


function getFormField(
    fieldName
) {

    initialize();

    return (
        elements.form?.elements?.namedItem(
            fieldName
        ) ||
        null
    );

}


function setFieldValue(
    fieldName,
    value
) {

    const field =
        getFormField(
            fieldName
        );

    if (
        !field
    ) {

        return;

    }

    field.value =
        value ?? "";

}


function setFieldChecked(
    fieldName,
    checked
) {

    const field =
        getFormField(
            fieldName
        );

    if (
        !field
    ) {

        return;

    }

    field.checked =
        checked === true;

}


function setFieldDisabled(
    fieldName,
    disabled
) {

    const field =
        getFormField(
            fieldName
        );

    if (
        !field
    ) {

        return;

    }

    field.disabled =
        disabled === true;

}


function setFieldRequired(
    fieldName,
    required
) {

    const field =
        getFormField(
            fieldName
        );

    if (
        !field
    ) {

        return;

    }

    field.required =
        required === true;

}


/* ==========================================================
   FORMATTERS
========================================================== */

function formatLabel(
    value
) {

    const normalizedValue =
        normalizeText(
            value
        )
            .replace(
                /[_-]+/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            );

    if (
        !normalizedValue
    ) {

        return "Not specified";

    }

    return normalizedValue.replace(
        /\b\w/g,
        (
            character
        ) => character.toUpperCase()
    );

}


function formatDate(
    value
) {

    if (
        !value
    ) {

        return "Not available";

    }

    try {

        const date =
            new Date(
                value
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Not available";

        }

        return new Intl.DateTimeFormat(
            "en-IN",
            {
                dateStyle:
                    "medium",

                timeStyle:
                    "short",

                timeZone:
                    "Asia/Kolkata"
            }
        ).format(
            date
        );

    }
    catch (
        error
    ) {

        return "Not available";

    }

}


function formatDateTimeLocal(
    value
) {

    if (
        !value
    ) {

        return "";

    }

    try {

        const date =
            new Date(
                value
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }

        const formatter =
            new Intl.DateTimeFormat(
                "en-CA",
                {
                    timeZone:
                        "Asia/Kolkata",

                    year:
                        "numeric",

                    month:
                        "2-digit",

                    day:
                        "2-digit",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    hourCycle:
                        "h23"
                }
            );

        const parts =
            formatter.formatToParts(
                date
            );

        const partMap =
            Object.fromEntries(
                parts.map(
                    (
                        part
                    ) => [
                        part.type,
                        part.value
                    ]
                )
            );

        if (
            !partMap.year ||
            !partMap.month ||
            !partMap.day ||
            !partMap.hour ||
            !partMap.minute
        ) {

            return "";

        }

        return (
            `${partMap.year}-${partMap.month}-${partMap.day}` +
            `T${partMap.hour}:${partMap.minute}`
        );

    }
    catch (
        error
    ) {

        return "";

    }

}


function formatFileSize(
    value
) {

    const bytes =
        Number(
            value
        );

    if (
        !Number.isFinite(
            bytes
        ) ||
        bytes <= 0
    ) {

        return "Not available";

    }

    const units =
        Object.freeze([
            "B",
            "KB",
            "MB",
            "GB"
        ]);

    let size =
        bytes;

    let unitIndex =
        0;

    while (
        size >= 1024 &&
        unitIndex <
            units.length - 1
    ) {

        size /=
            1024;

        unitIndex +=
            1;

    }

    return (
        `${size.toFixed(
            unitIndex === 0
                ? 0
                : 1
        )} ${units[unitIndex]}`
    );

}


function formatReleaseTarget(
    resource
) {

    const moduleNumber =
        normalizeNullablePositiveInteger(
            resource?.moduleNumber
        );

    const sessionNumber =
        normalizeNullablePositiveInteger(
            resource?.sessionNumber
        );

    if (
        moduleNumber &&
        sessionNumber
    ) {

        return (
            `Module ${moduleNumber}, Session ${sessionNumber}`
        );

    }

    if (
        moduleNumber
    ) {

        return (
            `Module ${moduleNumber}`
        );

    }

    if (
        sessionNumber
    ) {

        return (
            `Session ${sessionNumber}`
        );

    }

    return "Not specified";

}


/* ==========================================================
   RELEASE POLICY PRESENTATION
========================================================== */

function updateReleasePolicyPresentation() {

    initialize();

    const releasePolicyField =
        getFormField(
            "release_policy"
        );

    const releasePolicy =
        normalizeLowercase(
            releasePolicyField?.value
        );

    const requiresModule =
        MODULE_RELEASE_POLICIES.includes(
            releasePolicy
        );

    const requiresSession =
        SESSION_RELEASE_POLICIES.includes(
            releasePolicy
        );

    setFieldRequired(
        "module_number",
        requiresModule
    );

    setFieldRequired(
        "session_number",
        requiresSession
    );

}


function bindReleasePolicyPresentation() {

    const releasePolicyField =
        elements?.form?.elements?.namedItem(
            "release_policy"
        );

    if (
        !releasePolicyField ||
        releasePolicyField.dataset.rendererBound ===
            "true"
    ) {

        return;

    }

    releasePolicyField.addEventListener(
        "change",
        updateReleasePolicyPresentation
    );

    releasePolicyField.dataset.rendererBound =
        "true";

}


/* ==========================================================
   ELEMENT FACTORIES
========================================================== */

function createElement(
    tagName,
    className = "",
    text = ""
) {

    const element =
        document.createElement(
            tagName
        );

    if (
        className
    ) {

        element.className =
            className;

    }

    if (
        text !== "" &&
        text !== null &&
        text !== undefined
    ) {

        element.textContent =
            String(
                text
            );

    }

    return element;

}


function createMetric(
    label,
    value,
    modifier = ""
) {

    const metric =
        createElement(
            "article",
            `learning-resource-metric ${modifier}`.trim()
        );

    const metricValue =
        createElement(
            "strong",
            "learning-resource-metric__value",
            normalizeCount(
                value
            )
        );

    const metricLabel =
        createElement(
            "span",
            "learning-resource-metric__label",
            label
        );

    metric.append(
        metricValue,
        metricLabel
    );

    return metric;

}


function createMetadataItem(
    label,
    value
) {

    const item =
        createElement(
            "div",
            "learning-resource-card__metadata-item"
        );

    const term =
        createElement(
            "dt",
            "learning-resource-card__metadata-label",
            label
        );

    const description =
        createElement(
            "dd",
            "learning-resource-card__metadata-value",
            value
        );

    item.append(
        term,
        description
    );

    return item;

}


function createActionButton({
    label,
    action,
    documentId,
    style = "secondary",
    disabled = false,
    title = ""
}) {

    const button =
        createElement(
            "button",
            `learning-resource-action learning-resource-action--${style}`,
            label
        );

    button.type =
        "button";

    button.dataset.action =
        normalizeText(
            action
        );

    button.dataset.documentId =
        normalizeText(
            documentId
        );

    button.disabled =
        disabled === true;

    if (
        title
    ) {

        button.title =
            title;

    }

    return button;

}


/* ==========================================================
   STATUS PRESENTATION
========================================================== */

function setStatus(
    message,
    type = "info"
) {

    initialize();

    if (
        !elements.statusMessage
    ) {

        return;

    }

    const normalizedMessage =
        normalizeText(
            message
        );

    const normalizedType =
        ALLOWED_STATUS_TYPES.includes(
            type
        )
            ? type
            : "info";

    elements.statusMessage.textContent =
        normalizedMessage;

    elements.statusMessage.className =
        "learning-resource-status";

    if (
        normalizedMessage
    ) {

        elements.statusMessage.classList.add(
            `learning-resource-status--${normalizedType}`
        );

        elements.statusMessage.hidden =
            false;

        elements.statusMessage.setAttribute(
            "aria-hidden",
            "false"
        );

    }
    else {

        elements.statusMessage.hidden =
            true;

        elements.statusMessage.setAttribute(
            "aria-hidden",
            "true"
        );

    }

}


function clearStatus() {

    setStatus(
        ""
    );

}


function setLoading(
    loading
) {

    initialize();

    const normalizedLoading =
        loading === true;

    if (
        elements.loadingState
    ) {

        elements.loadingState.hidden =
            !normalizedLoading;

        elements.loadingState.setAttribute(
            "aria-hidden",
            normalizedLoading
                ? "false"
                : "true"
        );

    }

    if (
        elements.resourceList
    ) {

        elements.resourceList.setAttribute(
            "aria-busy",
            normalizedLoading
                ? "true"
                : "false"
        );

    }

    if (
        elements.page
    ) {

        elements.page.setAttribute(
            "aria-busy",
            normalizedLoading
                ? "true"
                : "false"
        );

    }

}


/* ==========================================================
   SUMMARY
========================================================== */

function renderSummary(
    summary = {}
) {

    initialize();

    if (
        !elements.summary
    ) {

        return;

    }

    elements.summary.replaceChildren();

    const fragment =
        document.createDocumentFragment();

    fragment.append(

        createMetric(
            "Total Resources",
            summary.total
        ),

        createMetric(
            "Drafts",
            summary.drafts,
            "learning-resource-metric--draft"
        ),

        createMetric(
            "Published",
            summary.published,
            "learning-resource-metric--published"
        ),

        createMetric(
            "Withdrawn",
            summary.withdrawn,
            "learning-resource-metric--withdrawn"
        ),

        createMetric(
            "Programmes",
            summary.programmeCount
        )

    );

    elements.summary.append(
        fragment
    );

}


/* ==========================================================
   RESOURCE STATUS
========================================================== */

function createStatusBadge(
    resource
) {

    const normalizedStatus =
        normalizeLowercase(
            resource.status
        );

    const safeStatus =
        [
            "draft",
            "published",
            "withdrawn"
        ].includes(
            normalizedStatus
        )
            ? normalizedStatus
            : "unknown";

    const badge =
        createElement(
            "span",
            `learning-resource-badge learning-resource-badge--${safeStatus}`,
            formatLabel(
                normalizedStatus
            )
        );

    if (
        resource.isLatest === true &&
        normalizedStatus ===
            "published"
    ) {

        badge.title =
            "Latest published resource version";

        badge.setAttribute(
            "aria-label",
            `${formatLabel(
                normalizedStatus
            )}, latest published version`
        );

    }

    return badge;

}


/* ==========================================================
   RESOURCE ACTIONS
========================================================== */

function createResourceActions(
    resource
) {

    const actions =
        createElement(
            "div",
            "learning-resource-card__actions"
        );

    actions.append(
        createActionButton({
            label:
                "View details",

            action:
                "view-resource",

            documentId:
                resource.documentId
        })
    );

    if (
        resource.status ===
        "draft"
    ) {

        actions.append(
            createActionButton({
                label:
                    "Edit draft",

                action:
                    "edit-resource",

                documentId:
                    resource.documentId
            })
        );

        if (
            resource.deliveryType ===
                "protected_storage" &&
            !resource.storagePath
        ) {

            actions.append(
                createActionButton({
                    label:
                        "Upload file",

                    action:
                        "upload-resource",

                    documentId:
                        resource.documentId,

                    title:
                        "Attach the protected file required for publication."
                })
            );

        }

        actions.append(
            createActionButton({
                label:
                    "Publish",

                action:
                    "publish-resource",

                documentId:
                    resource.documentId,

                style:
                    "primary"
            })
        );

    }

    if (
        resource.status ===
        "published"
    ) {

        actions.append(
            createActionButton({
                label:
                    "Withdraw",

                action:
                    "withdraw-resource",

                documentId:
                    resource.documentId,

                style:
                    "danger"
            })
        );

    }

    actions.append(
        createActionButton({
            label:
                "Version history",

            action:
                "view-versions",

            documentId:
                resource.documentId
        })
    );

    return actions;

}


/* ==========================================================
   RESOURCE CARD
========================================================== */

function createResourceCard(
    resource
) {

    const card =
        createElement(
            "article",
            "learning-resource-card"
        );

    card.dataset.documentId =
        normalizeText(
            resource.documentId
        );

    const header =
        createElement(
            "header",
            "learning-resource-card__header"
        );

    const headingGroup =
        createElement(
            "div",
            "learning-resource-card__heading"
        );

    const title =
        createElement(
            "h3",
            "learning-resource-card__title",
            resource.title ||
            "Untitled resource"
        );

    const identity =
        createElement(
            "p",
            "learning-resource-card__identity",
            `${
                resource.programCode ||
                "No programme"
            } · ${
                resource.resourceId ||
                "No resource ID"
            } · v${
                resource.version ||
                1
            }`
        );

    headingGroup.append(
        title,
        identity
    );

    header.append(
        headingGroup,
        createStatusBadge(
            resource
        )
    );

    const description =
        createElement(
            "p",
            "learning-resource-card__description",
            resource.description ||
            "No description provided."
        );

    const metadata =
        createElement(
            "dl",
            "learning-resource-card__metadata"
        );

    metadata.append(

        createMetadataItem(
            "Category",
            formatLabel(
                resource.category
            )
        ),

        createMetadataItem(
            "Type",
            formatLabel(
                resource.resourceType
            )
        ),

        createMetadataItem(
            "Delivery",
            formatLabel(
                resource.deliveryType
            )
        ),

        createMetadataItem(
            "Release",
            formatLabel(
                resource.releasePolicy
            )
        ),

        createMetadataItem(
            "Release target",
            formatReleaseTarget(
                resource
            )
        ),

        createMetadataItem(
            "Available from",
            formatDate(
                resource.availableFrom
            )
        ),

        createMetadataItem(
            "Available until",
            formatDate(
                resource.availableUntil
            )
        ),

        createMetadataItem(
            "File",
            resource.fileName ||
            (
                resource.deliveryType ===
                    "protected_storage"
                    ? "Not attached"
                    : "Not applicable"
            )
        ),

        createMetadataItem(
            "File size",
            resource.deliveryType ===
                "protected_storage"
                ? formatFileSize(
                    resource.fileSize
                )
                : "Not applicable"
        ),

        createMetadataItem(
            "Updated",
            formatDate(
                resource.updatedAt
            )
        )

    );

    const policyList =
        createElement(
            "div",
            "learning-resource-card__policies"
        );

    const policies =
        Object.freeze([
            [
                "Preview",
                resource.previewAllowed
            ],
            [
                "Download",
                resource.downloadAllowed
            ],
            [
                "Embed",
                resource.embedAllowed
            ],
            [
                "Latest",
                resource.isLatest
            ]
        ]);

    policies.forEach(
        ([
            label,
            enabled
        ]) => {

            const policyEnabled =
                enabled === true;

            const policy =
                createElement(
                    "span",
                    policyEnabled
                        ? "learning-resource-policy learning-resource-policy--enabled"
                        : "learning-resource-policy learning-resource-policy--disabled",
                    `${label}: ${policyEnabled ? "Yes" : "No"}`
                );

            policyList.append(
                policy
            );

        }
    );

    card.append(
        header,
        description,
        metadata,
        policyList,
        createResourceActions(
            resource
        )
    );

    return card;

}


/* ==========================================================
   RESOURCE LIST
========================================================== */

function isRenderableResource(
    resource
) {

    return Boolean(
        resource &&
        typeof resource ===
            "object" &&
        normalizeText(
            resource.documentId
        ) &&
        normalizeText(
            resource.resourceId
        ) &&
        normalizeText(
            resource.programCode
        )
    );

}


function renderResources(
    resources = []
) {

    initialize();

    if (
        !elements.resourceList
    ) {

        return;

    }

    elements.resourceList.replaceChildren();

    const safeResources =
        Array.isArray(
            resources
        )
            ? resources.filter(
                isRenderableResource
            )
            : [];

    if (
        safeResources.length ===
            0
    ) {

        if (
            elements.emptyState
        ) {

            elements.emptyState.hidden =
                false;

            elements.emptyState.setAttribute(
                "aria-hidden",
                "false"
            );

        }

        return;

    }

    if (
        elements.emptyState
    ) {

        elements.emptyState.hidden =
            true;

        elements.emptyState.setAttribute(
            "aria-hidden",
            "true"
        );

    }

    const fragment =
        document.createDocumentFragment();

    safeResources.forEach(
        (
            resource
        ) => {

            fragment.append(
                createResourceCard(
                    resource
                )
            );

        }
    );

    elements.resourceList.append(
        fragment
    );

}


/* ==========================================================
   FORM RESET
========================================================== */

function resetFormPresentation() {

    initialize();

    if (
        !elements.form
    ) {

        return;

    }

    elements.form.reset();

    elements.form.dataset.mode =
        "create";

    elements.form.dataset.documentId =
        "";

    setFieldDisabled(
        "program_code",
        false
    );

    setFieldDisabled(
        "resource_id",
        false
    );

    setFieldDisabled(
        "version",
        false
    );

    setFieldRequired(
        "module_number",
        false
    );

    setFieldRequired(
        "session_number",
        false
    );

    setFieldValue(
        "release_policy",
        ""
    );

    setFieldValue(
        "module_number",
        ""
    );

    setFieldValue(
        "session_number",
        ""
    );

    setFieldValue(
        "available_from",
        ""
    );

    setFieldValue(
        "available_until",
        ""
    );

    const fileField =
        getFormField(
            "resource_file"
        );

    if (
        fileField &&
        "value" in fileField
    ) {

        try {

            fileField.value =
                "";

        }
        catch (
            error
        ) {

            /*
             * Browser security may prevent programmatic file-value
             * changes in some environments. form.reset() remains the
             * authoritative fallback.
             */

        }

    }

}


/* ==========================================================
   FORM PRESENTATION
========================================================== */

function openForm({
    mode = "create",
    resource = null
} = {}) {

    initialize();

    if (
        !elements.formPanel ||
        !elements.form
    ) {

        return;

    }

    resetFormPresentation();

    const normalizedMode =
        mode ===
            "edit" &&
        resource
            ? "edit"
            : "create";

    elements.form.dataset.mode =
        normalizedMode;

    elements.form.dataset.documentId =
        normalizedMode ===
            "edit"
            ? normalizeText(
                resource.documentId
            )
            : "";

    if (
        elements.formHeading
    ) {

        elements.formHeading.textContent =
            normalizedMode ===
                "edit"
                ? "Edit Learning Resource Draft"
                : "Create Learning Resource Draft";

    }

    if (
        normalizedMode ===
            "edit"
    ) {

        setFieldValue(
            "program_code",
            resource.programCode
        );

        setFieldValue(
            "resource_id",
            resource.resourceId
        );

        setFieldValue(
            "version",
            resource.version
        );

        setFieldValue(
            "title",
            resource.title
        );

        setFieldValue(
            "description",
            resource.description
        );

        setFieldValue(
            "resource_type",
            resource.resourceType
        );

        setFieldValue(
            "category",
            resource.category
        );

        setFieldValue(
            "delivery_type",
            resource.deliveryType
        );

        setFieldValue(
            "external_url",
            resource.externalUrl
        );

        setFieldValue(
            "display_order",
            resource.displayOrder
        );

        setFieldValue(
            "release_policy",
            resource.releasePolicy
        );

        setFieldValue(
            "module_number",
            resource.moduleNumber
        );

        setFieldValue(
            "session_number",
            resource.sessionNumber
        );

        setFieldValue(
            "available_from",
            formatDateTimeLocal(
                resource.availableFrom
            )
        );

        setFieldValue(
            "available_until",
            formatDateTimeLocal(
                resource.availableUntil
            )
        );

        setFieldChecked(
            "preview_allowed",
            resource.previewAllowed
        );

        setFieldChecked(
            "download_allowed",
            resource.downloadAllowed
        );

        setFieldChecked(
            "embed_allowed",
            resource.embedAllowed
        );

        setFieldDisabled(
            "program_code",
            true
        );

        setFieldDisabled(
            "resource_id",
            true
        );

        setFieldDisabled(
            "version",
            true
        );

    }

    updateReleasePolicyPresentation();

    elements.formPanel.hidden =
        false;

    elements.formPanel.setAttribute(
        "aria-hidden",
        "false"
    );

    elements.formPanel.scrollIntoView({
        behavior:
            "smooth",

        block:
            "start"
    });

    window.requestAnimationFrame(
        () => {

            const firstEditableField =
                Array
                    .from(
                        elements.form.elements
                    )
                    .find(
                        (
                            field
                        ) => (
                            field &&
                            !field.disabled &&
                            field.type !==
                                "hidden" &&
                            typeof field.focus ===
                                "function"
                        )
                    );

            firstEditableField?.focus();

        }
    );

}


function closeForm() {

    initialize();

    if (
        !elements.formPanel
    ) {

        return;

    }

    elements.formPanel.hidden =
        true;

    elements.formPanel.setAttribute(
        "aria-hidden",
        "true"
    );

    resetFormPresentation();

}


/* ==========================================================
   PUBLIC API
========================================================== */

const LearningResourceRenderer =
    Object.freeze({

        moduleName:
            MODULE_NAME,

        version:
            MODULE_VERSION,

        initialize,

        setStatus,

        clearStatus,

        setLoading,

        renderSummary,

        renderResources,

        openForm,

        closeForm,

        formatLabel,

        formatDate,

        formatDateTimeLocal,

        formatFileSize,

        updateReleasePolicyPresentation

    });


window.LearningResourceRenderer =
    LearningResourceRenderer;


console.info(
    `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
);


export {

    LearningResourceRenderer,

    initialize,

    setStatus,

    clearStatus,

    setLoading,

    renderSummary,

    renderResources,

    openForm,

    closeForm,

    formatLabel,

    formatDate,

    formatDateTimeLocal,

    formatFileSize,

    updateReleasePolicyPresentation

};