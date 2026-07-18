/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-renderer.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Admin Learning Resource Presentation

   Purpose
   ----------------------------------------------------------
   Renders governed learning-resource administration ViewModels.

   Responsibilities
   ----------------------------------------------------------
   ✓ Render resource summary
   ✓ Render resource cards
   ✓ Render lifecycle status
   ✓ Render safe administrative actions
   ✓ Render loading, success and error messages
   ✓ Render empty states
   ✓ Populate the resource form for editing
   ✓ Control presentation visibility

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Authentication
   ✗ Authorization
   ✗ Firestore operations
   ✗ Storage operations
   ✗ Publication decisions
   ✗ Entitlement resolution
   ✗ Business validation

   Governance
   ----------------------------------------------------------
   • Renderer consumes ViewModels only
   • Renderer makes no authorization decisions
   • Renderer never queries Firebase
   • Renderer never publishes or withdraws resources
   • Dynamic values are inserted through textContent
   • Action buttons expose intent through data attributes

========================================================== */


/* ==========================================================
   MODULE METADATA
========================================================== */

const MODULE_NAME =
    "LearningResourceRenderer";

const MODULE_VERSION =
    "1.0.0";


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

    initialized =
        true;

    return elements;

}


/* ==========================================================
   FORMATTERS
========================================================== */

function formatLabel(
    value
) {

    const normalizedValue =
        String(
            value || ""
        )
            .trim()
            .replace(
                /[_-]+/g,
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

    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];

    let size =
        bytes;

    let unitIndex =
        0;

    while (
        size >= 1024 &&
        unitIndex <
            units.length - 1
    ) {

        size /= 1024;
        unitIndex += 1;

    }

    return (
        `${size.toFixed(
            unitIndex === 0
                ? 0
                : 1
        )} ${units[unitIndex]}`
    );

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
            value
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
    disabled = false
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
        action;

    button.dataset.documentId =
        documentId;

    button.disabled =
        disabled;

    return button;

}


/* ==========================================================
   STATUS
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
        String(
            message || ""
        ).trim();

    elements.statusMessage.textContent =
        normalizedMessage;

    elements.statusMessage.className =
        "learning-resource-status";

    if (
        normalizedMessage
    ) {

        elements.statusMessage.classList.add(
            `learning-resource-status--${type}`
        );

        elements.statusMessage.hidden =
            false;

    }
    else {

        elements.statusMessage.hidden =
            true;

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

    if (
        elements.loadingState
    ) {

        elements.loadingState.hidden =
            !loading;

    }

    if (
        elements.resourceList
    ) {

        elements.resourceList.setAttribute(
            "aria-busy",
            loading
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

    elements.summary.append(

        createMetric(
            "Total Resources",
            summary.total || 0
        ),

        createMetric(
            "Drafts",
            summary.drafts || 0,
            "learning-resource-metric--draft"
        ),

        createMetric(
            "Published",
            summary.published || 0,
            "learning-resource-metric--published"
        ),

        createMetric(
            "Withdrawn",
            summary.withdrawn || 0,
            "learning-resource-metric--withdrawn"
        ),

        createMetric(
            "Programmes",
            summary.programmeCount || 0
        )

    );

}


/* ==========================================================
   RESOURCE STATUS
========================================================== */

