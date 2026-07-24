/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : learning-resource-section.js
   Version   : 1.0.2
   Status    : ACTIVE
   Phase     : Learner Learning Resource Delivery

   Purpose
   ----------------------------------------------------------
   Renders the authenticated learner's governed learning
   resources and provides preview and download actions.

   Responsibilities
   ----------------------------------------------------------
   ✓ Load resources through LearningResourceService
   ✓ Render loading, empty, error and ready states
   ✓ Render learner-facing resource cards
   ✓ Render preview and download actions
   ✓ Open governed previews safely
   ✓ Trigger governed file downloads safely
   ✓ Support protected blob delivery
   ✓ Support governed HTTPS external delivery
   ✓ Prevent duplicate action execution
   ✓ Publish presentation lifecycle events
   ✓ Provide retry support
   ✓ Clean up temporary browser object URLs

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Authentication decisions
   ✗ Authorization decisions
   ✗ Entitlement decisions
   ✗ Release-governance decisions
   ✗ Firestore queries
   ✗ Cloud Storage queries
   ✗ Backend API construction
   ✗ Learner ownership decisions
   ✗ Resource publication
   ✗ Sidebar navigation
   ✗ Page-shell construction

   Architectural Position
   ----------------------------------------------------------
   PortalAuth
        ↓
   LearningResourceService
        ↓
   Governed Resource ViewModel
        ↓
   LearningResourceSection
        ↓
   Learner Presentation

   Governance
   ----------------------------------------------------------
   • The backend remains authoritative for visibility,
     release, preview and download permissions.

   • The component must render only resources returned by
     LearningResourceService.

   • Resource titles and descriptions must be inserted as
     text, never interpreted as executable HTML.

   • Firestore document IDs, Storage paths and internal
     delivery locations must never be shown to learners.

   • Preview and download buttons must be displayed only when
     the corresponding backend-resolved permission is true.

   • Resource actions must fail closed.

   • Temporary object URLs must be revoked after use.

   • Repeated clicks must not create duplicate deliveries.

   Expected Mount
   ----------------------------------------------------------
   <section id="learningResourceSection"></section>

   Optional Supporting Elements
   ----------------------------------------------------------
   <div id="learningResourcePageStatus"></div>

   Public API
   ----------------------------------------------------------
   window.LearningResourceSection.initialize()
   window.LearningResourceSection.refresh()
   window.LearningResourceSection.render()
   window.LearningResourceSection.getState()
   window.LearningResourceSection.destroy()

   Change History
   ----------------------------------------------------------
   v1.0.1

   • Fixed issue with resource title normalization
   • Improved error handling for governed resource loading
   • Enhanced accessibility of resource cards
   
   v1.0.0
   • Added governed resource-list rendering
   • Added protected preview support
   • Added governed download support
   • Added external HTTPS delivery support
   • Added loading, empty and error states
   • Added retry support
   • Added action locking
   • Added object URL cleanup
   • Added accessible status announcements

========================================================== */

