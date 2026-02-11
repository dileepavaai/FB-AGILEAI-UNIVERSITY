# FB-AgileAI-University

This repository is the **canonical monorepo** for Agile AI University.  
It contains the authoritative definition of Agile AI, supporting governance records, and the technical systems that enable learning, assessment, certification, and execution.

The repository is intentionally structured to **separate canon, governance, and runtime systems**, ensuring clarity, integrity, and long-term maintainability.

---

## 🧭 Repository Purpose

This repository exists to:

- Preserve the **canonical definition of Agile AI**
- Maintain **governance and decision records**
- Operate **runtime systems** (portals, assessments, payments)
- Support **learning, evaluation, and credentialing**
- Enable a **solopreneur-friendly but institution-grade architecture**

---

## 🏛 Canonical Reference (READ-ONLY BY DESIGN)

### `agileai.foundation/`
This folder contains the **Agile AI Functional Elements (v1.0)**.

- Single-page static website
- Defines **WHAT must exist** for Agile AI
- Framework-agnostic, technology-neutral
- No training, certification, or assessment logic
- Changes require explicit versioning and governance

> This is the **root authority** for Agile AI meaning.

---

## 📚 Learning & Public Surfaces

### `public-site/`
Static public website content (marketing, orientation).

### `public-assessment/`
Public-facing Agile + AI capability assessment (non-authenticated).

### `public-portal/`
Participant-facing portal surfaces (pre-auth / entry points).

### `public-certs/`
Public credential verification and certificate display.

---

## 🎓 Learning, Assessment & Credentials

Learning, assessment, and credentials are **intentionally separated** from the canonical definition:

- Learning explains **HOW** Agile AI is practiced
- Assessments determine **WHETHER** readiness exists
- Credentials represent **validated capability**, not attendance

These layers must **never redefine the canon** in `agileai.foundation`.

---

## ⚙️ Runtime & Backend Systems

### `cloudrun-portal/`
Primary backend services deployed via Google Cloud Run.

- Authentication
- Session handling
- Secure APIs
- Portal orchestration

### `razorpay-webhook/`
Payment processing and webhook handling.

---

## 🗂 Governance & Records

### `governance/`
Formal governance artifacts, including:

- Phase locks and freezes
- Architecture decisions
- Authentication governance
- Credential and trainer governance
- Versioned records and charters

These documents ensure **decision traceability and institutional discipline**.

---

## 🧰 Scripts & Tooling

### `scripts/`
Operational scripts for:
- Dependency checks
- Port checks
- Deployment helpers
- Internal validation

---

## 🔒 Design Principles for This Repo

- **Canon before commerce**
- **Reference before runtime**
- **Learning before assessment**
- **Assessment before credential**
- **Governance before scaling**

This structure is intentional and should be preserved.

---

## 🚫 What This Repo Is NOT

- Not a single deployable app
- Not a monolithic runtime
- Not a casual experiment repo
- Not a marketing-only site

Each folder serves a **distinct institutional purpose**.

---

## 📌 Contribution & Change Policy

- `agileai.foundation/` changes require explicit versioning
- Governance records must not be altered retroactively
- Runtime code may evolve independently
- No component may redefine Agile AI Functional Elements outside the foundation

---

## © Attribution

Agile AI University  
Agile AI Functional Elements v1.0

Learning, assessment, and credential systems are operated independently of the canonical definition.

---

## 🔗 Related Properties

- Canon: **https://agileai.foundation**
- Learning: **https://learn.agileai.university**
- Portal & Assessment: **https://portal.agileai.university**

---

**This repository is intentionally structured to support long-term credibility, clarity, and trust in Agile AI as a discipline.**
