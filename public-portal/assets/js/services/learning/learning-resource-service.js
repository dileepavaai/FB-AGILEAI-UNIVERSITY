/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : learning-resource-service.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Learner Learning Resource Delivery

   Purpose
   ----------------------------------------------------------
   Provides the governed learner-facing service for listing,
   previewing and downloading assigned learning resources.

   Responsibilities
   ----------------------------------------------------------
   ✓ Resolve the authenticated Firebase learner
   ✓ Obtain a Firebase ID token
   ✓ Load learner-assigned resources from Cloud Run
   ✓ Request governed preview and download delivery
   ✓ Support protected Storage streaming responses
   ✓ Support governed HTTPS external-link responses
   ✓ Return safe service results to presentation components
   ✓ Publish learning-resource lifecycle events

   Non Responsibilities
   ----------------------------------------------------------
   ✗ Firebase initialization
   ✗ Authentication decisions
   ✗ Authorization decisions
   ✗ Firestore queries
   ✗ Cloud Storage queries
   ✗ Entitlement decisions
   ✗ Resource release decisions
   ✗ HTML rendering
   ✗ DOM manipulation
   ✗ Sidebar navigation
   ✗ Business-rule evaluation

   Architectural Position
   ----------------------------------------------------------
   PortalAuth
        ↓
   Firebase ID Token
        ↓
   LearningResourceService
        ↓
   Cloud Run Learning Resource API
        ↓
   learner_resource_access
        ↓
   learning_resources
        ↓
   Governed Delivery

   Governance
   ----------------------------------------------------------
   • Firebase Authentication is the identity authority.

   • Learner UID and email must never be supplied by the
     browser as ownership claims.

   • The Firebase ID token is the sole browser-provided
     identity proof sent to the backend.

   • Firestore and Cloud Storage must never be queried
     directly from this service.

   • The backend remains authoritative for resource
     visibility, release, preview and download permissions.

   • Protected files are consumed as response blobs.

   • External delivery URLs must be HTTPS.

   • Raw Storage paths and Firestore document paths must
     never be exposed to the learner.

   Change History
   ----------------------------------------------------------
   v1.0.0

   • Added authenticated learner-resource listing
   • Added governed preview and download delivery
   • Added protected blob response support
   • Added HTTPS external-link support
   • Added normalized public service API
   • Added privacy-safe lifecycle events

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
        "LearningResourceService";

    const MODULE_VERSION =
        "1.0.0";


    /* ======================================================
       API CONFIGURATION
    ====================================================== */

    const DEFAULT_API_BASE_URL =
        "https://aau-credential-verify-458881040066.asia-south1.run.app";


    const API_PATHS =
        Object.freeze({

            list:
                "/api/v1/learning-resources/me",

            delivery(
                accessId
            ) {

                return (
                    "/api/v1/learning-resources/" +
                    encodeURIComponent(
                        accessId
                    ) +
                    "/delivery"
                );

            }

        });


    /* ======================================================
       STATE
    ====================================================== */

    let activeObjectUrls =
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


    function resolveApiBaseUrl() {

        const configuredUrl =
            normalizeString(
                window.__AAIU_LEARNING_RESOURCE_API_BASE_URL__
            );


        return (
            configuredUrl ||
            DEFAULT_API_BASE_URL
        )
            .replace(
                /\/+$/,
                ""
            );

    }


    function buildApiUrl(
        path
    ) {

        return (
            resolveApiBaseUrl() +
            "/" +
            normalizeString(
                path
            )
                .replace(
                    /^\/+/,
                    ""
                )
        );

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


    function asArray(
        value
    ) {

        return Array.isArray(
            value
        )
            ? value
            : [];

    }


    function createServiceError(
        {
            code,
            message,
            httpStatus = 500,
            details = null
        }
    ) {

        const error =
            new Error(
                normalizeString(
                    message
                ) ||
                "The learning-resource request could not be completed."
            );


        error.code =
            normalizeString(
                code
            ) ||
            "LEARNING_RESOURCE_REQUEST_FAILED";


        error.httpStatus =
            Number.isInteger(
                httpStatus
            )
                ? httpStatus
                : 500;


        error.details =
            details;


        return error;

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
       AUTHENTICATION
    ====================================================== */

    async function resolveAuthenticatedUser() {

        if (
            !window.PortalAuth ||
            typeof window.PortalAuth.whenReady !==
                "function"
        ) {

            throw createServiceError({

                code:
                    "LEARNING_RESOURCE_AUTH_UNAVAILABLE",

                message:
                    "Portal authentication is unavailable.",

                httpStatus:
                    401

            });

        }


        const authenticationState =
            await window.PortalAuth.whenReady();


        const user =
            authenticationState?.user ||
            window.PortalAuth.getCurrentUser?.() ||
            null;


        if (
            !user
        ) {

            throw createServiceError({

                code:
                    "LEARNING_RESOURCE_AUTH_REQUIRED",

                message:
                    "Please sign in to access learning resources.",

                httpStatus:
                    401

            });

        }


        if (
            typeof user.getIdToken !==
                "function"
        ) {

            throw createServiceError({

                code:
                    "LEARNING_RESOURCE_TOKEN_UNAVAILABLE",

                message:
                    "The authenticated session could not be verified.",

                httpStatus:
                    401

            });

        }


        return user;

    }


    async function getFirebaseIdToken(
        forceRefresh = false
    ) {

        const user =
            await resolveAuthenticatedUser();


        const idToken =
            await user.getIdToken(
                forceRefresh === true
            );


        if (
            !normalizeString(
                idToken
            )
        ) {

            throw createServiceError({

                code:
                    "LEARNING_RESOURCE_TOKEN_UNAVAILABLE",

                message:
                    "The authenticated session could not be verified.",

                httpStatus:
                    401

            });

        }


        return idToken;

    }


    /* ======================================================
       RESPONSE HELPERS
    ====================================================== */

    async function safeJson(
        response
    ) {

        try {

            return await response.json();

        } catch (
            error
        ) {

            return null;

        }

    }


    function resolveBackendError(
        payload,
        response
    ) {

        const backendError =
            isObject(
                payload?.error
            )
                ? payload.error
                : {};


        return createServiceError({

            code:
                normalizeString(
                    backendError.code
                ) ||
                "LEARNING_RESOURCE_REQUEST_FAILED",

            message:
                normalizeString(
                    backendError.message
                ) ||
                (
                    response?.status === 401
                        ? "Please sign in again to continue."
                        : "The learning-resource request could not be completed."
                ),

            httpStatus:
                Number.isInteger(
                    response?.status
                )
                    ? response.status
                    : 500,

            details:
                payload

        });

    }


    async function authenticatedFetch(
        url,
        options = {},
        retryAuthentication = true
    ) {

        const idToken =
            await getFirebaseIdToken(
                false
            );


        const headers =
            new Headers(
                options.headers ||
                {}
            );


        headers.set(
            "Authorization",
            `Bearer ${idToken}`
        );


        const response =
            await fetch(
                url,
                {
                    ...options,
                    headers,
                    cache:
                        "no-store",
                    credentials:
                        "omit"
                }
            );


        if (
            response.status === 401 &&
            retryAuthentication
        ) {

            const refreshedToken =
                await getFirebaseIdToken(
                    true
                );


            headers.set(
                "Authorization",
                `Bearer ${refreshedToken}`
            );


            return fetch(
                url,
                {
                    ...options,
                    headers,
                    cache:
                        "no-store",
                    credentials:
                        "omit"
                }
            );

        }


        return response;

    }


    /* ======================================================
       RESOURCE NORMALIZATION
    ====================================================== */

    function normalizeResource(
        resource
    ) {

        if (
            !isObject(
                resource
            )
        ) {

            return null;

        }


        const accessId =
            normalizeString(
                resource.accessId
            );


        if (
            !accessId
        ) {

            return null;

        }


        return Object.freeze({

            accessId,

            resourceId:
                normalizeString(
                    resource.resourceId
                ),

            programCode:
                normalizeString(
                    resource.programCode
                )
                    .toUpperCase(),

            title:
                normalizeString(
                    resource.title
                ) ||
                "Learning Resource",

            description:
                normalizeString(
                    resource.description
                ),

            resourceType:
                normalizeLower(
                    resource.resourceType
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
                normalizeString(
                    resource.fileName
                ),

            mimeType:
                normalizeString(
                    resource.mimeType
                ),

            deliveryType:
                normalizeLower(
                    resource.deliveryType
                ),

            previewAllowed:
                resource.previewAllowed ===
                true,

            downloadAllowed:
                resource.downloadAllowed ===
                true,

            availableFrom:
                normalizeString(
                    resource.availableFrom
                ) ||
                null,

            availableUntil:
                normalizeString(
                    resource.availableUntil
                ) ||
                null,

            deliveryPath:
                normalizeString(
                    resource.deliveryPath
                )

        });

    }


    /* ======================================================
       RESOURCE LIST
    ====================================================== */

    async function loadResources() {

        publishEvent(
            "learning-resources:loading"
        );


        try {

            const response =
                await authenticatedFetch(

                    buildApiUrl(
                        API_PATHS.list
                    ),

                    {
                        method:
                            "GET",

                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }

                );


            const payload =
                await safeJson(
                    response
                );


            if (
                !response.ok
            ) {

                throw resolveBackendError(
                    payload,
                    response
                );

            }


            if (
                payload?.success !==
                true
            ) {

                throw createServiceError({

                    code:
                        "LEARNING_RESOURCE_RESPONSE_INVALID",

                    message:
                        "The learning-resource response was invalid.",

                    httpStatus:
                        502,

                    details:
                        payload

                });

            }


            const resources =
                asArray(
                    payload?.data?.resources
                )
                    .map(
                        normalizeResource
                    )
                    .filter(
                        Boolean
                    );


            const result =
                Object.freeze({

                    resources:
                        Object.freeze(
                            resources
                        ),

                    total:
                        resources.length,

                    apiVersion:
                        normalizeString(
                            payload?.meta?.apiVersion
                        )

                });


            publishEvent(
                "learning-resources:loaded",
                {
                    total:
                        result.total
                }
            );


            return result;

        } catch (
            error
        ) {

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


            publishEvent(
                "learning-resources:load-failed",
                {
                    code:
                        normalizeString(
                            error?.code
                        ) ||
                        "LEARNING_RESOURCE_LOAD_FAILED",

                    httpStatus:
                        Number.isInteger(
                            error?.httpStatus
                        )
                            ? error.httpStatus
                            : 500
                }
            );


            throw error;

        }

    }


    /* ======================================================
       DELIVERY REQUEST
    ====================================================== */

    function validateAction(
        action
    ) {

        const normalizedAction =
            normalizeLower(
                action
            );


        if (
            ![
                "preview",
                "download"
            ].includes(
                normalizedAction
            )
        ) {

            throw createServiceError({

                code:
                    "LEARNING_RESOURCE_ACTION_INVALID",

                message:
                    "The requested learning-resource action is invalid.",

                httpStatus:
                    400

            });

        }


        return normalizedAction;

    }


    function validateAccessId(
        accessId
    ) {

        const normalizedAccessId =
            normalizeString(
                accessId
            );


        if (
            !normalizedAccessId
        ) {

            throw createServiceError({

                code:
                    "LEARNING_RESOURCE_ACCESS_ID_REQUIRED",

                message:
                    "The learning-resource assignment is unavailable.",

                httpStatus:
                    400

            });

        }


        return normalizedAccessId;

    }


    function resolveResponseFileName(
        response,
        fallbackFileName
    ) {

        const disposition =
            normalizeString(
                response.headers.get(
                    "content-disposition"
                )
            );


        const utf8Match =
            disposition.match(
                /filename\*=UTF-8''([^;]+)/i
            );


        if (
            utf8Match?.[1]
        ) {

            try {

                return decodeURIComponent(
                    utf8Match[1]
                );

            } catch (
                error
            ) {

                // Continue to the standard filename fallback.

            }

        }


        const standardMatch =
            disposition.match(
                /filename="?([^";]+)"?/i
            );


        return (
            normalizeString(
                standardMatch?.[1]
            ) ||
            normalizeString(
                fallbackFileName
            ) ||
            "Agile-AI-University-Learning-Resource"
        );

    }


    function validateExternalUrl(
        value
    ) {

        const externalUrl =
            normalizeString(
                value
            );


        if (
            !externalUrl
        ) {

            return "";

        }


        try {

            const parsedUrl =
                new URL(
                    externalUrl
                );


            return parsedUrl.protocol ===
                "https:"
                    ? parsedUrl.toString()
                    : "";

        } catch (
            error
        ) {

            return "";

        }

    }


    async function requestDelivery(
        accessId,
        action,
        options = {}
    ) {

        const normalizedAccessId =
            validateAccessId(
                accessId
            );


        const normalizedAction =
            validateAction(
                action
            );


        publishEvent(
            "learning-resource:delivery-started",
            {
                accessId:
                    normalizedAccessId,

                action:
                    normalizedAction
            }
        );


        try {

            const response =
                await authenticatedFetch(

                    buildApiUrl(
                        API_PATHS.delivery(
                            normalizedAccessId
                        )
                    ),

                    {
                        method:
                            "POST",

                        headers: {
                            "Accept":
                                "application/json, application/octet-stream, application/pdf",

                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                action:
                                    normalizedAction
                            })
                    }

                );


            const contentType =
                normalizeLower(
                    response.headers.get(
                        "content-type"
                    )
                );


            if (
                !response.ok
            ) {

                const payload =
                    contentType.includes(
                        "application/json"
                    )
                        ? await safeJson(
                            response
                        )
                        : null;


                throw resolveBackendError(
                    payload,
                    response
                );

            }


            /*
             * Governed external delivery returns JSON.
             */
            if (
                contentType.includes(
                    "application/json"
                )
            ) {

                const payload =
                    await safeJson(
                        response
                    );


                if (
                    payload?.success !==
                    true
                ) {

                    throw createServiceError({

                        code:
                            "LEARNING_RESOURCE_DELIVERY_INVALID",

                        message:
                            "The learning-resource delivery response was invalid.",

                        httpStatus:
                            502,

                        details:
                            payload

                    });

                }


                const externalUrl =
                    validateExternalUrl(
                        payload?.data?.deliveryUrl
                    );


                if (
                    !externalUrl
                ) {

                    throw createServiceError({

                        code:
                            "LEARNING_RESOURCE_EXTERNAL_URL_INVALID",

                        message:
                            "The learning-resource link is unavailable.",

                        httpStatus:
                            409

                    });

                }


                const result =
                    Object.freeze({

                        kind:
                            "external",

                        action:
                            normalizedAction,

                        accessId:
                            normalizedAccessId,

                        url:
                            externalUrl,

                        deliveryType:
                            normalizeLower(
                                payload?.data?.deliveryType
                            ) ||
                            "external_url",

                        expiresAt:
                            normalizeString(
                                payload?.data?.expiresAt
                            ) ||
                            null

                    });


                publishEvent(
                    "learning-resource:delivery-ready",
                    {
                        accessId:
                            normalizedAccessId,

                        action:
                            normalizedAction,

                        kind:
                            "external"
                    }
                );


                return result;

            }


            /*
             * Protected Storage delivery returns a stream,
             * consumed by the browser as a Blob.
             */
            const blob =
                await response.blob();


            if (
                !blob ||
                blob.size === 0
            ) {

                throw createServiceError({

                    code:
                        "LEARNING_RESOURCE_FILE_EMPTY",

                    message:
                        "The learning-resource file is unavailable.",

                    httpStatus:
                        404

                });

            }


            const objectUrl =
                URL.createObjectURL(
                    blob
                );


            activeObjectUrls.add(
                objectUrl
            );


            const result =
                Object.freeze({

                    kind:
                        "blob",

                    action:
                        normalizedAction,

                    accessId:
                        normalizedAccessId,

                    blob,

                    objectUrl,

                    fileName:
                        resolveResponseFileName(
                            response,
                            options.fileName
                        ),

                    mimeType:
                        normalizeString(
                            blob.type
                        ) ||
                        contentType ||
                        "application/octet-stream",

                    revoke() {

                        revokeObjectUrl(
                            objectUrl
                        );

                    }

                });


            publishEvent(
                "learning-resource:delivery-ready",
                {
                    accessId:
                        normalizedAccessId,

                    action:
                        normalizedAction,

                    kind:
                        "blob"
                }
            );


            return result;

        } catch (
            error
        ) {

            console.error(
                `[${MODULE_NAME}] Resource delivery failed.`,
                {
                    action:
                        normalizedAction,

                    code:
                        error?.code ||
                        "LEARNING_RESOURCE_DELIVERY_FAILED",

                    httpStatus:
                        error?.httpStatus ||
                        500
                }
            );


            publishEvent(
                "learning-resource:delivery-failed",
                {
                    accessId:
                        normalizedAccessId,

                    action:
                        normalizedAction,

                    code:
                        normalizeString(
                            error?.code
                        ) ||
                        "LEARNING_RESOURCE_DELIVERY_FAILED",

                    httpStatus:
                        Number.isInteger(
                            error?.httpStatus
                        )
                            ? error.httpStatus
                            : 500
                }
            );


            throw error;

        }

    }


    /* ======================================================
       OBJECT URL LIFECYCLE
    ====================================================== */

    function revokeObjectUrl(
        objectUrl
    ) {

        const normalizedObjectUrl =
            normalizeString(
                objectUrl
            );


        if (
            !normalizedObjectUrl ||
            !activeObjectUrls.has(
                normalizedObjectUrl
            )
        ) {

            return;

        }


        URL.revokeObjectURL(
            normalizedObjectUrl
        );


        activeObjectUrls.delete(
            normalizedObjectUrl
        );

    }


    function revokeAllObjectUrls() {

        activeObjectUrls.forEach(
            function (
                objectUrl
            ) {

                URL.revokeObjectURL(
                    objectUrl
                );

            }
        );


        activeObjectUrls.clear();

    }


    /* ======================================================
       CONVENIENCE OPERATIONS
    ====================================================== */

    async function preview(
        resource
    ) {

        const normalizedResource =
            isObject(
                resource
            )
                ? resource
                : {
                    accessId:
                        resource
                };


        if (
            normalizedResource.previewAllowed ===
            false
        ) {

            throw createServiceError({

                code:
                    "LEARNING_RESOURCE_PREVIEW_FORBIDDEN",

                message:
                    "Preview is not available for this learning resource.",

                httpStatus:
                    403

            });

        }


        return requestDelivery(

            normalizedResource.accessId,

            "preview",

            {
                fileName:
                    normalizedResource.fileName
            }

        );

    }


    async function download(
        resource
    ) {

        const normalizedResource =
            isObject(
                resource
            )
                ? resource
                : {
                    accessId:
                        resource
                };


        if (
            normalizedResource.downloadAllowed ===
            false
        ) {

            throw createServiceError({

                code:
                    "LEARNING_RESOURCE_DOWNLOAD_FORBIDDEN",

                message:
                    "Download is not available for this learning resource.",

                httpStatus:
                    403

            });

        }


        return requestDelivery(

            normalizedResource.accessId,

            "download",

            {
                fileName:
                    normalizedResource.fileName
            }

        );

    }


    /* ======================================================
       PUBLIC API
    ====================================================== */

    const LearningResourceService =
        Object.freeze({

            loadResources,

            getResources:
                loadResources,

            requestDelivery,

            preview,

            download,

            revokeObjectUrl,

            revokeAllObjectUrls,

            getApiBaseUrl:
                resolveApiBaseUrl,

            getVersion() {

                return MODULE_VERSION;

            }

        });


    window.LearningResourceService =
        LearningResourceService;


    /* ======================================================
       PAGE CLEANUP
    ====================================================== */

    window.addEventListener(
        "pagehide",
        revokeAllObjectUrls
    );


    window.addEventListener(
        "beforeunload",
        revokeAllObjectUrls
    );


    publishEvent(
        "learning-resource-service:ready",
        {
            apiBaseUrl:
                resolveApiBaseUrl()
        }
    );


    console.info(
        `[${MODULE_NAME}] Loaded v${MODULE_VERSION}.`
    );


})(window, document);