/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Recognition Registry

File        : recognition-registry.js
Version     : 1.0.0
Status      : ACTIVE

Governance  : Recognition Governance v1.1

Purpose
-------------------------------------------------------
Central registry for recognition metadata.

Recognition metadata is defined here.

Recognition applicability is defined by:

credential-registry.js

Responsibilities
-------------------------------------------------------

* Define recognition metadata
* Define recognition display names
* Define recognition descriptions
* Define recognition display ordering
* Define recognition types

Recognition Types
-------------------------------------------------------

• University Certificate
• Trainer Certificate
• University Badge

Non Responsibilities
-------------------------------------------------------

✗ Authentication
✗ Authorization
✗ Firestore
✗ Rendering
✗ Entitlement Resolution
✗ Business Logic

Governance Rules
-------------------------------------------------------

• Registry contains display metadata only
• Registry performs no authorization
• Registry performs no entitlement resolution
• Registry performs no rendering

Registry Ownership
-------------------------------------------------------

Recognition Applicability
→ credential-registry.js

Recognition Metadata
→ recognition-registry.js

Change History
-------------------------------------------------------

v1.0.0

* Initial recognition registry
* Added University Certificate
* Added Trainer Certificate
* Added University Badge
* Registry-only governance

===================================================== */

(function () {

    "use strict";

    window.AAIU_RECOGNITION_REGISTRY = Object.freeze({

        UNIVERSITY_CERTIFICATE: Object.freeze({

            code: "UNIVERSITY_CERTIFICATE",

            type: "certificate",

            status: "ACTIVE",

            display_order: 1,

            display_name:
                "University Certificate",

            description:
                "Official university-issued certificate recognizing successful completion of a credential pathway."

        }),

        TRAINER_CERTIFICATE: Object.freeze({

            code: "TRAINER_CERTIFICATE",

            type: "trainer-certificate",

            status: "ACTIVE",

            display_order: 2,

            display_name:
                "Trainer Certificate",

            description:
                "Official trainer-issued certificate recognizing participation in a licensed Agile AI University learning experience."

        }),

        UNIVERSITY_BADGE: Object.freeze({

            code: "UNIVERSITY_BADGE",

            type: "badge",

            status: "ACTIVE",

            display_order: 3,

            display_name:
                "University Badge",

            description:
                "Digital badge representing achievement, recognition, and professional capability."

        })

    });

    console.log(
        "[Recognition Registry] Loaded v1.0.0"
    );

})();