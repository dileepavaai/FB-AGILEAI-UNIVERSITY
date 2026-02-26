# Operational Surface Governance Policy
Agile AI University

Version: 1.0  
Status: ACTIVE  
Applies To: verify.agileai.university, certs.agileai.university  

---

## 1. Purpose

Certain public-facing surfaces serve operational trust functions.
These include verification interfaces, credential validation pages,
and other decision-sensitive interfaces.

These surfaces must prioritize:
- Stability
- Predictability
- Visual consistency
- Trust continuity

They are not institutional branding surfaces.

---

## 2. Surface Classification Model

Agile AI University public surfaces are classified into two categories:

### A) Institutional Presentation Surfaces
Examples:
- agileai.university (public-site)
- academic frameworks
- research publications

Characteristics:
- Evolves over time
- May introduce design refinements
- May introduce visual indicators
- Supports institutional signaling

---

### B) Operational Trust Surfaces (FROZEN)

Examples:
- verify.agileai.university
- certs.agileai.university

Characteristics:
- Visually stable
- Change-resistant
- Architecture-preserving
- No cosmetic evolution

---

## 3. Operational Freeze Rules

For FROZEN surfaces:

DO NOT:
- Sync evolving CSS from public-site
- Introduce framework indicators
- Add version badges
- Adjust layout spacing
- Modify navigation behavior
- Introduce experimental styling

Only allowed changes:
- Security patches
- Accessibility compliance updates
- Critical bug fixes
- Structural adjustments required by third-party providers (e.g., reCAPTCHA)

---

## 4. Design Authority Isolation Rule

Each hosting target maintains its own:

shared/design-authority/

This is intentional.

Root-level design-authority is NOT runtime authoritative.

Cross-surface CSS synchronization is prohibited unless:
- Explicitly reviewed
- Approved under governance decision
- Documented in commit log

---

## 5. Governance Principle

Operational trust surfaces must feel:

- Quiet
- Stable
- Predictable
- Non-experimental

Boring is safe.
Safe builds trust.

---

Maintained by:
Agile AI University Design & Governance Authority