(function (
    window,
    document
) {

    "use strict";


    /* ======================================================
       MODULE IDENTITY
    ====================================================== */

    const MODULE_NAME =
        "LearningResourceSection";

    const MODULE_VERSION =
        "1.0.1";


    /* ======================================================
       DOM CONFIGURATION
    ====================================================== */

    const CONTAINER_IDS =
        Object.freeze([

            "learningResourceSection",

            "learningResourcesSection",

            "learningResourcesContainer"

        ]);


    const PAGE_STATUS_IDS =
        Object.freeze([

            "learningResourcePageStatus",

            "learningResourcesStatus"

        ]);


    /* ======================================================
       STATE
    ====================================================== */

    let initialized =
        false;

    let destroyed =
        false;

    let loading =
        false;

    let activeContainer =
        null;

    let resources =
        [];

    let lastError =
        null;

    let requestSequence =
        0;

    const activeActions =
        new Set();

    const temporaryObjectUrls =
        new Set();


    /* ======================================================
       VALUE HELPERS
    ====================================================== */

    function normalizeString(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        return String(
            value
        )
            .trim();

    }


    function normalizeLower(
        value
    ) {

        return normalizeString(
            value
        )
            .toLowerCase();

    }


    function normalizeUpper(
        value
    ) {

        return normalizeString(
            value
        )
            .toUpperCase();

    }


    function asArray(
        value
    ) {

        return Array.isArray(
            value
        )
            ? value
            : [];

    }


    function isObject(
        value
    ) {

        return Boolean(

            value &&
            typeof value ===
                "object" &&
            !Array.isArray(
                value
            )

        );

    }


    function firstValue(
        values
    ) {

        for (
            const value of asArray(
                values
            )
        ) {

            const normalized =
                normalizeString(
                    value
                );


            if (
                normalized
            ) {

                return normalized;

            }

        }


        return "";

    }


    function toBoolean(
        value
    ) {

        return value ===
            true;

    }


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
            normalizeString(
                className
            )
        ) {

            element.className =
                normalizeString(
                    className
                );

        }


        if (
            text !== null &&
            text !== undefined &&
            text !== ""
        ) {

            element.textContent =
                String(
                    text
                );

        }


        return element;

    }


    function setHidden(
        element,
        hidden
    ) {

        if (
            !element
        ) {

            return;

        }


        element.hidden =
            hidden === true;


        element.setAttribute(
            "aria-hidden",
            hidden === true
                ? "true"
                : "false"
        );

    }


    /* ======================================================
       EVENT PUBLISHING
    ====================================================== */

    function publishEvent(
        eventName,
        detail = {}
    ) {

        try {

            document.dispatchEvent(
                new CustomEvent(
                    eventName,
                    {
                        detail: {

                            source:
                                MODULE_NAME,

                            version:
                                MODULE_VERSION,

                            timestamp:
                                new Date()
                                    .toISOString(),

                            ...detail

                        }
                    }
                )
            );

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Unable to publish ${eventName}.`,
                error
            );

        }

    }


    /* ======================================================
       SERVICE RESOLUTION
    ====================================================== */

    function resolveService() {

        const service =
            window.LearningResourceService;


        if (
            !service ||
            typeof service !==
                "object"
        ) {

            return null;

        }


        return service;

    }


    function assertService() {

        const service =
            resolveService();


        if (
            !service ||
            typeof service.loadResources !==
                "function" ||
            typeof service.preview !==
                "function" ||
            typeof service.download !==
                "function"
        ) {

            const error =
                new Error(
                    "Learning resources are temporarily unavailable."
                );


            error.code =
                "LEARNING_RESOURCE_SERVICE_UNAVAILABLE";


            throw error;

        }


        return service;

    }


    /* ======================================================
       CONTAINER RESOLUTION
    ====================================================== */

    function findElementByIds(
        ids
    ) {

        for (
            const id of ids
        ) {

            const element =
                document.getElementById(
                    id
                );


            if (
                element
            ) {

                return element;

            }

        }


        return null;

    }


    function resolveContainer() {

        if (
            activeContainer &&
            document.documentElement.contains(
                activeContainer
            )
        ) {

            return activeContainer;

        }


        activeContainer =
            findElementByIds(
                CONTAINER_IDS
            );


        return activeContainer;

    }


    function resolvePageStatusElement() {

        return findElementByIds(
            PAGE_STATUS_IDS
        );

    }


    function announceStatus(
        message
    ) {

        const statusElement =
            resolvePageStatusElement();


        if (
            statusElement
        ) {

            statusElement.textContent =
                normalizeString(
                    message
                );

        }

    }


    /* ======================================================
       RESOURCE NORMALIZATION
    ====================================================== */

    function normalizeResource(
        resource,
        index
    ) {

        if (
            !isObject(
                resource
            )
        ) {

            return null;

        }


        const accessId =
            firstValue([

                resource.accessId,

                resource.access_id

            ]);


        if (
            !accessId
        ) {

            return null;

        }


        const title =
            firstValue([

                resource.title,

                resource.resourceTitle,

                resource.resource_title,

                "Learning Resource"

            ]);


        return Object.freeze({

            accessId,

            resourceId:
                firstValue([

                    resource.resourceId,

                    resource.resource_id

                ]),

            programCode:
                normalizeUpper(

                    firstValue([

                        resource.programCode,

                        resource.program_code

                    ])

                ),

            title,

            description:
                firstValue([

                    resource.description,

                    resource.summary,

                    resource.resourceDescription,

                    resource.resource_description

                ]),

            resourceType:
                normalizeLower(

                    firstValue([

                        resource.resourceType,

                        resource.resource_type,

                        resource.type

                    ])

                ),

            category:
                normalizeLower(
                    resource.category
                ),

            version:
                Number(
                    resource.version
                ) || 1,

            fileName:
                firstValue([

                    resource.fileName,

                    resource.file_name

                ]),

            mimeType:
                firstValue([

                    resource.mimeType,

                    resource.mime_type

                ]),

            deliveryType:
                normalizeLower(

                    firstValue([

                        resource.deliveryType,

                        resource.delivery_type

                    ])

                ),

            previewAllowed:
                toBoolean(

                    resource.previewAllowed ??
                    resource.preview_allowed

                ),

            downloadAllowed:
                toBoolean(

                    resource.downloadAllowed ??
                    resource.download_allowed

                ),

            availableFrom:
                firstValue([

                    resource.availableFrom,

                    resource.available_from

                ]) ||
                null,

            availableUntil:
                firstValue([

                    resource.availableUntil,

                    resource.available_until

                ]) ||
                null,

            displayOrder:
                Number.isFinite(
                    Number(
                        resource.displayOrder ??
                        resource.display_order
                    )
                )
                    ? Number(
                        resource.displayOrder ??
                        resource.display_order
                    )
                    : index,

            original:
                resource

        });

    }


    function normalizeResources(
        input
    ) {

        return asArray(
            input
        )
            .map(
                normalizeResource
            )
            .filter(
                Boolean
            )
            .sort(
                function (
                    first,
                    second
                ) {

                    if (
                        first.displayOrder !==
                        second.displayOrder
                    ) {

                        return (
                            first.displayOrder -
                            second.displayOrder
                        );

                    }


                    return first.title
                        .localeCompare(
                            second.title
                        );

                }
            );

    }


    /* ======================================================
       PRESENTATION HELPERS
    ====================================================== */

    function formatResourceType(
        resourceType
    ) {

        const normalizedType =
            normalizeLower(
                resourceType
            );


        const knownTypes = {

            pdf:
                "PDF Document",

            document:
                "Document",

            presentation:
                "Presentation",

            workbook:
                "Workbook",

            worksheet:
                "Worksheet",

            handout:
                "Handout",

            video:
                "Video",

            audio:
                "Audio",

            link:
                "Online Resource",

            external_url:
                "Online Resource",

            licensed_material:
                "Licensed Material"

        };


        if (
            knownTypes[
                normalizedType
            ]
        ) {

            return knownTypes[
                normalizedType
            ];

        }


        if (
            !normalizedType
        ) {

            return "Learning Material";

        }


        return normalizedType
            .replace(
                /[_-]+/g,
                " "
            )
            .replace(
                /\b\w/g,
                function (
                    character
                ) {

                    return character
                        .toUpperCase();

                }
            );

    }


    function resolveResourceIcon(
        resource
    ) {

        const type =
            normalizeLower(
                resource.resourceType
            );


        const mimeType =
            normalizeLower(
                resource.mimeType
            );


        if (
            type === "video" ||
            mimeType.startsWith(
                "video/"
            )
        ) {

            return "🎬";

        }


        if (
            type === "audio" ||
            mimeType.startsWith(
                "audio/"
            )
        ) {

            return "🎧";

        }


        if (
            type === "presentation"
        ) {

            return "📊";

        }


        if (
            type === "workbook" ||
            type === "worksheet"
        ) {

            return "📘";

        }


        if (
            type === "link" ||
            type === "external_url" ||
            resource.deliveryType ===
                "external_url"
        ) {

            return "🔗";

        }


        if (
            type === "pdf" ||
            mimeType ===
                "application/pdf"
        ) {

            return "📄";

        }


        return "📚";

    }


    function formatAvailabilityDate(
        value
    ) {

        const normalized =
            normalizeString(
                value
            );


        if (
            !normalized
        ) {

            return "";

        }


        const date =
            new Date(
                normalized
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "";

        }


        try {

            return new Intl.DateTimeFormat(
                "en-IN",
                {
                    day:
                        "2-digit",

                    month:
                        "short",

                    year:
                        "numeric"
                }
            )
                .format(
                    date
                );

        } catch (
            error
        ) {

            return date
                .toLocaleDateString();

        }

    }


    function resolveErrorMessage(
        error
    ) {

        const code =
            normalizeString(
                error?.code
            );


        const status =
            Number(
                error?.httpStatus
            ) || 0;


        if (
            status === 401 ||
            code.includes(
                "AUTH"
            ) ||
            code.includes(
                "TOKEN"
            )
        ) {

            return "Your session could not be verified. Please sign in again.";

        }


        if (
            status === 403 ||
            code.includes(
                "FORBIDDEN"
            )
        ) {

            return "You do not currently have permission to access this learning resource.";

        }


        if (
            status === 404
        ) {

            return "This learning resource is no longer available.";

        }


        if (
            status === 409
        ) {

            return "This learning resource is not currently available for delivery.";

        }


        if (
            status >= 500
        ) {

            return "Learning resources are temporarily unavailable. Please try again shortly.";

        }


        return (
            normalizeString(
                error?.message
            ) ||
            "The learning-resource request could not be completed."
        );

    }


    /* ======================================================
       STATE RENDERING
    ====================================================== */

    function clearContainer() {

        const container =
            resolveContainer();


        if (
            container
        ) {

            container.replaceChildren();

        }

    }


    function renderLoadingState() {

        const container =
            resolveContainer();


        if (
            !container
        ) {

            return;

        }


        container.replaceChildren();


        const state =
            createElement(
                "div",
                "learning-resource-state learning-resource-state--loading"
            );


        state.setAttribute(
            "role",
            "status"
        );


        state.setAttribute(
            "aria-live",
            "polite"
        );


        const indicator =
            createElement(
                "div",
                "learning-resource-loading-indicator"
            );


        indicator.setAttribute(
            "aria-hidden",
            "true"
        );


        const title =
            createElement(
                "h2",
                "learning-resource-state-title",
                "Loading your learning resources"
            );


        const message =
            createElement(
                "p",
                "learning-resource-state-message",
                "Please wait while your licensed materials are securely resolved."
            );


        state.append(
            indicator,
            title,
            message
        );


        container.appendChild(
            state
        );


        announceStatus(
            "Loading learning resources."
        );

    }


    function renderEmptyState() {

        const container =
            resolveContainer();


        if (
            !container
        ) {

            return;

        }


        container.replaceChildren();


        const state =
            createElement(
                "div",
                "learning-resource-state learning-resource-state--empty"
            );


        const icon =
            createElement(
                "div",
                "learning-resource-state-icon",
                "📚"
            );


        icon.setAttribute(
            "aria-hidden",
            "true"
        );


        const title =
            createElement(
                "h2",
                "learning-resource-state-title",
                "No learning resources available"
            );


        const message =
            createElement(
                "p",
                "learning-resource-state-message",
                "No published learning resources are currently assigned to your account."
            );


        const support =
            createElement(
                "p",
                "learning-resource-state-support"
            );


        support.append(
            document.createTextNode(
                "If you believe materials should be available, contact "
            )
        );


        const supportLink =
            createElement(
                "a",
                "learning-resource-support-link",
                "support@agileai.university"
            );


        supportLink.href =
            "mailto:support@agileai.university";


        support.append(
            supportLink,
            document.createTextNode(
                "."
            )
        );


        state.append(
            icon,
            title,
            message,
            support
        );


        container.appendChild(
            state
        );


        announceStatus(
            "No learning resources are currently available."
        );


        publishEvent(
            "learning-resource-section:empty"
        );

    }


    function renderErrorState(
        error
    ) {

        const container =
            resolveContainer();


        if (
            !container
        ) {

            return;

        }


        container.replaceChildren();


        const state =
            createElement(
                "div",
                "learning-resource-state learning-resource-state--error"
            );


        state.setAttribute(
            "role",
            "alert"
        );


        const icon =
            createElement(
                "div",
                "learning-resource-state-icon",
                "⚠️"
            );


        icon.setAttribute(
            "aria-hidden",
            "true"
        );


        const title =
            createElement(
                "h2",
                "learning-resource-state-title",
                "Learning resources unavailable"
            );


        const message =
            createElement(
                "p",
                "learning-resource-state-message",
                resolveErrorMessage(
                    error
                )
            );


        const retryButton =
            createElement(
                "button",
                "learning-resource-button learning-resource-button--primary",
                "Try Again"
            );


        retryButton.type =
            "button";


        retryButton.addEventListener(
            "click",
            function () {

                refresh();

            }
        );


        state.append(
            icon,
            title,
            message,
            retryButton
        );


        container.appendChild(
            state
        );


        announceStatus(
            "Learning resources could not be loaded."
        );


        publishEvent(
            "learning-resource-section:error",
            {
                code:
                    normalizeString(
                        error?.code
                    ) ||
                    "LEARNING_RESOURCE_RENDER_FAILED"
            }
        );

    }


    /* ======================================================
       RESOURCE CARD
    ====================================================== */

    function createMetadataItem(
        label,
        value
    ) {

        const normalizedValue =
            normalizeString(
                value
            );


        if (
            !normalizedValue
        ) {

            return null;

        }


        const item =
            createElement(
                "div",
                "learning-resource-meta-item"
            );


        const labelElement =
            createElement(
                "span",
                "learning-resource-meta-label",
                label
            );


        const valueElement =
            createElement(
                "span",
                "learning-resource-meta-value",
                normalizedValue
            );


        item.append(
            labelElement,
            valueElement
        );


        return item;

    }


    function createActionButton(
        {
            action,
            label,
            className,
            resource
        }
    ) {

        const button =
            createElement(
                "button",
                className,
                label
            );


        button.type =
            "button";


        button.dataset.action =
            action;


        button.dataset.accessId =
            resource.accessId;


        button.setAttribute(
            "aria-label",
            `${label}: ${resource.title}`
        );


        button.addEventListener(
            "click",
            function () {

                handleResourceAction(
                    resource,
                    action,
                    button
                );

            }
        );


        return button;

    }


    function createResourceCard(
        resource
    ) {

        const card =
            createElement(
                "article",
                "learning-resource-card"
            );


        card.dataset.accessId =
            resource.accessId;


        if (
            resource.resourceId
        ) {

            card.dataset.resourceId =
                resource.resourceId;

        }


        const header =
            createElement(
                "div",
                "learning-resource-card-header"
            );


        const icon =
            createElement(
                "div",
                "learning-resource-card-icon",
                resolveResourceIcon(
                    resource
                )
            );


        icon.setAttribute(
            "aria-hidden",
            "true"
        );


        const headingGroup =
            createElement(
                "div",
                "learning-resource-card-heading"
            );


        const title =
            createElement(
                "h2",
                "learning-resource-card-title",
                resource.title
            );


        const type =
            createElement(
                "div",
                "learning-resource-card-type",
                formatResourceType(
                    resource.resourceType
                )
            );


        headingGroup.append(
            title,
            type
        );


        header.append(
            icon,
            headingGroup
        );


        card.appendChild(
            header
        );


        if (
            resource.description
        ) {

            const description =
                createElement(
                    "p",
                    "learning-resource-card-description",
                    resource.description
                );


            card.appendChild(
                description
            );

        }


        const metadata =
            createElement(
                "div",
                "learning-resource-card-meta"
            );


        const programItem =
            createMetadataItem(
                "Programme",
                resource.programCode
            );


        const versionItem =
            resource.version > 0
                ? createMetadataItem(
                    "Version",
                    `v${resource.version}`
                )
                : null;


        const availableFromItem =
            createMetadataItem(
                "Available from",
                formatAvailabilityDate(
                    resource.availableFrom
                )
            );


        const availableUntilItem =
            createMetadataItem(
                "Available until",
                formatAvailabilityDate(
                    resource.availableUntil
                )
            );


        [

            programItem,

            versionItem,

            availableFromItem,

            availableUntilItem

        ]
            .filter(
                Boolean
            )
            .forEach(
                function (
                    item
                ) {

                    metadata.appendChild(
                        item
                    );

                }
            );


        if (
            metadata.childElementCount >
            0
        ) {

            card.appendChild(
                metadata
            );

        }


        const actions =
            createElement(
                "div",
                "learning-resource-card-actions"
            );


        if (
            resource.previewAllowed
        ) {

            actions.appendChild(

                createActionButton({

                    action:
                        "preview",

                    label:
                        "Preview",

                    className:
                        "learning-resource-button learning-resource-button--secondary",

                    resource

                })

            );

        }


        if (
            resource.downloadAllowed
        ) {

            actions.appendChild(

                createActionButton({

                    action:
                        "download",

                    label:
                        "Download",

                    className:
                        "learning-resource-button learning-resource-button--primary",

                    resource

                })

            );

        }


        if (
            actions.childElementCount ===
            0
        ) {

            const unavailable =
                createElement(
                    "p",
                    "learning-resource-action-unavailable",
                    "This resource is not currently available for preview or download."
                );


            actions.appendChild(
                unavailable
            );

        }


        card.appendChild(
            actions
        );


        return card;

    }


    function renderResources(
        resourceCollection = resources
    ) {

        const container =
            resolveContainer();


        if (
            !container
        ) {

            return false;

        }


        const normalizedResources =
            normalizeResources(
                resourceCollection
            );


        resources =
            normalizedResources;


        if (
            resources.length ===
            0
        ) {

            renderEmptyState();

            return true;

        }


        container.replaceChildren();


        const wrapper =
            createElement(
                "div",
                "learning-resource-content"
            );


        const summary =
            createElement(
                "div",
                "learning-resource-summary"
            );


        const summaryTitle =
            createElement(
                "h2",
                "learning-resource-summary-title",
                "Your Learning Resources"
            );


        const summaryText =
            createElement(
                "p",
                "learning-resource-summary-text",

                resources.length === 1

                    ? "1 governed learning resource is available."

                    : `${resources.length} governed learning resources are available.`
            );


        summary.append(
            summaryTitle,
            summaryText
        );


        const grid =
            createElement(
                "div",
                "learning-resource-grid"
            );


        grid.setAttribute(
            "aria-live",
            "polite"
        );


        resources.forEach(
            function (
                resource
            ) {

                grid.appendChild(
                    createResourceCard(
                        resource
                    )
                );

            }
        );


        wrapper.append(
            summary,
            grid
        );


        container.appendChild(
            wrapper
        );


        announceStatus(

            resources.length === 1

                ? "One learning resource is available."

                : `${resources.length} learning resources are available.`

        );


        publishEvent(
            "learning-resource-section:rendered",
            {
                total:
                    resources.length
            }
        );


        return true;

    }


    /* ======================================================
       TEMPORARY OBJECT URL MANAGEMENT
    ====================================================== */

    function registerObjectUrl(
        objectUrl
    ) {

        const normalized =
            normalizeString(
                objectUrl
            );


        if (
            normalized
        ) {

            temporaryObjectUrls.add(
                normalized
            );

        }

    }


    function revokeObjectUrl(
        objectUrl
    ) {

        const normalized =
            normalizeString(
                objectUrl
            );


        if (
            !normalized
        ) {

            return;

        }


        const service =
            resolveService();


        try {

            if (
                service &&
                typeof service.revokeObjectUrl ===
                    "function"
            ) {

                service.revokeObjectUrl(
                    normalized
                );

            } else {

                URL.revokeObjectURL(
                    normalized
                );

            }

        } catch (
            error
        ) {

            console.warn(
                `[${MODULE_NAME}] Object URL cleanup failed.`,
                error
            );

        }


        temporaryObjectUrls.delete(
            normalized
        );

    }


    function revokeAllObjectUrls() {

        temporaryObjectUrls.forEach(
            revokeObjectUrl
        );


        temporaryObjectUrls.clear();

    }


    function openExternalDelivery(
        url,
        reservedWindow = null
    ) {

        const normalizedUrl =
            normalizeString(
                url
            );


        if (
            !normalizedUrl
        ) {

            throw new Error(
                "The learning-resource link is unavailable."
            );

        }


        const parsedUrl =
            new URL(
                normalizedUrl
            );


        if (
            parsedUrl.protocol !==
            "https:"
        ) {

            throw new Error(
                "The learning-resource link is invalid."
            );

        }


        if (
            reservedWindow &&
            !reservedWindow.closed
        ) {

            reservedWindow.opener =
                null;


            reservedWindow.location.replace(
                parsedUrl.toString()
            );


            return;

        }


        const openedWindow =
            window.open(
                parsedUrl.toString(),
                "_blank",
                "noopener,noreferrer"
            );


        if (
            openedWindow
        ) {

            openedWindow.opener =
                null;


            return;

        }


        throw new Error(
            "The preview window was blocked. Please allow pop-ups and try again."
        );

    }

    function previewBlobDelivery(
        delivery,
        reservedWindow = null
    ) {

        const objectUrl =
            normalizeString(
                delivery?.objectUrl
            );


        if (
            !objectUrl
        ) {

            throw new Error(
                "The learning-resource preview is unavailable."
            );

        }


        registerObjectUrl(
            objectUrl
        );


        let previewWindow =
            reservedWindow;


        if (
            !previewWindow ||
            previewWindow.closed
        ) {

            previewWindow =
                window.open(
                    "",
                    "_blank"
                );

        }


        if (
            !previewWindow
        ) {

            revokeObjectUrl(
                objectUrl
            );


            throw new Error(
                "The preview window was blocked. Please allow pop-ups and try again."
            );

        }


        try {

            previewWindow.opener =
                null;


            previewWindow.location.replace(
                objectUrl
            );

        } catch (
            error
        ) {

            try {

                previewWindow.close();

            } catch (
                closeError
            ) {

                console.warn(
                    `[${MODULE_NAME}] Preview window cleanup failed.`,
                    closeError
                );

            }


            revokeObjectUrl(
                objectUrl
            );


            throw error;

        }


        /*
        * Keep the object URL alive long enough for the browser's
        * PDF viewer to finish reading it.
        */
        window.setTimeout(
            function () {

                revokeObjectUrl(
                    objectUrl
                );

            },
            120000
        );

    }


    function downloadBlobDelivery(
        delivery,
        resource
    ) {

        const objectUrl =
            normalizeString(
                delivery?.objectUrl
            );


        if (
            !objectUrl
        ) {

            throw new Error(
                "The learning-resource download is unavailable."
            );

        }


        registerObjectUrl(
            objectUrl
        );


        const fileName =
            firstValue([

                delivery.fileName,

                resource.fileName,

                `${resource.programCode || "AAU"}-Learning-Resource`

            ]);


        const link =
            document.createElement(
                "a"
            );


        link.href =
            objectUrl;


        link.download =
            fileName;


        link.rel =
            "noopener";


        link.style.display =
            "none";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        window.setTimeout(
            function () {

                revokeObjectUrl(
                    objectUrl
                );

            },
            1500
        );

    }


    function presentDelivery(
        delivery,
        resource,
        action,
        reservedWindow = null
    ) {

        if (
            !isObject(
                delivery
            )
        ) {

            throw new Error(
                "The learning-resource delivery response was invalid."
            );

        }


        if (
            delivery.kind ===
            "external"
        ) {

            openExternalDelivery(
                delivery.url,
                reservedWindow
            );


            return;

        }


        if (
            delivery.kind ===
            "blob"
        ) {

            if (
                action ===
                "preview"
            ) {

                previewBlobDelivery(
                    delivery,
                    reservedWindow
                );


                return;

            }


            downloadBlobDelivery(
                delivery,
                resource
            );


            return;

        }


        throw new Error(
            "The learning-resource delivery method is unsupported."
        );

    }


    /* ======================================================
       RESOURCE ACTION HANDLING
    ====================================================== */

    function buildActionKey(
        resource,
        action
    ) {

        return (
            normalizeString(
                resource.accessId
            ) +
            ":" +
            normalizeLower(
                action
            )
        );

    }


    function setButtonBusy(
        button,
        busy,
        originalLabel = ""
    ) {

        if (
            !button
        ) {

            return;

        }


        if (
            busy
        ) {

            if (
                !button.dataset.originalLabel
            ) {

                button.dataset.originalLabel =
                    normalizeString(
                        originalLabel ||
                        button.textContent
                    );

            }


            button.disabled =
                true;


            button.setAttribute(
                "aria-busy",
                "true"
            );


            button.textContent =
                button.dataset.action ===
                    "preview"

                    ? "Opening…"

                    : "Preparing…";


            return;

        }


        button.disabled =
            false;


        button.removeAttribute(
            "aria-busy"
        );


        button.textContent =
            normalizeString(
                button.dataset.originalLabel
            ) ||
            (
                button.dataset.action ===
                    "preview"

                    ? "Preview"

                    : "Download"
            );

    }


    async function handleResourceAction(
        resource,
        action,
        button
    ) {

        const normalizedAction =
            normalizeLower(
                action
            );


        const actionKey =
            buildActionKey(
                resource,
                normalizedAction
            );


        if (
            activeActions.has(
                actionKey
            )
        ) {

            return;

        }


        /*
        * Chrome requires a preview window to be created directly
        * inside the learner's click event. We therefore reserve
        * the tab before awaiting the governed delivery request.
        */
        let reservedPreviewWindow =
            null;


        if (
            normalizedAction ===
            "preview"
        ) {

            reservedPreviewWindow =
                window.open(
                    "",
                    "_blank"
                );


            if (
                reservedPreviewWindow
            ) {

                reservedPreviewWindow.opener =
                    null;


                try {

                    reservedPreviewWindow.document.title =
                        "Preparing learning-resource preview";


                    reservedPreviewWindow.document.body.textContent =
                        "Preparing your secure learning-resource preview…";

                } catch (
                    error
                ) {

                    /*
                    * Some browser environments prevent access to
                    * the temporary page. The reserved window is
                    * still valid and can be navigated later.
                    */
                }

            }

        }


        activeActions.add(
            actionKey
        );


        setButtonBusy(
            button,
            true
        );


        announceStatus(

            normalizedAction ===
                "preview"

                ? `Opening ${resource.title}.`

                : `Preparing ${resource.title} for download.`

        );


        publishEvent(
            "learning-resource-section:action-started",
            {
                action:
                    normalizedAction,

                accessId:
                    resource.accessId
            }
        );


        try {

            const service =
                assertService();


            const delivery =
                normalizedAction ===
                    "preview"

                    ? await service.preview(
                        resource
                    )

                    : await service.download(
                        resource
                    );


            presentDelivery(
                delivery,
                resource,
                normalizedAction,
                reservedPreviewWindow
            );


            reservedPreviewWindow =
                null;


            announceStatus(

                normalizedAction ===
                    "preview"

                    ? `${resource.title} opened successfully.`

                    : `${resource.title} download started.`

            );


            publishEvent(
                "learning-resource-section:action-completed",
                {
                    action:
                        normalizedAction,

                    accessId:
                        resource.accessId,

                    deliveryKind:
                        normalizeString(
                            delivery?.kind
                        )
                }
            );

        } catch (
            error
        ) {

            if (
                reservedPreviewWindow &&
                !reservedPreviewWindow.closed
            ) {

                try {

                    reservedPreviewWindow.close();

                } catch (
                    closeError
                ) {

                    console.warn(
                        `[${MODULE_NAME}] Reserved preview window cleanup failed.`,
                        closeError
                    );

                }

            }


            console.error(
                `[${MODULE_NAME}] Resource action failed.`,
                {
                    action:
                        normalizedAction,

                    accessId:
                        resource.accessId,

                    code:
                        error?.code ||
                        "LEARNING_RESOURCE_ACTION_FAILED",

                    message:
                        normalizeString(
                            error?.message
                        )
                }
            );


            const message =
                resolveErrorMessage(
                    error
                );


            announceStatus(
                message
            );


            window.alert(
                message
            );


            publishEvent(
                "learning-resource-section:action-failed",
                {
                    action:
                        normalizedAction,

                    accessId:
                        resource.accessId,

                    code:
                        normalizeString(
                            error?.code
                        ) ||
                        "LEARNING_RESOURCE_ACTION_FAILED"
                }
            );

        } finally {

            activeActions.delete(
                actionKey
            );


            setButtonBusy(
                button,
                false
            );

        }

    }


    /* ======================================================
       DATA LOADING
    ====================================================== */

    async function load() {

        if (
            destroyed
        ) {

            return [];

        }


        const container =
            resolveContainer();


        if (
            !container
        ) {

            console.warn(
                `[${MODULE_NAME}] No learning-resource mount was found.`
            );


            return [];

        }


        if (
            loading
        ) {

            return resources;

        }


        loading =
            true;


        lastError =
            null;


        const currentRequest =
            ++requestSequence;


        renderLoadingState();


        publishEvent(
            "learning-resource-section:loading"
        );


        try {

            const service =
                assertService();


            const result =
                await service.loadResources();


            if (
                destroyed ||
                currentRequest !==
                    requestSequence
            ) {

                return resources;

            }


            const loadedResources =
                normalizeResources(

                    Array.isArray(
                        result
                    )
                        ? result
                        : result?.resources

                );


            resources =
                loadedResources;


            renderResources(
                resources
            );


            publishEvent(
                "learning-resource-section:ready",
                {
                    total:
                        resources.length
                }
            );


            return resources;

        } catch (
            error
        ) {

            if (
                destroyed ||
                currentRequest !==
                    requestSequence
            ) {

                return resources;

            }


            lastError =
                error;


            resources =
                [];


            console.error(
                `[${MODULE_NAME}] Resource loading failed.`,
                {
                    code:
                        error?.code ||
                        "LEARNING_RESOURCE_LOAD_FAILED",

                    httpStatus:
                        error?.httpStatus ||
                        500
                }
            );


            renderErrorState(
                error
            );


            return [];

        } finally {

            if (
                currentRequest ===
                requestSequence
            ) {

                loading =
                    false;

            }

        }

    }


    async function refresh() {

        if (
            destroyed
        ) {

            return [];

        }


        requestSequence +=
            1;


        loading =
            false;


        return load();

    }


    /* ======================================================
       INITIALIZATION
    ====================================================== */

    function initialize() {

        if (
            initialized ||
            destroyed
        ) {

            return;

        }


        const container =
            resolveContainer();


        if (
            !container
        ) {

            return;

        }


        initialized =
            true;


        container.setAttribute(
            "data-learning-resource-section-version",
            MODULE_VERSION
        );


        publishEvent(
            "learning-resource-section:initialized"
        );


        load();

    }


    /* ======================================================
       CLEANUP
    ====================================================== */

    function destroy() {

        destroyed =
            true;

        initialized =
            false;

        loading =
            false;

        requestSequence +=
            1;

        activeActions.clear();

        revokeAllObjectUrls();

        clearContainer();

        activeContainer =
            null;

        resources =
            [];

        lastError =
            null;


        publishEvent(
            "learning-resource-section:destroyed"
        );

    }


    /* ======================================================
       PUBLIC API
    ====================================================== */

    window.LearningResourceSection =
        Object.freeze({

            initialize,

            refresh,

            load,

            render:
                renderResources,

            destroy,

            getResources() {

                return Object.freeze(
                    resources.slice()
                );

            },

            getState() {

                return Object.freeze({

                    initialized,

                    destroyed,

                    loading,

                    total:
                        resources.length,

                    hasError:
                        Boolean(
                            lastError
                        ),

                    errorCode:
                        normalizeString(
                            lastError?.code
                        ),

                    activeActionCount:
                        activeActions.size,

                    version:
                        MODULE_VERSION

                });

            }

        });


    /* ======================================================
       AUTOMATIC PAGE INITIALIZATION
    ====================================================== */

    function initializeWhenReady() {

        const container =
            resolveContainer();


        if (
            !container
        ) {

            return;

        }


        /*
         * PortalAuth already protects the page. Waiting for
         * readiness prevents learner-resource requests before
         * Firebase authentication state has been restored.
         */
        if (
            window.PortalAuth &&
            typeof window.PortalAuth.whenReady ===
                "function"
        ) {

            window.PortalAuth
                .whenReady()
                .then(
                    function (
                        authState
                    ) {

                        if (
                            authState?.authenticated &&
                            authState?.user
                        ) {

                            initialize();

                        }

                    }
                )
                .catch(
                    function (
                        error
                    ) {

                        lastError =
                            error;


                        renderErrorState(
                            error
                        );

                    }
                );


            return;

        }


        /*
         * Fail safely when the component is loaded before the
         * authentication facade. A later auth-ready event may
         * initialize it.
         */
        document.addEventListener(
            "portal:auth-authenticated",
            initialize,
            {
                once:
                    true
            }
        );

    }


    document.addEventListener(
        "portal:signout-completed",
        destroy
    );


    window.addEventListener(
        "pagehide",
        revokeAllObjectUrls
    );


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeWhenReady,
            {
                once:
                    true
            }
        );

    } else {

        initializeWhenReady();

    }


    console.info(
        `[${MODULE_NAME}] Loaded v${MODULE_VERSION}.`
    );


})(window, document);