/* ==========================================================
   Agile AI University
   Student & Executive Portal

   File      : credential-recognition-section.js
   Version   : 1.0.0
   Status    : ACTIVE
   Phase     : Sprint 2E

   Purpose
   ----------------------------------------------------------
   Credential Recognition Section

   Responsibilities

   ✓ Render Recognition Information
   ✓ Render Recognition Metadata
   ✓ Presentation Only

   Non Responsibilities

   ✗ Authentication
   ✗ Authorization
   ✗ Firestore
   ✗ Business Logic
   ✗ Event Binding
   ✗ Overlay Rendering

   Governance

   • Credential Recognition Authority
   • Presentation Layer
   • Single Responsibility
   • Enterprise Portal Standard

========================================================== */

(function (window) {

    "use strict";

    const CredentialRecognitionSection = {

        /* ==================================================
           RECOGNITION
        ================================================== */

        render(
            credential
        ) {

            if (!credential) {

                return "";

            }

            const recognition =

                credential.recognition || {};

            const recognitionName =

                recognition.name ||

                credential.recognition_name ||

                "Professional Recognition";

            const recognizingBody =

                recognition.organization ||

                credential.recognition_body ||

                "Agile AI University";

            const recognitionLevel =

                recognition.level ||

                credential.recognition_level ||

                "-";

            const recognitionStatus =

                recognition.status ||

                credential.recognition_status ||

                "Active";

            const recognitionDate =

                recognition.date ||

                credential.recognition_date ||

                "-";

            return `

                <section
                    class="credential-recognition-section">

                    <h3
                        class="credential-section-title">

                        Recognition

                    </h3>

                    <div
                        class="credential-information-grid">

                        <div
                            class="credential-field">

                            <strong>Recognition</strong>

                            <span>

                                ${recognitionName}

                            </span>

                        </div>

                        <div
                            class="credential-field">

                            <strong>Recognizing Body</strong>

                            <span>

                                ${recognizingBody}

                            </span>

                        </div>

                        <div
                            class="credential-field">

                            <strong>Level</strong>

                            <span>

                                ${recognitionLevel}

                            </span>

                        </div>

                        <div
                            class="credential-field">

                            <strong>Status</strong>

                            <span>

                                ${recognitionStatus}

                            </span>

                        </div>

                        <div
                            class="credential-field">

                            <strong>Recognition Date</strong>

                            <span>

                                ${recognitionDate}

                            </span>

                        </div>

                    </div>

                </section>

            `;

        }

    };

    Object.freeze(
        CredentialRecognitionSection
    );

    window.CredentialRecognitionSection =
        CredentialRecognitionSection;

})(window);