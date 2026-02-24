# Agile AI University

## Single Environment Governance Model v1.0

**Status: FORMALLY LOCKED**\
**Date Locked:** 22 February 2026

------------------------------------------------------------------------

## 1. Governance Context

Agile AI University operates under a solopreneur institutional
engineering model.\
To maintain operational clarity, cost control, and governance
discipline, the system will operate under a single production
environment model.

No separate development or staging environments will be maintained at
this stage.

------------------------------------------------------------------------

## 2. Authoritative Environment

All infrastructure components operate within:

Project: FB-AgileAI-University\
Plan: Firebase Blaze (Cost-Sensitive)

Surfaces: - public-site - public-portal - public-learn -
public-assessment - public-certs

Database: Cloud Firestore\
Backend: Cloud Run (secure verification layer)

------------------------------------------------------------------------

## 3. Deployment Discipline Rules (Non-Negotiable)

1.  No direct console edits to Firestore rules or Cloud Run settings.
2.  All changes must be committed to Git before deployment.
3.  All infrastructure changes must be documented in governance records.
4.  No experimental deployments directly to public surfaces.
5.  Billing alerts must be active before infrastructure changes.

------------------------------------------------------------------------

## 4. Cost Guardrails (Mandatory)

Cloud Run must be configured as: - Min Instances = 0 - Max Instances = 1
(initial phase) - Concurrency ≤ 10 - Timeout ≤ 10 seconds - No
background triggers - No Pub/Sub - No scheduled jobs

Firestore must: - Block public reads after migration - Allow only Cloud
Run service account access

Rate limiting and reCAPTCHA validation must be active before public
exposure.

------------------------------------------------------------------------

## 5. Testing Model (Production-Safe)

Testing will occur using: - Controlled access test pages (e.g.,
verify-test.html) - Limited instance configuration - Personal IP
validation before exposure - Short deployment windows

No separate Firebase project will be created without explicit governance
revision.

------------------------------------------------------------------------

## 6. Structural Principle

The absence of multiple environments does NOT reduce governance rigor.

Safety is enforced through: - Deployment discipline - Cost guardrails -
Infrastructure caps - Institutional documentation

------------------------------------------------------------------------

## Official Lock Statement

Agile AI University\
Single Environment Governance Model v1.0\
Formally Locked and Enforceable

------------------------------------------------------------------------

End of Document
