# Agile AI University

# Enterprise Naming Conventions

**Version:** 1.0.0

**Status:** ACTIVE

**Classification:** Enterprise Engineering Standard

**Last Updated:** July 2026

---

# Purpose

The Enterprise Naming Conventions establish the approved naming rules for repositories, folders, files, platforms, domains, enterprise services, APIs, source code, data structures, configuration, infrastructure, releases, branches, and operational artefacts across the Agile AI University ecosystem.

Consistent naming improves:

- Clarity
- Maintainability
- Discoverability
- Architectural alignment
- Governance
- Developer productivity
- Long-term scalability

Naming is an architectural concern.

---

# Objectives

This standard exists to:

- Establish a common naming language
- Eliminate avoidable ambiguity
- Improve repository navigation
- Support enterprise terminology
- Reduce inconsistent implementation
- Improve searchability
- Preserve domain ownership
- Enable predictable growth

---

# Governing Principles

All names should be:

- Clear
- Descriptive
- Consistent
- Stable
- Business-oriented
- Technology-independent where practical
- Aligned with approved enterprise terminology

Avoid names that are:

- Ambiguous
- Overly abbreviated
- Temporary
- Generic
- Implementation-specific without need
- Inconsistent with Domain ownership

---

# Terminology Authority

Naming shall follow:

- `enterprise-glossary.md`
- `enterprise-terminology.md`
- `architectural-principles.md`
- `coding-standards.md`
- `documentation-standards.md`

Where terminology conflicts exist, the Enterprise Terminology Standard takes precedence.

---

# Agile AI Naming

Use:

```text
Agile AI
```

Do not use:

```text
Agile + AI
Agile & AI
Agile and AI
AI and Agile
AI + Agile
```

Approved abbreviation:

```text
AAU
```

for:

```text
Agile AI University
```

Use abbreviations only where they are already approved and unambiguous.

---

# Repository Naming

Repository names should be:

- Descriptive
- Stable
- Hyphen-separated
- Consistent with the institutional scope

Current canonical repository:

```text
FB-AgileAI-University
```

Future repository examples:

```text
agileai-university-platform
agileai-enterprise-services
agileai-verification-platform
```

Avoid:

```text
new-repo
test-project
final-version
app2
misc
```

---

# Top-Level Folder Naming

Top-level folders should represent stable enterprise concerns or deployable surfaces.

Approved examples:

```text
docs/
public-site/
public-admin/
public-portal/
public-assessment/
public-learn/
public-certs/
shared/
scripts/
source/
overrides/
```

Folder names should use:

```text
lowercase-hyphen-separated
```

Avoid spaces, underscores, or inconsistent capitalization.

Use:

```text
enterprise-services/
```

Avoid:

```text
EnterpriseServices/
enterprise_services/
enterprise services/
```

---

# Documentation Folder Naming

Numbered documentation folders should follow:

```text
NN-purpose/
```

Examples:

```text
01-system/
02-governance/
03-architecture/
04-decisions/
05-estimates/
06-roadmap/
07-api/
08-enterprise-services/
09-operational/
10-runbooks/
11-reference/
```

Numbers define the approved reading order.

Do not renumber folders casually.

Structural changes require documentation governance review.

---

# Markdown File Naming

Markdown files should normally use:

```text
lowercase-hyphen-separated.md
```

Examples:

```text
enterprise-glossary.md
payment-domain-architecture.md
portal-system-context.md
architectural-principles.md
```

Approved uppercase repository-standard files include:

```text
README.md
CONTRIBUTING.md
LICENSE.md
ARCHITECTURE_INDEX.md
API_CATALOG.md
PLATFORM_ARCHITECTURE_STANDARD.md
DOMAIN_ARCHITECTURE_STANDARD.md
INTEGRATION_ARCHITECTURE_STANDARD.md
RUNTIME_ARCHITECTURE_STANDARD.md
SECURITY_ARCHITECTURE_STANDARD.md
```

Uppercase file names should be reserved for prominent repository standards or indexes.

---

# System Context Naming

System Context files should follow:

```text
<scope>-system-context.md
```

Examples:

