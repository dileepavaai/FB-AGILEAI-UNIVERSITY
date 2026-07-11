# Agile AI University

# Admin Portal Architecture

---

# Document Information

| Attribute | Value |
|---|---|
| **Document** | Admin Portal Architecture |
| **File** | `admin-portal-architecture.md` |
| **Version** | **1.0.0** |
| **Status** | **ACTIVE** |
| **Architecture Status** | **LOCKED** |
| **Classification** | Enterprise Platform Architecture |
| **Owner** | Agile AI University |
| **Authority** | Administrative Operations Platform |
| **Parent Architecture** | Agile AI University Enterprise Architecture & System Context |
| **Last Updated** | July 2026 |

---

# Document Governance

## Status

**LOCKED**

This document defines the permanent architecture of the Agile AI University Admin Portal.

The Admin Portal inherits all enterprise principles, ownership boundaries, security requirements, runtime rules, service standards, and governance decisions defined by the Agile AI University Enterprise Architecture & System Context.

This document defines platform architecture.

It does not replace domain architecture, subsystem governance, implementation documentation, or Architecture Decision Records.

---

# 1. Platform Overview

## Introduction

The Admin Portal is the authorised administrative operations platform of the Agile AI University Enterprise Platform.

It provides governed operational capabilities for administrators responsible for programme administration, credential operations, credential asset generation, publication, registry management, audit, and future enterprise administration.

The Admin Portal is not a learner-facing platform.

It does not provide the Student & Executive Portal experience, learner dashboards, credential portfolios, learning consumption, or other learner self-service capabilities.

The Admin Portal performs governed enterprise operations on behalf of authorised administrative users.

---

# 2. Purpose

The purpose of the Admin Portal is to provide a secure, auditable, and extensible enterprise administration environment.

Its responsibilities include:

- Administrative authentication and authorization
- Credential search and inspection
- Credential approval operations
- Certificate generation
- Trainer certificate generation
- Digital badge generation
- Credential asset publishing
- Registry administration
- Programme administration
- Recognition administration
- Operational audit
- Future registration and payment administration

The Admin Portal acts as an operational platform.

Enterprise Domains and Enterprise Services remain the owners of business rules and institutional records.

---

# 3. Enterprise Position

The Admin Portal occupies the administrative execution layer of the enterprise.

```text
Enterprise Governance

↓

Enterprise Domains

↓

Enterprise Services

↓

Enterprise Registries

↓

Admin Portal

↓

Authorised Administrative User