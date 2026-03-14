# Agile AI University

## Infrastructure Governance Baseline v1.0

**Status: LOCKED**\
**Date Generated:** 22 February 2026

------------------------------------------------------------------------

## 1. Institutional Positioning (Locked)

Agile AI University operates as an independent academic and professional
body.\
It defines structured academic frameworks and capability standards.\
It is not positioned as a commercial training provider.

All infrastructure decisions must preserve neutrality, credibility, and
governance discipline.

------------------------------------------------------------------------

## 2. Infrastructure Overview

**Project:** FB-AgileAI-University\
**Plan:** Firebase Blaze (Cost-Sensitive)\
**Hosting:** Firebase Hosting\
**Database:** Cloud Firestore\
**Secure Backend:** Cloud Run (Migration Phase Initiated)

------------------------------------------------------------------------

## 3. Development Environment (Frozen)

### Operating System

Windows 10 / Windows 11 (Stable channel only)

### IDE

Visual Studio Code (Auto-update disabled)

### Node Runtime

Node.js 18.x LTS (Explicitly pinned)\
No floating or "latest" tags permitted.

### Package Discipline

-   package-lock.json committed
-   No caret (\^) drift in production
-   No beta packages
-   Minimal dependency model

------------------------------------------------------------------------

## 4. Firebase Stack

-   Firebase Hosting
-   Cloud Firestore (Native Mode)
-   Firebase CLI (Version frozen at last verified deployment)

No Cloud Functions permitted.

------------------------------------------------------------------------

## 5. Cloud Run Governance Constraints

-   Min Instances = 0
-   Max Instances = 1 or 2
-   Concurrency capped (\~10)
-   Timeout capped (10 seconds)
-   No background triggers
-   No Pub/Sub
-   No scheduled jobs
-   No always-on services

------------------------------------------------------------------------

## 6. Data Model (Locked)

### credentials collection

-   credential_id (unique)
-   email (lowercase)
-   full_name
-   credential_type
-   program_code
-   issued_by
-   issued_status ("finalized")
-   approval_status ("approved")

### verification_requests collection

-   credential_id OR email
-   source
-   created_at
-   ip_hash (future)
-   recaptcha_score (future)

No structural changes without explicit approval.

------------------------------------------------------------------------

## 7. Security Posture (Target)

-   Server-side reCAPTCHA validation
-   IP-based in-memory rate limiting
-   Firestore public reads removed (Phase 2)
-   Minimal JSON response model
-   Enumeration protection enforced

------------------------------------------------------------------------

## 8. Cost-Control Governance

-   No uncontrolled scaling
-   No background compute
-   No persistent services
-   Billing alerts required
-   Blaze plan monitored

------------------------------------------------------------------------

## Official Baseline Designation

Agile AI University\
Infrastructure Baseline v1.0\
Pre--Cloud Run Secure Migration\
Software Stack Frozen

------------------------------------------------------------------------

End of Document