```text
portal-system-context.md
credential-system-context.md
recognition-system-context.md
trainer-system-context.md
```

The enterprise-level context may use:

```text
agileai-enterprise-architecture-system-context.md
```

---

# Architecture Document Naming

Domain architecture files:

```text
<domain-name>-domain-architecture.md
```

Examples:

```text
programme-domain-architecture.md
payment-domain-architecture.md
credential-asset-domain-architecture.md
```

Platform architecture files:

```text
<platform-name>-architecture.md
```

Examples:

```text
admin-portal-architecture.md
verification-platform-architecture.md
student-executive-portal-architecture.md
```

Integration architecture files:

```text
<integration-name>-integration-architecture.md
```

Runtime architecture files:

```text
<runtime-name>-runtime-architecture.md
```

Security architecture files:

```text
<security-area>-security-architecture.md
```

---

# Architecture Decision Record Naming

ADR files should follow:

```text
ADR-NNN-short-title.md
```

Examples:

```text
ADR-007-registration-architecture.md
ADR-008-payment-architecture.md
ADR-009-enterprise-integration.md
```

Use three-digit numbering for future consistency.

ADR numbers shall never be reused.

Superseded ADRs remain in the repository.

---

# Enterprise Domain Naming

Use:

```text
<Business Capability> Domain
```

Examples:

```text
Programme Domain
Registration Domain
Payment Domain
Learning Domain
Assessment Domain
Credential Domain
Credential Asset Domain
Recognition Domain
Verification Domain
Executive Services Domain
```

Do not use `module`, `feature`, or `component` when referring to a governed business Domain.

---

# Enterprise Service Naming

Enterprise Services shall use:

```text
<Capability>Service
```

Examples:

```text
ProgramService
RegistrationService
PaymentService
LearningService
AssessmentService
CredentialService
CredentialAssetService
RecognitionService
VerificationService
ExecutiveInsightService
```

Service names use PascalCase and no spaces.

A service name should reflect the capability it exposes, not the platform consuming it.

Avoid:

```text
PortalCredentialService
AdminPaymentService
StudentProgramService
```

unless a genuinely separate platform-specific service is architecturally approved.

---

# Service Specification File Naming

Current canonical service specification files use:

```text
<ServiceName>.md
```

Examples:

```text
ProgramService.md
PaymentService.md
CredentialAssetService.md
```

This convention is approved for `docs/08-enterprise-services/`.

Do not mix naming styles within that folder.

---

# API Naming

Human-readable API names should use:

```text
<Capability> API
```

Examples:

```text
Program API
Registration API
Payment API
Credential API
Verification API
```

API specification files should use:

```text
<capability>-api.md
```

Examples:

```text
program-api.md
payment-api.md
verification-api.md
```

API routes should use plural resource nouns where appropriate:

```text
/programmes
/registrations
/payments
/credentials
/recognitions
/verifications
```

Use lowercase path segments and hyphens for multi-word resources:

```text
/credential-assets
/executive-insights
```

Avoid verbs in resource paths unless the operation is not naturally resource-oriented.

Preferred:

```text
POST /payments/{paymentId}/verification
```

Avoid:

```text
POST /verifyPayment
```

Provider callbacks may use explicit action-oriented paths where required:

```text
/webhooks/razorpay
```

---

# JavaScript File Naming

JavaScript files should use:

```text
lowercase-hyphen-separated.js
```

Examples:

```text
credential-service.js
payment-service.js
dashboard-renderer.js
credential-detail-overlay.js
resolve-portal-entitlements.js
```

The file name should describe the primary responsibility.

Avoid:

```text
utils2.js
new-code.js
functions.js
temp.js
final.js
```

---

# JavaScript Object and Class Naming

Constructors, classes, service objects, controllers, renderers, and components should use PascalCase.

Examples:

```javascript
ProgramService
CredentialService
DashboardController
CredentialDetailOverlay
CredentialAssetPublisher
```

Instances and local variables should use camelCase.

Examples:

```javascript
programService
credential
paymentOrder
dashboardModel
```

---

# Function Naming

Functions and methods should use camelCase and begin with a clear action verb.