function createStatusBadge(
    resource
) {

    const badge =
        createElement(
            "span",
            `learning-resource-badge learning-resource-badge--${resource.status}`,
            formatLabel(
                resource.status
            )
        );

    if (
        resource.isLatest
    ) {

        badge.title =
            "Latest resource version";

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
                        resource.documentId
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
        resource.documentId;

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
            resource.title
        );

    const identity =
        createElement(
            "p",
            "learning-resource-card__identity",
            `${resource.programCode} · ${resource.resourceId} · v${resource.version}`
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
            "File",
            resource.fileName ||
            "Not attached"
        ),

        createMetadataItem(
            "File size",
            formatFileSize(
                resource.fileSize
            )
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

    const policies = [
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
    ];

    policies.forEach(
        ([
            label,
            enabled
        ]) => {

            const policy =
                createElement(
                    "span",
                    enabled
                        ? "learning-resource-policy learning-resource-policy--enabled"
                        : "learning-resource-policy learning-resource-policy--disabled",
                    `${label}: ${enabled ? "Yes" : "No"}`
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
            ? resources
            : [];

    if (
        safeResources.length === 0
    ) {

        if (
            elements.emptyState
        ) {

            elements.emptyState.hidden =
                false;

        }

        return;

    }

    if (
        elements.emptyState
    ) {

        elements.emptyState.hidden =
            true;

    }

    const fragment =
        document.createDocumentFragment();

    safeResources.forEach(
        (
            resource
        ) => {

            if (
                resource &&
                resource.documentId
            ) {

                fragment.append(
                    createResourceCard(
                        resource
                    )
                );

            }

        }
    );

    elements.resourceList.append(
        fragment
    );

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

    elements.form.reset();

    elements.form.dataset.mode =
        mode;

    elements.form.dataset.documentId =
        resource?.documentId ||
        "";

    if (
        elements.formHeading
    ) {

        elements.formHeading.textContent =
            mode === "edit"
                ? "Edit Learning Resource Draft"
                : "Create Learning Resource Draft";

    }

    if (
        resource
    ) {

        const assignValue = (
            fieldName,
            value
        ) => {

            const field =
                elements.form.elements.namedItem(
                    fieldName
                );

            if (
                field
            ) {

                field.value =
                    value ??
                    "";

            }

        };

        const assignChecked = (
            fieldName,
            value
        ) => {

            const field =
                elements.form.elements.namedItem(
                    fieldName
                );

            if (
                field
            ) {

                field.checked =
                    value === true;

            }

        };

        assignValue(
            "program_code",
            resource.programCode
        );

        assignValue(
            "resource_id",
            resource.resourceId
        );

        assignValue(
            "version",
            resource.version
        );

        assignValue(
            "title",
            resource.title
        );

        assignValue(
            "description",
            resource.description
        );

        assignValue(
            "resource_type",
            resource.resourceType
        );

        assignValue(
            "category",
            resource.category
        );

        assignValue(
            "delivery_type",
            resource.deliveryType
        );

        assignValue(
            "external_url",
            resource.externalUrl
        );

        assignValue(
            "display_order",
            resource.displayOrder
        );

        assignChecked(
            "preview_allowed",
            resource.previewAllowed
        );

        assignChecked(
            "download_allowed",
            resource.downloadAllowed
        );

        assignChecked(
            "embed_allowed",
            resource.embedAllowed
        );

        const programCodeField =
            elements.form.elements.namedItem(
                "program_code"
            );

        const resourceIdField =
            elements.form.elements.namedItem(
                "resource_id"
            );

        const versionField =
            elements.form.elements.namedItem(
                "version"
            );

        if (
            mode === "edit"
        ) {

            if (
                programCodeField
            ) {

                programCodeField.disabled =
                    true;

            }

            if (
                resourceIdField
            ) {

                resourceIdField.disabled =
                    true;

            }

            if (
                versionField
            ) {

                versionField.disabled =
                    true;

            }

        }

    }

    elements.formPanel.hidden =
        false;

    elements.formPanel.scrollIntoView({
        behavior:
            "smooth",
        block:
            "start"
    });

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

    if (
        elements.form
    ) {

        elements.form.reset();
        elements.form.dataset.mode =
            "create";
        elements.form.dataset.documentId =
            "";

        Array
            .from(
                elements.form.elements
            )
            .forEach(
                (
                    field
                ) => {

                    if (
                        "disabled" in field
                    ) {

                        field.disabled =
                            false;

                    }

                }
            );

    }

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
        formatFileSize

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
    formatFileSize
};