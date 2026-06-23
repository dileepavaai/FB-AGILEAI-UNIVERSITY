/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Credential Registry

File        : credential-registry.js
Version     : 1.0.0
Status      : ACTIVE

Governance  : Portal Governance v1.0

## Purpose

Single Source of Truth for credential definitions
used throughout the Student & Executive Portal.

## Architectural Position

Authentication
↓
Entitlements
↓
Resolver
↓
Credential Service
↓
Credential Registry
↓
Credential Renderer

## Responsibilities

* Define credential metadata
* Define display names
* Define credential descriptions
* Define issuer information
* Define validity metadata
* Define LinkedIn metadata

## Must Never

* Query APIs
* Query Firestore
* Resolve Entitlements
* Perform Authorization
* Render UI
* Store User Data

## Governance Rules

* Registry is display metadata only
* Registry is append-only
* Existing credential codes must not change
* Existing credential definitions must remain
  backward compatible

## Dependencies

None

## Consumed By

credential-renderer.js

## Change History

v1.0.0

* Initial governed implementation
* Added AAIA credential definition
* Added AIPA credential definition
* Established registry governance

===================================================== */

(function () {

"use strict";

window.AAIU_CREDENTIAL_REGISTRY = {

/* =====================================================
   AAIA — Agentic AI Agilist
   ===================================================== */
AAIA: {

  code: "AAIA",

  full_title: "Agentic AI Agilist",

  full_name: "Agentic AI Agilist",

  display_name:
    "Agentic AI Agilist (AAIA)",

  credential_type:
    "Professional Credential",

  issuer:
    "Agile AI University",

  validity:
    "Lifetime",

  description:
    "A professional credential recognizing applied capability in Agentic AI systems, decision intelligence, and responsible AI practice.",

  linkedin: {

    organization:
      "Agile AI University",

    credential_type:
      "CERTIFICATION"

  }

},

/* =====================================================
   AIPA — Artificial Intelligence Professional Agilist
   ===================================================== */
AIPA: {

  code: "AIPA",

  full_title:
    "Artificial Intelligence Professional Agilist",

  full_name:
    "Artificial Intelligence Professional Agilist",

  display_name:
    "Artificial Intelligence Professional Agilist (AIPA)",

  credential_type:
    "Professional Credential",

  issuer:
    "Agile AI University",

  validity:
    "Lifetime",

  description:
    "A professional credential recognizing applied capability in leveraging Agile AI to unlock organizational agility, while leading responsible and ethical AI adoption.",

  linkedin: {

    organization:
      "Agile AI University",

    credential_type:
      "CERTIFICATION"

  }

},

/* =====================================================
   AOP — Agile Outcome Practitioner
   ===================================================== */
AOP: {

  code: "AOP",

  full_title:
    "Agile Outcome Practitioner",

  full_name:
    "Agile Outcome Practitioner",

  display_name:
    "Agile Outcome Practitioner (AOP)",

  credential_type:
    "Professional Credential",

  issuer:
    "Agile AI University",

  validity:
    "Lifetime",

  description:
    "A professional credential recognizing applied capability in outcome-driven agility, value delivery and adaptive ways of working.",

  linkedin: {

    organization:
      "Agile AI University",

    credential_type:
      "CERTIFICATION"

  }

}

/* -----------------------------------------------------
   Future credentials go here (append-only)
   ----------------------------------------------------- */

};

})();