Approved patterns:

```javascript
createRegistration()
verifyPayment()
loadDashboard()
resolveEntitlements()
getCredentialById()
publishCredentialAsset()
renderCredentialCard()
```

Common verb guidance:

| Verb | Use |
|---|---|
| `get` | Retrieve a specific value or entity |
| `list` | Retrieve a collection |
| `load` | Retrieve and prepare broader runtime content |
| `create` | Create a new entity |
| `update` | Modify an existing entity |
| `delete` | Remove or retire an entity where permitted |
| `resolve` | Determine governed business state |
| `validate` | Check input or state |
| `verify` | Establish authenticity or truth |
| `publish` | Make a governed artefact available |
| `render` | Produce presentation output |
| `open` | Open a UI experience |
| `initialize` | Prepare a component or runtime |
| `build` | Construct a model or compound object |

Avoid vague names such as:

```javascript
doIt()
processThing()
runTask()
handleData()
manage()
```

`handle` may be used for a clearly scoped event handler:

```javascript
handleCredentialClick()
handlePaymentCallback()
```

---

# Boolean Naming

Boolean variables should read as true-or-false statements.

Examples:

```javascript
isEligible
isPublished
hasCredential
canUpgrade
shouldRender
paymentVerified
```

Avoid:

```javascript
eligibleFlag
statusBoolean
checkValue
```

---

# Constant Naming

Immutable constants should use:

```text
UPPER_SNAKE_CASE
```

Examples:

```javascript
PAYMENT_STATUS
CREDENTIAL_TYPES
DEFAULT_CURRENCY
MAX_RETRY_COUNT
```

Configuration objects that function as named modules may use PascalCase when consistent with the codebase.

Avoid unexplained magic strings and numbers.

---

# HTML ID Naming

HTML IDs should use:

```text
lowercase-hyphen-separated
```

Examples:

```html
credential-detail-overlay
upgrade-registration-form
payment-status-message
```

IDs must be unique within a document.

Do not use styling-only names:

```html
blue-box
left-panel
big-text
```

Use responsibility-oriented names.

---

# CSS Class Naming

CSS classes should use:

```text
lowercase-hyphen-separated
```

Examples:

```css
.credential-card
.credential-detail-overlay
.dashboard-widget
.upgrade-registration-form
```

State classes should use a clear state convention:

```css
.is-open
.is-loading
.is-disabled
.has-error
```

JavaScript hook classes may use:

```css
.js-view-credential
.js-open-digital-badge
```

JavaScript hook classes should not carry styling responsibilities where practical.

---

# Data Attribute Naming

Custom HTML data attributes should use:

```text
data-lowercase-hyphen-separated
```

Examples:

```html
data-credential-id
data-asset-type
data-programme-code
```

Data attribute values should use stable identifiers rather than display labels where possible.

---

# Firestore Collection Naming

Firestore collections should use:

```text
lowercase_snake_case
```

when aligned with the established data model.

Approved examples:

```text
credentials
credential_assets
registrations
payments
recognitions
programmes
```

Existing canonical collection names shall not be renamed solely for stylistic consistency.

New collection names require Domain ownership and governance review.

---

# Firestore Document ID Naming

Document IDs should be:

- Stable
- Deterministic where useful
- Unique
- Independent of display text
- Safe for long-term reference

Approved credential ID format:

```text
AAU-[A-Z0-9]{8}
```

Example:

```text
AAU-KO9JK02Z
```

Credential Asset document identity:

```text
{credentialId}_{assetType}
```

Example:

```text
AAU-KO9JK02Z_university_certificate
```

Do not use mutable names or email addresses as permanent institutional IDs unless explicitly approved.

---

# Firestore Field Naming

Firestore fields should follow the canonical schema for the owning Domain.

Where snake_case is already established, continue using it consistently.

Examples:

```text
credential_id
asset_type
storage_path
published_at
published_by
program_code
approval_status
issued_status
```

Do not mix equivalent styles in the same schema:

```text
credentialId
credential_id
CredentialID
```

Schema changes require migration and compatibility consideration.

---

