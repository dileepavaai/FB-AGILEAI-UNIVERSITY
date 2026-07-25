# Learning Resource Platform — Estimate Tracker

**Document Version:** 1.0  
**Status:** ACTIVE  
**Date:** July 2026  
**Owner:** Agile AI University  
**Priority:** Revenue Generation → MVP Production Release  

---

## 1. Purpose

This document is the authoritative effort tracker for the Agile AI University Learning Resource Platform.

It records:

- Original estimated effort
- Revised estimated effort
- Actual effort
- Remaining effort
- Effort variance
- Completion percentage
- Implementation status
- Scope changes
- Risks and observations

This tracker shall be updated after every meaningful implementation block, production deployment, validation cycle, or scope decision.

---

## 2. Estimation Rules

### 2.1 Original Estimate

The original estimate is the approved baseline for the work package.

Once recorded, it shall not be overwritten.

---

### 2.2 Revised Estimate

The revised estimate reflects the latest expected total effort based on:

- implementation findings
- production behaviour
- integration complexity
- defects
- architectural changes
- scope clarification

---

### 2.3 Actual Effort

Actual effort represents time already spent implementing, validating, documenting, deploying, or correcting the work package.

Where exact historical time was not captured, the actual effort shall remain marked as:

```text
Not recorded
```

Estimated historical effort shall not be presented as confirmed actual effort.

---

### 2.4 Remaining Effort

```text
Remaining Effort = Revised Total Estimate − Actual Effort
```

Where actual effort is not available, the latest remaining estimate shall be recorded directly.

---

### 2.5 Effort Variance

For completed work:

```text
Effort Variance = Actual Effort − Original Estimate
```

For work still in progress:

```text
Forecast Variance = Revised Estimate − Original Estimate
```

Positive variance means additional effort.

Negative variance means effort saved.

---

## 3. Current Platform Estimate Baseline

### 3.1 Completed Foundation

| ID | Work Package | Original Estimate | Revised Estimate | Actual Effort | Remaining | Status | Completion | Variance |
|---|---|---:|---:|---:|---:|---|---:|---:|
| LR-01 | Learning Resource Architecture | 8–10 hrs | 8–10 hrs | Not recorded | 0 hrs | ✅ Complete | 100% | To be confirmed |
| LR-02 | Storage Architecture | 4–5 hrs | 4–5 hrs | Not recorded | 0 hrs | ✅ Complete | 100% | To be confirmed |
| LR-03 | Backend Foundation | 10–12 hrs | 10–12 hrs | Not recorded | 0 hrs | ✅ Complete | 100% | To be confirmed |
| LR-04 | Identity Integration | 6–8 hrs | 6–8 hrs | Not recorded | 0 hrs | ✅ Complete | 100% | To be confirmed |
| LR-05 | Admin Learning Resource Management Foundation | 8–10 hrs | 8–10 hrs | Not recorded | 0 hrs | ✅ Complete | 100% | To be confirmed |
| LR-06 | Documentation, Governance and ADRs | 6–8 hrs | 6–8 hrs | Not recorded | 0 hrs | ✅ Complete | 100% | To be confirmed |

### Completed Foundation Summary

| Metric | Estimate |
|---|---:|
| Original completed estimate | 42–53 hrs |
| Revised completed estimate | 42–53 hrs |
| Confirmed actual effort | Not historically recorded |
| Remaining foundation effort | 0 hrs |

---

## 4. Remaining MVP Work

| ID | Work Package | Original Estimate | Revised Estimate | Actual Effort | Remaining Estimate | Status | Completion | Forecast Variance |
|---|---|---:|---:|---:|---:|---|---:|---:|
| LR-07 | Admin HTML alignment with ADR-021 and ADR-022 | 1.5–2 hrs | 1.5–2 hrs | 0 hrs | 1.5–2 hrs | ⏳ Not Started | 0% | 0 hrs |
| LR-08 | Admin assignment renderer and UI behaviour | 2–3 hrs | 2–3 hrs | 0 hrs | 2–3 hrs | ⏳ Not Started | 0% | 0 hrs |
| LR-09 | Admin controller integration | 1.5–2.5 hrs | 1.5–2.5 hrs | 0 hrs | 1.5–2.5 hrs | ⏳ Not Started | 0% | 0 hrs |
| LR-10 | Assignment service validation and metadata | 2–3 hrs | 2–3 hrs | 0 hrs | 2–3 hrs | ⏳ Not Started | 0% | 0 hrs |
| LR-11 | Duplicate assignment protection | 1–1.5 hrs | 1–1.5 hrs | 0 hrs | 1–1.5 hrs | ⏳ Not Started | 0% | 0 hrs |
| LR-12 | Admin production deployment and live validation | 2–3 hrs | 2–3 hrs | 0 hrs | 2–3 hrs | ⏳ Not Started | 0% | 0 hrs |
| LR-13 | Admin workflow bug-fixing buffer | 1–2 hrs | 1–2 hrs | 0 hrs | 1–2 hrs | ⏳ Not Started | 0% | 0 hrs |
| LR-14 | Student Portal licensed material presentation | 2–3 hrs | 2–3 hrs | 0 hrs | 2–3 hrs | ⏳ Not Started | 0% | 0 hrs |
| LR-15 | Final end-to-end production validation | 2–4 hrs | 2–4 hrs | 0 hrs | 2–4 hrs | ⏳ Not Started | 0% | 0 hrs |

---

## 5. Remaining Effort Summary

| Area | Remaining Estimate |
|---|---:|
| Admin assignment workflow | 11–17 hrs |
| Student Portal presentation | 2–3 hrs |
| Final end-to-end validation | 2–4 hrs |
| **Total Remaining MVP Effort** | **15–24 hrs** |

