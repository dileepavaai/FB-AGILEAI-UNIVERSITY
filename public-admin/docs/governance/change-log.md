# Agile AI University

## Governance Change Log

---

### 2026-06-07

#### Credential Operations Suite

#### Phase 1B – Certificate Preview Rendering

Status: Released

Summary:

* Added certificate preview rendering capability.
* Preserved existing credential registry lookup functionality.
* Established certificate-template.html as the canonical certificate layout authority.
* Preview rendering now uses live credential registry data.
* No backend changes required.
* No Firestore changes required.
* No Cloud Run deployment required.

Governance Lock:

* certificate-template.html is the canonical certificate layout authority.
* certificate-generator.js may populate template placeholders but must not contain certificate markup.
* Preview rendering, PDF generation, certificate download, and future publication workflows must reuse the same certificate template.
* Duplicate certificate layouts are prohibited.

Impact:

* Frontend only.
* Non-breaking enhancement.
* Existing Phase 1A functionality preserved.
