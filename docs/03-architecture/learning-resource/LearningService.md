# Agile AI University

# Enterprise Service Specification

# LearningService

> **The authoritative enterprise service responsible for resolving, governing and delivering learning resources to authenticated and entitled learners.**

---

# Document Information

| Attribute | Value |
|---|---|
| **Service** | LearningService |
| **Version** | 1.0.0 |
| **Status** | ACTIVE |
| **Architecture Status** | LOCKED |
| **Domain** | Learning Resource Platform |
| **Layer** | Enterprise Service Layer |
| **Owner** | Learning Resource Platform |
| **Classification** | Enterprise Core Service |
| **Last Updated** | July 2026 |

---

# Purpose

The LearningService is the single authoritative runtime service responsible for resolving all learner-visible learning resources.

It acts as the boundary between enterprise business logic and presentation.

The service guarantees that only authenticated, authorized, entitled and properly resolved learning resources reach the Student Portal.

The service does not perform presentation.

It produces governed learner-facing ViewModels.

---

# Vision

The LearningService enables Agile AI University to deliver learning resources as governed digital assets rather than static downloadable files.

The service supports:

- lifelong learning;
- continuous publication;
- personalized learning materials;
- licensed course packs;
- supporting resources;
- governed downloads;
- external learning resources;
- future intelligent recommendations.

---

# Service Position

```text
Firebase Authentication

↓

Portal Authentication Service

↓

Authorization

↓

Entitlement Resolver

↓

Learning Resource Resolver

↓

LearningService

↓

Student Portal Renderer
```

The LearningService executes only after platform readiness has been established.

---

# Service Responsibilities

The LearningService is responsible for:

- coordinating learning-resource resolution;
- invoking the Learning Resource Resolver;
- obtaining learner deliveries;
- validating resolved resources;
- removing inconsistent records;
- producing learner-facing ViewModels;
- grouping learner resources;
- sorting learner resources;
- exposing learner resource APIs;
- publishing readiness events;
- maintaining presentation independence.

---

# Service Non-Responsibilities

The LearningService must never:

- render HTML;
- manipulate DOM elements;
- upload files;
- publish resources;
- create drafts;
- generate personalized PDFs;
- modify Firestore;
- write Storage objects;
- create signed URLs independently;
- determine administrator authorization;
- bypass entitlement resolution.

---

# Architectural Principles

The LearningService follows these principles:

```text
Resolver Before Rendering

Identity Before Delivery

Entitlement Before Access

Read Models Only

Presentation Independence

Fail Closed

Immutable ViewModels
```

---

# Dependencies

The LearningService depends upon:

- Firebase Authentication;
- Portal Authentication Service;
- Authorization Service;
- Entitlement Resolver;
- Learning Resource Resolver;
- Learning Resource Contract.

It consumes data from:

```text
learning_resources

learning_resource_deliveries
```

It never becomes the source of truth.

---

# Public Service Contract

The LearningService exposes the following public operations.

---

## initialize()

### Purpose

Initializes the service.

### Responsibilities

- subscribe to platform readiness;
- prepare internal state;
- initialize caches;
- register events.

### Returns

```javascript
Promise<void>
```

---

## resolveLearningResources()

### Purpose

Returns the complete learner-visible resource collection.

### Responsibilities

- invoke resolver;
- validate result;
- transform into ViewModels;
- cache current session results.

### Returns

```javascript
Promise<Array<LearningResourceViewModel>>
```

---

## getResources()

Returns all resolved resources.

```javascript
Array<LearningResourceViewModel>
```

---

## getResource(resourceId)

Returns one resolved resource.

```javascript
LearningResourceViewModel | null
```

---

## getResourcesByProgram(programCode)

Returns resources belonging to one programme.

```javascript
Array<LearningResourceViewModel>
```

---

## getResourcesByContentType(contentType)

Examples:

```text
licensed_course_material

supporting_workbook

external_video

external_link
```

Returns:

```javascript
Array<LearningResourceViewModel>
```

---

## getDownloadableResources()

Returns only:

```javascript
downloadAllowed === true
```

---

## getPreviewableResources()

Returns only:

```javascript
previewAllowed === true
```

---

## getEmbeddableResources()

Returns only:

