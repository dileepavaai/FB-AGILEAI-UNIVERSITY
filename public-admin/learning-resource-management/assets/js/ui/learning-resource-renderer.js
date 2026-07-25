/* ==========================================================
   Agile AI University
   Admin Learning Resource Management

   File      : learning-resource-renderer.js
   Version   : 1.5.0
   Status    : ACTIVE
   Authority : Admin Portal

   Purpose
   ----------------------------------------------------------
   Renders governed learning-resource administration ViewModels
   and the permanent, version-specific Licensed Course Material
   assignment experience.

   Responsibilities
   ----------------------------------------------------------
   • Render administrative summary metrics
   • Render governed learning-resource cards
   • Render lifecycle, release, and consumption indicators
   • Render administrative action controls
   • Render loading, success, information, and error messages
   • Render empty states
   • Populate the resource form for draft and uploaded-metadata
     editing
   • Populate governed release-policy metadata
   • Reset form presentation safely between modes
   • Render Licensed Course Material assignment controls
   • Populate selected published-resource assignment metadata
   • Present permanent ownership and fixed-version governance
   • Control presentation visibility and accessibility state

   Non-Responsibilities
   ----------------------------------------------------------
   • Authentication
   • Authorization
   • Firestore operations
   • Storage operations
   • Publication decisions
   • Assignment persistence
   • Entitlement resolution
   • Learner release-policy evaluation
   • Automatic version upgrades
   • Business validation

   Governance
   ----------------------------------------------------------
   • Renderer consumes ViewModels only
   • Renderer makes no authorization decisions
   • Renderer never queries Firebase
   • Renderer never publishes or withdraws resources
   • Renderer never creates assignment records directly
   • Renderer records no business decisions
   • Dynamic values are inserted through textContent
   • Action buttons expose intent through data attributes
   • Service and Publisher remain lifecycle authorities
   • Learner Resource Assignment Service remains assignment
     authority
   • Learning Resource Resolver remains learner-visibility
     authority
   • ADR-020 release metadata is presented but never evaluated
     here
   • ADR-021 permanent ownership is presented but never resolved
     here
   • ADR-022 immutable assignment rules are presented but never
     enforced here
   • Existing DOM IDs, form field names, dataset properties,
     event actions, and public APIs remain backward compatible

   Related ADRs
   ----------------------------------------------------------
   • ADR-019 Protected Learning Resource Delivery
   • ADR-020 Governed Learning Resource Release
   • ADR-021 Licensed Course Material Entitlement Model
   • ADR-022 Immutable Learner Assignment

   Change History
   ----------------------------------------------------------
   v1.5.0
   • Adopted Licensed Course Material assignment terminology
   • Added permanent ownership presentation governance
   • Added fixed-version assignment presentation governance
   • Added ADR-021 and ADR-022 alignment
   • Hardened assignment-form field presentation
   • Preserved existing DOM contracts
   • Preserved existing controller event contracts
   • Preserved renderer APIs for backward compatibility

   v1.4.1
   • Synchronized panel hidden attributes and hidden CSS classes
   • Fixed resource form visibility for create and edit workflows
   • Fixed learner-resource assignment panel visibility
   • Preserved accessible aria-hidden state management
   • Preserved all governed lifecycle and rendering behaviour

   v1.4.0
   • Added uploaded lifecycle status presentation
   • Added uploaded-resource administrative summary metric
   • Added uploaded-resource metadata editing action
   • Added uploaded-resource publication action
   • Added archived lifecycle badge support
   • Added lifecycle-aware resource form headings
   • Added safe form lifecycle-state reset
   • Preserved publisher and service lifecycle authority

   v1.3.0
   • Added published-resource learner-assignment action
   • Added governed learner-resource access panel rendering
   • Added existing-alumni pending-activation defaults
   • Added activated-learner identity-state presentation
   • Added assignment release-policy presentation controls
   • Added safe assignment-form reset, open and close APIs
   • Preserved existing resource renderer APIs and behaviour

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
    "1.5.0";

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
            ),

        /*
         * Existing access-based DOM IDs are preserved for
         * compatibility. The business concept presented by
         * these elements is a Licensed Course Material
         * Assignment.
         */
        accessPanel:
            document.getElementById(
                "learner-resource-access-panel"
            ),

        accessForm:
            document.getElementById(
                "learner-resource-access-form"
            ),

        accessHeading:
            document.getElementById(
                "learner-resource-access-heading"
            ),

        accessResourceSummary:
            document.getElementById(
                "learner-resource-access-resource-summary"
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

    if (
        elements.accessPanel
    ) {

        elements.accessPanel.setAttribute(
            "aria-hidden",
            elements.accessPanel.hidden
                ? "true"
                : "false"
        );

    }

    bindReleasePolicyPresentation();

    bindAccessPresentation();

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


/*
 * These helper names retain "Access" to preserve the existing
 * HTML and controller contracts.
 */
function getAccessFormField(
    fieldName
) {

    initialize();

    return (
        elements.accessForm?.elements?.namedItem(
            fieldName
        ) ||
        null
    );

}


function setAccessFieldValue(
    fieldName,
    value
) {

    const field =
        getAccessFormField(
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


function setAccessFieldChecked(
    fieldName,
    checked
) {

    const field =
        getAccessFormField(
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


function setAccessFieldRequired(
    fieldName,
    required
) {

    const field =
        getAccessFormField(
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

        unitIndex++;

    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;

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

        return `Module ${moduleNumber}, Session ${sessionNumber}`;

    }

    if (
        moduleNumber
    ) {

        return `Module ${moduleNumber}`;

    }

    if (
        sessionNumber
    ) {

        return `Session ${sessionNumber}`;

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
   LICENSED COURSE MATERIAL ASSIGNMENT PRESENTATION
========================================================== */

/*
 * Existing function names and form-field names retain the
 * word "Access" for backward compatibility with the current
 * HTML and controller contracts.
 *
 * The administrator-facing business terminology is
 * Licensed Course Material Assignment.
 */
function updateAccessPresentation() {

    initialize();

    if (
        !elements.accessForm
    ) {

        return;

    }

    const learnerUidField =
        getAccessFormField(
            "learner_uid"
        );

    const identitySourceField =
        getAccessFormField(
            "identity_source"
        );

    const identityStatusField =
        getAccessFormField(
            "identity_status"
        );

    const accessStatusField =
        getAccessFormField(
            "access_status"
        );

    const releasePolicyField =
        getAccessFormField(
            "release_policy"
        );

    const credentialIdField =
        getAccessFormField(
            "credential_id"
        );

    const learnerUid =
        normalizeText(
            learnerUidField?.value
        );

    /*
     * Authenticated learner
     * ------------------------------------------------------
     * learner_uid is already available and is the canonical
     * identity anchor for the assignment.
     */
    if (
        learnerUid
    ) {

        if (
            identitySourceField
        ) {

            identitySourceField.value =
                "authenticated_identity";

        }

        if (
            identityStatusField
        ) {

            identityStatusField.value =
                "activated";

        }

        if (
            accessStatusField
        ) {

            accessStatusField.value =
                "active";

        }

        if (
            releasePolicyField &&
            !releasePolicyField.value
        ) {

            releasePolicyField.value =
                "immediate";

        }

        if (
            credentialIdField
        ) {

            credentialIdField.required =
                false;

        }

        return;

    }

    /*
     * Pre-authentication learner
     * ------------------------------------------------------
     * The assignment is pre-staged using verified email and
     * Credential ID. learner_uid binding remains the authority
     * of the backend first-login identity activation workflow.
     */
    if (
        identitySourceField
    ) {

        identitySourceField.value =
            "historical_credential";

    }

    if (
        identityStatusField
    ) {

        identityStatusField.value =
            "pending_activation";

    }

    if (
        accessStatusField
    ) {

        accessStatusField.value =
            "pending_activation";

    }

    if (
        releasePolicyField &&
        (
            !releasePolicyField.value ||
            releasePolicyField.value ===
                "immediate"
        )
    ) {

        releasePolicyField.value =
            "on_activation";

    }

    if (
        credentialIdField
    ) {

        credentialIdField.required =
            true;

    }

}


function bindAccessPresentation() {

    const learnerUidField =
        elements?.accessForm?.elements?.namedItem(
            "learner_uid"
        );

    const identitySourceField =
        elements?.accessForm?.elements?.namedItem(
            "identity_source"
        );

    const releasePolicyField =
        elements?.accessForm?.elements?.namedItem(
            "release_policy"
        );

    [
        learnerUidField,
        identitySourceField,
        releasePolicyField
    ].forEach(
        (
            field
        ) => {

            if (
                !field ||
                field.dataset.rendererBound ===
                    "true"
            ) {

                return;

            }

            field.addEventListener(
                field ===
                    learnerUidField
                    ? "input"
                    : "change",
                updateAccessPresentation
            );

            field.dataset.rendererBound =
                "true";

        }
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
            "Uploaded",
            summary.uploaded,
            "learning-resource-metric--uploaded"
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
            resource?.status
        );

    const safeStatus =
        [
            "draft",
            "uploaded",
            "published",
            "withdrawn",
            "archived"
        ].includes(
            normalizedStatus
        )
            ? normalizedStatus
            : "unknown";

    const displayLabel =
        normalizedStatus
            ? formatLabel(
                normalizedStatus
            )
            : "Unknown";

    const badge =
        createElement(
            "span",
            `learning-resource-badge learning-resource-badge--${safeStatus}`,
            displayLabel
        );

    if (
        resource?.isLatest === true &&
        normalizedStatus ===
            "published"
    ) {

        badge.title =
            "Latest published resource version";

        badge.setAttribute(
            "aria-label",
            `${displayLabel}, latest published version`
        );

    }
    else {

        badge.setAttribute(
            "aria-label",
            displayLabel
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

    const status =
        normalizeLowercase(
            resource?.status
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

    /*
     * ------------------------------------------------------
     * Draft
     * ------------------------------------------------------
     * Drafts may be edited.
     * Protected resources without an uploaded file may upload.
     * Publication remains governed by the Publisher.
     */
    if (
        status ===
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

    /*
     * ------------------------------------------------------
     * Uploaded
     * ------------------------------------------------------
     * The protected file is already uploaded.
     * Metadata may still be edited before publication.
     */
    if (
        status ===
            "uploaded"
    ) {

        actions.append(
            createActionButton({
                label:
                    "Edit metadata",

                action:
                    "edit-resource",

                documentId:
                    resource.documentId
            })
        );

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

    /*
     * ------------------------------------------------------
     * Published
     * ------------------------------------------------------
     * The existing action name "assign-resource" is retained
     * for controller compatibility.
     *
     * For Licensed Course Material, the resulting assignment
     * is permanent and bound to the selected resource version.
     * The renderer presents this intent but does not enforce it.
     */
    if (
        status ===
            "published"
    ) {

        actions.append(
            createActionButton({
                label:
                    "Assign Licensed Material",

                action:
                    "assign-resource",

                documentId:
                    resource.documentId,

                style:
                    "primary",

                title:
                    "Create a permanent, version-specific Licensed Course Material assignment for an alumnus or learner."
            })
        );

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
                enabled ===
                    true;

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

    elements.form.dataset.resourceStatus =
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

    setFieldDisabled(
        "delivery_type",
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
             * Browser security may prevent programmatic changes
             * to file-input values. form.reset() remains the
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

    const resourceStatus =
        normalizedMode ===
            "edit"
            ? normalizeLowercase(
                resource?.status
            )
            : "";

    elements.form.dataset.mode =
        normalizedMode;

    elements.form.dataset.documentId =
        normalizedMode ===
            "edit"
            ? normalizeText(
                resource.documentId
            )
            : "";

    elements.form.dataset.resourceStatus =
        resourceStatus;

    if (
        elements.formHeading
    ) {

        if (
            normalizedMode ===
                "create"
        ) {

            elements.formHeading.textContent =
                "Create Learning Resource Draft";

        }
        else if (
            resourceStatus ===
                "uploaded"
        ) {

            elements.formHeading.textContent =
                "Edit Uploaded Learning Resource Metadata";

        }
        else {

            elements.formHeading.textContent =
                "Edit Learning Resource Draft";

        }

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

        /*
         * Resource identity and version remain immutable while
         * editing an existing draft or uploaded resource.
         */
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

    elements.formPanel.classList.remove(
        "hidden"
    );

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

    elements.formPanel.classList.add(
        "hidden"
    );

    elements.formPanel.setAttribute(
        "aria-hidden",
        "true"
    );

    resetFormPresentation();

}


/* ==========================================================
   LICENSED COURSE MATERIAL ASSIGNMENT FORM RESET
========================================================== */

/*
 * Existing function and field names retain "Access" for
 * compatibility with the existing HTML and controller.
 */
function resetAccessFormPresentation() {

    initialize();

    if (
        !elements.accessForm
    ) {

        return;

    }

    elements.accessForm.reset();

    elements.accessForm.dataset.resourceDocumentId =
        "";

    elements.accessForm.dataset.resourceId =
        "";

    elements.accessForm.dataset.programCode =
        "";

    elements.accessForm.dataset.resourceVersion =
        "";

    setAccessFieldValue(
        "resource_title",
        ""
    );

    setAccessFieldValue(
        "program_code",
        ""
    );

    setAccessFieldValue(
        "resource_id",
        ""
    );

    setAccessFieldValue(
        "resource_version",
        ""
    );

    setAccessFieldValue(
        "learner_email",
        ""
    );

    setAccessFieldValue(
        "credential_id",
        ""
    );

    setAccessFieldValue(
        "learner_uid",
        ""
    );

    setAccessFieldValue(
        "identity_source",
        "historical_credential"
    );

    setAccessFieldValue(
        "identity_status",
        "pending_activation"
    );

    setAccessFieldValue(
        "access_status",
        "pending_activation"
    );

    /*
     * Compatibility value retained.
     * The assignment service translates and governs the
     * permanent Licensed Course Material ownership model.
     */
    setAccessFieldValue(
        "access_type",
        "individual_licensed"
    );

    setAccessFieldValue(
        "release_status",
        "released"
    );

    setAccessFieldValue(
        "release_policy",
        "on_activation"
    );

    setAccessFieldValue(
        "module_number",
        ""
    );

    setAccessFieldValue(
        "session_number",
        ""
    );

    setAccessFieldValue(
        "available_from",
        ""
    );

    setAccessFieldValue(
        "available_until",
        ""
    );

    setAccessFieldChecked(
        "preview_allowed",
        false
    );

    setAccessFieldChecked(
        "download_allowed",
        false
    );

    setAccessFieldRequired(
        "credential_id",
        true
    );

    if (
        elements.accessHeading
    ) {

        elements.accessHeading.textContent =
            "Assign Licensed Course Material to Learner";

    }

    if (
        elements.accessResourceSummary
    ) {

        elements.accessResourceSummary.textContent =
            "";

    }

    updateAccessPresentation();

}


/* ==========================================================
   LICENSED COURSE MATERIAL ASSIGNMENT FORM PRESENTATION
========================================================== */

function openAccessForm({
    resource = null
} = {}) {

    initialize();

    if (
        !elements.accessPanel ||
        !elements.accessForm ||
        !resource
    ) {

        return;

    }

    resetAccessFormPresentation();

    const documentId =
        normalizeText(
            resource.documentId
        );

    const resourceId =
        normalizeText(
            resource.resourceId
        );

    const programCode =
        normalizeText(
            resource.programCode
        );

    const version =
        normalizeNullablePositiveInteger(
            resource.version
        ) ||
        1;

    /*
     * These dataset properties are consumed by the controller
     * and assignment service. Their names remain unchanged.
     */
    elements.accessForm.dataset.resourceDocumentId =
        documentId;

    elements.accessForm.dataset.resourceId =
        resourceId;

    elements.accessForm.dataset.programCode =
        programCode;

    elements.accessForm.dataset.resourceVersion =
        String(
            version
        );

    setAccessFieldValue(
        "resource_title",
        resource.title ||
        "Untitled Licensed Course Material"
    );

    setAccessFieldValue(
        "program_code",
        programCode
    );

    setAccessFieldValue(
        "resource_id",
        resourceId
    );

    setAccessFieldValue(
        "resource_version",
        version
    );

    /*
     * A learner assignment is bound to this exact resource
     * document and version. Future resource versions do not
     * automatically replace the learner's assigned version.
     */
    setAccessFieldValue(
        "release_policy",
        resource.releasePolicy ===
            "on_enrollment"
            ? "on_enrollment"
            : "on_activation"
    );

    setAccessFieldValue(
        "module_number",
        resource.moduleNumber
    );

    setAccessFieldValue(
        "session_number",
        resource.sessionNumber
    );

    setAccessFieldValue(
        "available_from",
        formatDateTimeLocal(
            resource.availableFrom
        )
    );

    setAccessFieldValue(
        "available_until",
        formatDateTimeLocal(
            resource.availableUntil
        )
    );

    setAccessFieldChecked(
        "preview_allowed",
        resource.previewAllowed ===
            true
    );

    setAccessFieldChecked(
        "download_allowed",
        resource.downloadAllowed ===
            true
    );

    if (
        elements.accessHeading
    ) {

        elements.accessHeading.textContent =
            "Assign Licensed Course Material to Learner";

    }

    if (
        elements.accessResourceSummary
    ) {

        elements.accessResourceSummary.textContent =
            `${
                resource.title ||
                "Untitled Licensed Course Material"
            } · ${
                programCode ||
                "No programme"
            } · ${
                resourceId ||
                "No resource ID"
            } · Fixed Version ${version} · Permanent Ownership`;

    }

    updateAccessPresentation();

    elements.accessPanel.hidden =
        false;

    elements.accessPanel.classList.remove(
        "hidden"
    );

    elements.accessPanel.setAttribute(
        "aria-hidden",
        "false"
    );

    elements.accessPanel.scrollIntoView({
        behavior:
            "smooth",

        block:
            "start"
    });

    window.requestAnimationFrame(
        () => {

            const preferredField =
                getAccessFormField(
                    "learner_email"
                );

            if (
                preferredField &&
                typeof preferredField.focus ===
                    "function"
            ) {

                preferredField.focus();

                return;

            }

            const firstEditableField =
                Array
                    .from(
                        elements.accessForm.elements
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


function closeAccessForm() {

    initialize();

    if (
        !elements.accessPanel
    ) {

        return;

    }

    elements.accessPanel.hidden =
        true;

    elements.accessPanel.classList.add(
        "hidden"
    );

    elements.accessPanel.setAttribute(
        "aria-hidden",
        "true"
    );

    resetAccessFormPresentation();

}

/* ==========================================================
   AUTHORIZATION PRESENTATION
========================================================== */

function setAuthorized(
    authorized
) {

    initialize();

    const isAuthorized =
        authorized === true;

    const page =
        document.getElementById(
            "learning-resource-management"
        );

    if (
        page
    ) {

        page.dataset.authorized =
            isAuthorized
                ? "true"
                : "false";

        page.setAttribute(
            "aria-disabled",
            isAuthorized
                ? "false"
                : "true"
        );

    }

    /*
     * If authorization is lost, immediately close every
     * administrative editing surface. Business enforcement
     * remains outside the renderer.
     */
    if (
        !isAuthorized
    ) {

        closeForm();

        closeAccessForm();

    }

}


/* ==========================================================
   PUBLIC API
========================================================== */

/*
 * Public API intentionally preserves existing method names to
 * maintain backward compatibility with the Admin controller.
 *
 * Although administrator terminology has moved to
 * "Licensed Course Material Assignment", controller contracts
 * continue using the established Access APIs.
 */

const LearningResourceRenderer =
    Object.freeze({

        moduleName:
            MODULE_NAME,

        version:
            MODULE_VERSION,

        initialize,

        setAuthorized,

        setStatus,

        clearStatus,

        setLoading,

        renderSummary,

        renderResources,

        openForm,

        closeForm,

        resetFormPresentation,

        /*
         * Backward-compatible assignment APIs
         */
        openAccessForm,

        closeAccessForm,

        resetAccessFormPresentation,

        updateAccessPresentation,

        /*
         * Formatting helpers
         */
        formatLabel,

        formatDate,

        formatDateTimeLocal,

        formatFileSize,

        /*
         * Release presentation
         */
        updateReleasePolicyPresentation

    });


/* ==========================================================
   GLOBAL REGISTRATION
========================================================== */

window.LearningResourceRenderer =
    LearningResourceRenderer;


/* ==========================================================
   MODULE LOAD
========================================================== */

console.info(
    `[${MODULE_NAME}] Loaded v${MODULE_VERSION}`
);


/* ==========================================================
   ES MODULE EXPORTS
========================================================== */

export {

    LearningResourceRenderer,

    initialize,

    setAuthorized,

    setStatus,

    clearStatus,

    setLoading,

    renderSummary,

    renderResources,

    openForm,

    closeForm,

    resetFormPresentation,

    /*
     * Backward-compatible assignment exports
     */
    openAccessForm,

    closeAccessForm,

    resetAccessFormPresentation,

    updateAccessPresentation,

    /*
     * Formatting helpers
     */
    formatLabel,

    formatDate,

    formatDateTimeLocal,

    formatFileSize,

    /*
     * Release presentation
     */
    updateReleasePolicyPresentation

};