# Credential Asset Type Naming

Canonical asset-type values:

```text
university_certificate
trainer_certificate
digital_badge
recognition_asset
```

Future asset types should use:

```text
lowercase_snake_case
```

Values must represent stable business types rather than template file names.

---

# Storage Path Naming

Storage paths should be:

- Predictable
- Hierarchical
- Stable
- Domain-aligned
- Free from unnecessary personal information

Recommended pattern:

```text
credential-assets/{credentialId}/{assetType}/{version}/{filename}
```

Example:

```text
credential-assets/AAU-KO9JK02Z/university_certificate/v1/certificate.pdf
```

Avoid spaces and unstable display names in storage paths.

---

# Environment Variable Naming

Environment variables should use:

```text
UPPER_SNAKE_CASE
```

Examples:

```text
FIREBASE_PROJECT_ID
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
PORTAL_BASE_URL
PAYMENT_WEBHOOK_SECRET
```

Secrets shall never be committed to source control.

Public client configuration and server secrets must remain clearly separated.

---

# Configuration Key Naming

JavaScript configuration keys should use camelCase unless an external contract requires another format.

Examples:

```javascript
projectId
portalBaseUrl
paymentGateway
offerEndsOn
```

Do not expose secret configuration to browser environments.

---

# Event Naming

Business events should use past-tense business outcomes.

Examples:

```text
RegistrationCreated
PaymentVerified
LearningActivated
AssessmentCompleted
CredentialIssued
CredentialAssetPublished
RecognitionGranted
```

Events should describe what happened.

Avoid UI-oriented event names such as:

```text
ButtonClicked
FormSubmitted
PageOpened
```

unless they are explicitly analytics events rather than Domain events.

---

# Status Value Naming

Machine-readable status values should use:

```text
lowercase_snake_case
```

Examples:

```text
pending
verification_pending
partially_refunded
pending_approval
published
archived
```

Human-readable labels may use title case:

```text
Verification Pending
Partially Refunded
Pending Approval
```

Do not store display formatting as the authoritative state value.

---

# Version Naming

Document and component versions should follow semantic versioning where practical:

```text
MAJOR.MINOR.PATCH
```

Examples:

```text
1.0.0
1.1.0
2.0.0
```

Guidance:

- **MAJOR** — breaking architectural or contract change
- **MINOR** — backward-compatible capability addition
- **PATCH** — correction or backward-compatible fix

---

# Release Naming

Enterprise releases should use:

```text
Release X.Y
```

Examples:

```text
Release 1.0
Release 1.1
Release 2.0
```

Named milestones may supplement, but not replace, the release number.

Example:

```text
Release 1.0 — Credential Platform
```

---

# Git Branch Naming

For the current solopreneur direct-to-production model, the canonical production branch is:

```text
main
```

Future feature branches, when used, should follow:

```text
feature/short-description
fix/short-description
docs/short-description
release/version
hotfix/short-description
```

Examples:

```text
feature/payment-verification
fix/credential-asset-preview
docs/service-specifications
hotfix/portal-authentication
```

Avoid personal names or vague branch names.

---

# Git Commit Naming

Commit messages should be concise, imperative, and scope-aware.

Recommended format:

```text
type: concise description
```

Approved examples:

```text
docs: complete enterprise architecture foundation
feat: publish credential assets from admin portal
fix: restore upgrade recommendation rendering
refactor: separate asset publication from generation
chore: update Firebase configuration
```

Common types:

```text
feat
fix
docs
refactor
test
chore
build
ci
perf
revert
```

---

# Git Tag Naming

Release tags should use:

```text
vMAJOR.MINOR.PATCH
```

Example:

```text
v1.0.0
```

Architecture milestone tags may use:

```text
v1.0-enterprise-foundation
```

Tags shall be:

- Unique
- Descriptive
- Immutable after publication
- Associated with a committed state

---

# Deployment Target Naming

Deployment targets should reflect the platform or environment.

Examples:

```text
public-site
public-portal
public-admin
public-assessment
public-certs
```

Avoid generic deployment labels such as:

```text
site1
app-new
final-hosting
```

---