---

## 6. Overall Platform Effort Forecast

| Metric | Estimate |
|---|---:|
| Completed foundation estimate | 42–53 hrs |
| Remaining MVP estimate | 15–24 hrs |
| **Forecast total platform effort** | **57–77 hrs** |
| Confirmed historical actual effort | Not recorded |
| Overall completion by work-package status | Approximately 70–75% |
| Current delivery forecast | 2–3 focused working days |

The completion percentage is directional because confirmed historical actual hours were not consistently recorded.

---

## 7. Current Implementation Order

### Sprint 1 — Admin UI Alignment

- Align `index.html` with ADR-021
- Align assignment behaviour with ADR-022
- Rename access terminology to permanent assignment terminology
- Add permanent ownership notice
- Remove duplicated release controls from learner assignment
- Preserve identity-first pending activation workflow

Estimated effort:

```text
1.5–2 hours
```

---

### Sprint 2 — Admin Assignment Behaviour

- Update renderer
- Update controller
- Update assignment service
- Add validation
- Add immutable assignment confirmation
- Add duplicate assignment protection

Estimated effort:

```text
6.5–10 hours
```

---

### Sprint 3 — Student Portal

- Display Licensed Course Material
- Display assigned programme version
- Provide governed preview
- Provide governed download
- Remove latest-version and automatic-upgrade language

Estimated effort:

```text
2–3 hours
```

---

### Sprint 4 — Production Validation

Validate the complete production workflow:

```text
Admin creates resource
        ↓
Admin uploads protected PDF
        ↓
Admin publishes resource
        ↓
Admin creates permanent learner assignment
        ↓
Pending learner activates identity
        ↓
Assignment binds to learner_uid
        ↓
Learner signs in
        ↓
Learner previews assigned material
        ↓
Learner downloads assigned material
```

Estimated effort:

```text
2–4 hours
```

---

## 8. Implementation Update Log

| Update | Date | Work Package | Previous Estimate | Revised Estimate | Actual Effort | Remaining | Variance | Status | Notes |
|---:|---|---|---:|---:|---:|---:|---:|---|---|
| 001 | July 2026 | Estimate tracker established | — | 15–24 hrs remaining | 0 hrs tracked from baseline | 15–24 hrs | — | ACTIVE | Initial authoritative MVP estimate baseline |

---

## 9. Work Package Completion Template

Copy this row after each implementation block:

```markdown
| 002 | YYYY-MM-DD | LR-XX — Work package name | X hrs | X hrs | X hrs | X hrs | +/− X hrs | Complete / In Progress / Blocked | Implementation result and production observations |
```

---

## 10. Detailed Session Tracking Template

### Implementation Session

**Date:**  
**Work Package:**  
**Files Modified:**  
**Start Status:**  
**End Status:**  

| Metric | Effort |
|---|---:|
| Estimate before implementation | 0 hrs |
| Actual effort during session | 0 hrs |
| Revised remaining effort | 0 hrs |
| Forecast variance | 0 hrs |

### Changes Completed

- 

### Validation Completed

- 

### Defects Found

- 

### Deferred Items

- 

### Estimate Adjustment Reason

- No change / implementation complexity / integration dependency / production defect / scope clarification

---

## 11. Scope Governance

The following items remain outside the MVP estimate:

- Version-history browsing
- Update notifications
- Assignment analytics
- Assignment dashboard
- Bulk assignment
- Assignment templates
- Advanced audit
- Reference-material recommendation engine
- Commercial learning-resource catalogue
- Learning subscriptions
- Enterprise release-governance enhancements
- Automatic assignment migration
- Automatic version replacement

These items shall not be introduced into the MVP unless they directly block:

- learner activation
- programme registration
- payment
- credential delivery
- licensed material assignment
- protected preview
- protected download
- revenue generation

---

## 12. Current Risks

| Risk | Impact | Probability | Current Response |
|---|---|---|---|
| Existing assignment service may contain legacy access-governance assumptions | Medium | Medium | Review before modification |
| UI and backend field contracts may not fully match | High | Medium | Validate HTML, controller and service together |
| Production-only deployment may expose integration defects | High | Medium | Deploy focused changes and validate immediately |
| Duplicate assignment behaviour may already exist in another form | Medium | Medium | Inspect current service before adding logic |
| Personalized PDF path may require metadata alignment | Medium | Medium | Validate Storage and assignment contracts |
| Pending activation binding may expose identity reconciliation defects | High | Low–Medium | Test both pre-login and activated learner paths |

---

## 13. Locked Architectural Decisions

The estimate assumes continued compliance with:

- ADR-015 — Identity Authority
- ADR-016 — Alumni Activation
- ADR-019 — Learning Resource Delivery Architecture
- ADR-020 — Governed Learning Resource Release Architecture
- ADR-021 — Licensed Course Material Entitlement Model
- ADR-022 — Immutable Learner Assignment

The estimate excludes redesign of these accepted decisions.

---

## 14. Current Authoritative Estimate

As of July 2026:

```text
Completed Foundation Estimate: 42–53 hours

Remaining MVP Estimate: 15–24 hours

Forecast Total Platform Effort: 57–77 hours

Expected Remaining Duration:
2 focused working days at the fastest
3 working days with production debugging and hardening
```

---

## 15. Next Update Trigger

Update this document immediately after completing:

```text
LR-07 — Admin HTML alignment with ADR-021 and ADR-022
```

The next update shall record:

- actual implementation time
- revised renderer estimate
- newly discovered dependencies
- defects found
- revised total remaining effort
- effort variance