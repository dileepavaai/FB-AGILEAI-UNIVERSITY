/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Recognition Registry

File        : recognition-registry.js
Version     : 1.0.0
Status      : ACTIVE

Governance  : Recognition Governance v1.0

Purpose
-------------------------------------------------------
Central registry for recognition metadata.

Recognition Types

• University Certificate
• Trainer Certificate
• University Badge

Governance Rules
-------------------------------------------------------
- Registry contains display metadata only
- Registry performs no authorization
- Registry performs no entitlement resolution
- Registry performs no rendering

===================================================== */

(function () {

  "use strict";

  window.AAIU_RECOGNITION_REGISTRY = {

    UNIVERSITY_CERTIFICATE: {

      code: "UNIVERSITY_CERTIFICATE",

      type: "certificate",

      display_name:
        "University Certificate",

      description:
        "Official university-issued certificate recognizing successful completion of a credential pathway."

    },

    TRAINER_CERTIFICATE: {

      code: "TRAINER_CERTIFICATE",

      type: "trainer-certificate",

      display_name:
        "Trainer Certificate",

      description:
        "Official trainer-issued certificate recognizing participation in a licensed Agile AI University learning experience."

    },

    UNIVERSITY_BADGE: {

      code: "UNIVERSITY_BADGE",

      type: "badge",

      display_name:
        "University Badge",

      description:
        "Digital badge representing achievement, recognition, and professional capability."

    }

  };

  console.log(
    "[Recognition Registry] Loaded"
  );

})();