# Environment Naming

Approved environment names:

```text
development
test
staging
production
```

Where the current operating model uses production only, documentation should explicitly state that limitation.

Do not call production:

```text
live-test
main-env
final
```

---

# Logging Field Naming

Structured log fields should use stable camelCase or the established platform convention.

Examples:

```text
correlationId
serviceName
operation
actorId
entityId
result
errorCode
timestamp
```

Do not log sensitive values.

---

# Audit Field Naming

Recommended audit attributes include:

```text
actor_id
actor_role
operation
target_type
target_id
previous_state
new_state
source
result
correlation_id
created_at
```

The final schema shall remain consistent within the Audit Domain or Audit Service.

---

# Date and Time Naming

Timestamp fields should clearly indicate meaning.

Examples:

```text
created_at
updated_at
published_at
verified_at
issued_at
expires_at
```

Avoid ambiguous fields:

```text
date
time
timestamp1
lastDate
```

Use UTC for persisted machine timestamps unless a documented requirement states otherwise.

---

# User and Identity Naming

Use business-role terms where appropriate:

```text
learner
administrator
trainer
executive
member
```

Use stable identity fields such as:

```text
user_id
learner_id
administrator_id
```

Avoid conflating identity with role.

A user may hold multiple roles.

---

# Programme Code Naming

Programme codes should use approved uppercase identifiers.

Examples:

```text
AIPA
AAIA
AAIP
AIAL
AISD
```

Programme codes are stable identifiers.

Programme names may evolve through governed metadata.

Do not create new programme codes without academic and architectural governance.

---

# Platform Naming

Approved platform names include:

```text
Public Website
Student & Executive Portal
Admin Portal
Assessment Platform
Verification Platform
Enterprise Shared Services Platform
```

Use the full approved name in formal documentation.

Shorter names may be used only when context is unambiguous.

---

# Avoided Naming Patterns

Avoid:

```text
new
old
final
latest
temp
test2
copy
backup
misc
common
helper
manager
processor
data
thing
```

These terms may be used only when they express a precise and governed responsibility.

Prefer:

```text
credential-asset-publisher.js
payment-verification-service.js
registration-status-resolver.js
```

over:

```text
payment-manager.js
credential-helper.js
new-service.js
```

---

# Backward Compatibility

Existing canonical names should not be changed casually.

Renaming may affect:

- Imports
- Routes
- Firestore rules
- Storage paths
- APIs
- URLs
- Analytics
- Audit references
- External consumers

Before renaming:

1. Identify all consumers.
2. Assess compatibility impact.
3. Define migration.
4. Update documentation.
5. Record an ADR where architecturally significant.
6. Preserve aliases temporarily where required.

---

# Governance

These naming conventions apply across the Agile AI University ecosystem.

New naming conventions should not be introduced independently within a single platform.

Exceptions require documented justification.

Canonical business names, IDs, routes, collection names, and public URLs require controlled governance.

---

# Review Checklist

Before introducing a new name, confirm:

- Does it use approved enterprise terminology?
- Is the owning Domain clear?
- Is it descriptive?
- Is it stable?
- Is it consistent with related artefacts?
- Does it avoid unnecessary abbreviation?
- Does it expose an implementation detail unnecessarily?
- Could it conflict with an existing name?
- Will it remain understandable in the future?
- Does it require migration or an ADR?

---

# Related Documentation

- Enterprise Glossary
- Enterprise Terminology Standard
- Enterprise Architectural Principles
- Enterprise Development Standards
- Enterprise Coding Standards
- Enterprise Documentation Standards
- Enterprise Architecture Patterns
- Architecture Decision Records

---

# Summary

The Enterprise Naming Conventions establish the official naming rules for the Agile AI University ecosystem.

By applying consistent names across repositories, documentation, platforms, Domains, Enterprise Services, APIs, source code, registries, storage, configuration, releases, and operations, the enterprise improves clarity, maintainability, governance, discoverability, and long-term architectural integrity.

---

**Status:** ACTIVE

**Classification:** Enterprise Engineering Standard

---

*"Clear names reveal architecture. Consistent names preserve it."*