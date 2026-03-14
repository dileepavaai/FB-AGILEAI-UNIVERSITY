
# Agile AI University – Governance Architecture Pack v1.0
Date: 25 Feb 2026
Status: Governance Locked

---

# 1. Developer Quick Reference – Analytics v1.0

## DO NOT
- Add inline gtag() calls
- Insert GA scripts manually in pages
- Use different Measurement IDs
- Rename custom parameters
- Modify analytics.js partially
- Introduce new surface names

## REQUIRED

### Include Analytics Engine
Each surface must include:
shared/design-authority/js/analytics.js

(Local copy per hosting target)

### Declare Surface
Inside body:
<body data-surface="assessment">

Canonical values:
- institution
- assessment
- verification
- portal
- education

Lowercase only.

### Trigger Events Through Engine Only
window.AAUAnalytics.trackEvent({
  event_name: "assessment_completed",
  role: "leader",
  industry: "technology",
  score_band: "advanced"
});

Never call gtag() directly.

---

# 2. Institutional Event Taxonomy v1.0

## Event Naming Convention
Format:
surface_action_object

Examples:
- assessment_started
- assessment_completed
- portal_login_success
- credential_verified
- report_downloaded

## Event Classes

1. Engagement Events
   - page_view
   - session_start

2. Capability Events
   - assessment_started
   - assessment_completed

3. Credential Events
   - credential_verified
   - credential_downloaded

4. System Integrity Events
   - payment_success
   - payment_failed

## Mandatory Parameters (Assessment Completed)
- surface
- role
- industry
- score_band

No exceptions.

---

# 3. Executive Reporting Framework Model

## Board-Level Metrics

### Institutional Reach
- Total Users
- Cross-Surface Engagement

### Capability Distribution
- Score Band Distribution
- Role Segmentation
- Industry Segmentation

### Credential Trust Signals
- Verification Volume
- Credential Issuance Trends

### System Stability
- Error Rates
- Payment Failure Rates

Reports must be derived only from governed events.

---

# 4. Digital Governance Map – Agile AI University

## Layer 1 – Design Authority
shared/design-authority/
Analytics Engine
UI Standards
Security Headers

## Layer 2 – Surface Layer
institution
assessment
verification
portal
education

Each surface is self-contained per architecture rule.

## Layer 3 – Governance Artifacts
/governance/
analytics-governance-v1.md
event-taxonomy-v1.md
release-protocol.md

## Layer 4 – Institutional Intelligence
GA4 Property (Single)
Custom Dimensions Locked
Surface Registry v1.0

All changes require governance revision.
