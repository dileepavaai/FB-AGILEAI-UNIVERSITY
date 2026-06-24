/* =====================================================

Agile AI University

Module      : Student & Executive Portal
Component   : Recognition Renderer

File        : recognition-renderer.js
Version     : 1.0.0
Status      : ACTIVE

Governance  : Recognition Governance v1.0

Purpose
-------------------------------------------------------
Render recognition cards from resolver-approved
recognition data.

Architectural Position
-------------------------------------------------------

Authentication
      ↓
Entitlements
      ↓
Recognition Service
      ↓
Recognition Renderer

Responsibilities
-------------------------------------------------------

* Render recognition cards
* Display recognition metadata
* Handle recognition empty state
* Signal render completion

Must Never
-------------------------------------------------------

* Call APIs
* Query Firestore
* Perform Authorization
* Resolve Entitlements
* Filter Recognitions
* Modify Recognition State

Governance Rules
-------------------------------------------------------

Recognition Service owns recognition selection.

Recognition Renderer consumes
recognition-service output only.

Renderer remains UI-only.

Dependencies
-------------------------------------------------------

recognition-service.js

AAIU_RECOGNITION_REGISTRY

Change History
-------------------------------------------------------

v1.0.0

* Initial governed implementation
* Registry-aware rendering
* Empty state support
* Completion signalling support

===================================================== */

(function () {

"use strict";

console.log(
  "[Recognition Renderer] Loaded v1.0.0"
);

if (
  window.__recognitionRendererInitialized === true
) {
  return;
}

window.__recognitionRendererInitialized = true;

let renderCompleted = false;
let completionSignalled = false;

/* =====================================================
   Completion Signal
===================================================== */

function signalRenderComplete() {

  if (completionSignalled) {
    return;
  }

  completionSignalled = true;

  document.dispatchEvent(
    new CustomEvent(
      "recognitions:rendered",
      {
        detail: {
          source:
            "renderRecognitions"
        }
      }
    )
  );

  console.log(
    "[Recognition Renderer] recognitions:rendered dispatched"
  );

}

/* =====================================================
   Main Render Entry
===================================================== */

window.renderRecognitions =
function renderRecognitions(
  recognitions
) {

  if (renderCompleted) {

    signalRenderComplete();

    return;

  }

  const container =
    document.getElementById(
      "recognitions-container"
    );

  if (!container) {
    return;
  }

  if (
    !Array.isArray(recognitions) ||
    recognitions.length === 0
  ) {

    container.innerHTML = `
      <div class="empty-state">
        No recognitions available.
      </div>
    `;

    renderCompleted = true;

    signalRenderComplete();

    return;

  }

  container.innerHTML = "";

  recognitions.forEach(
    function (recognition) {

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "credential-card";

      card.innerHTML = `
        <div class="credential-badge">
          ${recognition.code}
        </div>

        <div class="credential-meta credential-title">
          <strong>
            ${recognition.display_name}
          </strong>
        </div>

        <div class="credential-helper">
          ${recognition.description || ""}
        </div>
      `;

      container.appendChild(
        card
      );

    }
  );

  renderCompleted = true;

  console.log(
    "[Recognition Renderer] Render complete"
  );

  signalRenderComplete();

};

})();