```javascript
embedAllowed === true
```

---

## refresh()

Clears current cache and performs full re-resolution.

Returns:

```javascript
Promise<void>
```

---

## isReady()

Returns:

```javascript
Boolean
```

---

# Internal Workflow

```text
Initialize

↓

Authentication Ready

↓

Authorization Ready

↓

Entitlement Ready

↓

Invoke Resolver

↓

Validate Resources

↓

Normalize ViewModels

↓

Sort

↓

Group

↓

Cache

↓

Publish Ready Event

↓

Student Renderer
```

---

# Resolver Integration

The LearningService delegates all business decisions to the Learning Resource Resolver.

The resolver determines:

- ownership;
- entitlement;
- publication;
- lifecycle;
- availability;
- permissions.

The LearningService trusts the resolver.

It does not duplicate resolver logic.

---

# ViewModel Contract

Every learner-visible resource is represented by a LearningResourceViewModel.

Example:

```javascript
{
    deliveryId:
        "AAU-MAT-K7P4X9Q2",

    resourceId:
        "AOP-CORE-COURSE-MATERIALS",

    programCode:
        "AOP",

    title:
        "AOP — Core Course Materials",

    description:
        "Licensed course materials.",

    contentType:
        "licensed_course_material",

    contentTypeLabel:
        "Licensed Course Pack",

    moduleLabel:
        "Complete Programme",

    version:
        3,

    previewAllowed:
        true,

    downloadAllowed:
        true,

    embedAllowed:
        false,

    deliveryType:
        "protected_storage",

    learnerFileName:
        "AOP-Core-Course-Materials-AAU-AB12CD34.pdf",

    actions:
        [
            "preview",
            "download"
        ]
}
```

The ViewModel intentionally excludes:

- Firestore document IDs;
- Storage paths;
- administrator metadata;
- audit fields;
- RBAC information.

---

# Grouping Model

The service may expose grouped resources.

Example:

```javascript
{
    licensedCourseMaterials: [],
    supportingMaterials: [],
    videos: [],
    references: []
}
```

Grouping is produced by the service rather than duplicated across UI components.

---

# Sorting Policy

Recommended default ordering:

1. Programme
2. Category
3. Module
4. Display Order
5. Title

Sorting rules belong to the service layer.

---

# Readiness Events

When resource resolution completes successfully:

```javascript
document.dispatchEvent(
    new CustomEvent(
        "learning-resources:ready",
        {
            detail: {
                resources
            }
        )
    )
);
```

If resolution fails:

```javascript
document.dispatchEvent(
    new CustomEvent(
        "learning-resources:error"
    )
);
```

Presentation components subscribe to these events rather than polling.

---

# Failure Behaviour

If authentication is unavailable:

```text
Return no resources
```

If entitlement resolution fails:

```text
Return no resources
```

If one resource is malformed:

```text
Exclude resource

Continue
```

If resolver fails completely:

```text
Publish error event

Return empty collection
```

The service always fails closed.

---

# Caching Strategy

The service may cache resolved resources during the authenticated session.

Cache invalidation occurs when:

- learner signs out;
- entitlement changes;
- refresh() is invoked;
- authentication changes.

The cache must never survive beyond the authenticated session unless future offline capabilities explicitly require it.

---

# Security Rules

The LearningService must never:

- expose Storage paths;
- expose Firestore internals;
- expose raw delivery documents;
- expose unpublished resources;
- expose withdrawn resources;
- expose another learner's resources.

All outputs are learner-safe.

---

# Future Extensions

The service is designed to support future capabilities without breaking the public contract.

Examples include:

- resource search;
- favourites;
- bookmarks;
- download history;
- learning recommendations;
- AI-assisted discovery;
- recently viewed resources;
- module progression;
- adaptive resource ordering;
- analytics.

These enhancements extend the ViewModel but do not change the resolver-first architecture.

---

# Related Documents

- `learning-resource-architecture.md`
- `ADR-019-Learning-Resource-Delivery-Architecture.md`
- `FIRESTORE_COLLECTION_REFERENCE.md`
- `Learning Resource Publication Runbook`

---

# Service Status

```text
ACTIVE
LOCKED
PRODUCTION ARCHITECTURE
```

---

# End of LearningService.md