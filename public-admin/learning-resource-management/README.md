# Agile AI University

# Admin Learning Resource Management

**Version:** 1.0.0  
**Status:** ACTIVE  
**Owning Surface:** Admin Portal  
**Owning Domain:** Learning Resource Administration

---

## Purpose

Learning Resource Management is the authoritative Admin Portal
surface for registering, uploading, publishing, versioning, and
withdrawing governed learning resources.

It supports:

- Reference materials
- Licensed course materials
- Supplementary learning resources
- Protected downloadable files
- Governed external learning links
- Programme-scoped resource publication

---

## Authority Model

The Admin Portal is the publication authority for learning resources.

The Student Portal is a governed consumer only.

```text
Administrator
    ↓
Admin Learning Resource Management
    ↓
Firestore Metadata Registry
    +
Protected Firebase Storage
    ↓
Governed Learner Consumption