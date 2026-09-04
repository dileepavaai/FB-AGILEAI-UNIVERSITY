# LAAU

# ADR-011 — Backend Service Boundaries

**Version:** 1.0  
**Status:** ACTIVE  
**Decision Status:** LOCKED  
**Decision Type:** Enterprise Architecture  
**Date:** July 2026  
**Owner:** LAAU Architecture Authority  
**Architect:** Dileep Appupillai  

---

# 1. Decision Title

Separation of Backend Responsibilities Between `aau-backend` and `cloudrun-portal`

---

# 2. Context

The LAAU platform currently contains two backend runtime areas:

```text
aau-backend/
cloudrun-portal/