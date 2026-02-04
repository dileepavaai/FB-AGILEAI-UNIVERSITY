/* =========================================================
   Credential Renderer — Phase-3F.5 (CARD-BASED, GOVERNED)
   REGISTRY-AWARE · NO-REPETITION · TOOLTIP-SAFE · SHARE-SAFE
   PURE RENDERER · COMPLETION-SIGNALLED (PHASE-9A ALLOWED)

   GUARANTEES:
   - Renderer is UI-only (no entitlement logic)
   - Idempotent rendering
   - Lifetime validity integrity enforced
   - Completion explicitly signalled (fire-once)
   - No coupling to dashboard-gating or boot-integrity
   ========================================================= */

(function () {
  "use strict";

  console.log(
    "[Credentials Renderer] Loaded (Card v4.4 · Phase-B sharing intent locked)"
  );

  if (window.__credentialsRendererInitialized === true) return;
  window.__credentialsRendererInitialized = true;

  let renderCompleted = false;
  let completionSignalled = false;

  /* =====================================================
     SAFE DATE NORMALIZATION
     ===================================================== */
  function safeDate(input) {
    try {
      const d =
        input?.toDate?.() ||
        (input instanceof Date ? input : new Date(input));

      if (!d || isNaN(d.getTime())) return "—";

      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return "—";
    }
  }

  /* =====================================================
     🔒 VALIDITY INTEGRITY GUARDRAIL (LOCKED)
     ===================================================== */
  function assertCredentialValidityIntegrity(cred) {
    if (!cred || !cred.validity) return;

    if (
      String(cred.validity).toLowerCase() === "lifetime" &&
      ("expiryDate" in cred ||
        "expiresOn" in cred ||
        "validUntil" in cred ||
        "expiration" in cred)
    ) {
      throw new Error(
        "SYSTEM VIOLATION: Lifetime credentials must not define expiry fields."
      );
    }
  }

  /* =====================================================
     🔗 CANONICAL URL BUILDERS
     ===================================================== */
  function buildPublicCredentialUrl(cred) {
    return cred?.credential_id
      ? "https://verify.agileai.university/credential.html?cid=" +
          encodeURIComponent(cred.credential_id)
      : "#";
  }

  function buildVerifyUrl(cred) {
    return cred?.credential_id
      ? "https://verify.agileai.university/verify.html?cid=" +
          encodeURIComponent(cred.credential_id)
      : "#";
  }

  /* =====================================================
     LINKEDIN ADD-TO-PROFILE (EXPLICIT ACTION)
     ===================================================== */
  function buildLinkedInUrl(cred, displayName) {
    const org = "Agile AI University";
    const certId = cred?.credential_id || "";
    const issueYear =
      cred?.issued_at?.getFullYear?.() || new Date().getFullYear();

    return (
      "https://www.linkedin.com/profile/add" +
      "?startTask=CERTIFICATION_NAME" +
      `&name=${encodeURIComponent(displayName)}` +
      `&organizationName=${encodeURIComponent(org)}` +
      `&issueYear=${issueYear}` +
      `&credentialId=${encodeURIComponent(certId)}` +
      `&credentialUrl=${encodeURIComponent(
        buildPublicCredentialUrl(cred)
      )}`
    );
  }

  /* =====================================================
     REGISTRY RESOLUTION (DISPLAY ONLY · LOCKED)
     ===================================================== */
  function resolveCredentialDefinition(cred) {
    const code =
      cred?.program_code ||
      cred?.credential_code ||
      cred?.credential_type ||
      "UNKNOWN";

    const registry =
      window.AAIU_CREDENTIAL_REGISTRY ||
      window.__AAIU_CREDENTIAL_REGISTRY ||
      window.CREDENTIAL_REGISTRY ||
      null;

    return registry && registry[code] ? registry[code] : { code };
  }

  /* =====================================================
     SHARE HANDLER (RECORD ACCESS ONLY)
     ===================================================== */
  function shareCredential(cred, def) {
    const title =
      def.full_title || def.full_name || def.display_name || def.code;

    const url = buildPublicCredentialUrl(cred);
    const text =
      `Official credential record\n\n` +
      `Credential: ${title}\n` +
      `Issued by: Agile AI University\n\n` +
      `View credential record:\n${url}`;

    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
      return;
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() =>
        alert("Official credential record link copied.")
      );
      return;
    }

    const temp = document.createElement("textarea");
    temp.value = url;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);

    alert("Official credential record link copied.");
  }

  /* =====================================================
     COMPLETION SIGNAL (EVENT-SAFE · FIRE-ONCE)
     ===================================================== */
  function signalRenderComplete() {
    if (completionSignalled) return;
    completionSignalled = true;

    document.dispatchEvent(
      new CustomEvent("credentials:rendered", {
        detail: { source: "renderCredentials" }
      })
    );

    console.log("[Credentials Renderer] credentials:rendered dispatched");
  }

  /* =====================================================
     MAIN RENDER ENTRY (PURE · IDEMPOTENT)
     ===================================================== */
  window.renderCredentials = function renderCredentials(credentials) {
    if (renderCompleted === true) {
      signalRenderComplete();
      return;
    }

    const container =
      document.getElementById("credentials-container") ||
      document.getElementById("credentials-list");

    if (!container) return;

    if (!Array.isArray(credentials) || credentials.length === 0) {
      container.innerHTML =
        "<p class='note'>No credentials available at this time.</p>";
      renderCompleted = true;
      signalRenderComplete();
      return;
    }

    console.assert(
      credentials.every(
        c => c && typeof c.program_code === "string"
      ),
      "[Credentials Renderer Invariant] Credential missing program_code"
    );

    container.innerHTML = "";

    credentials.forEach((cred) => {
      assertCredentialValidityIntegrity(cred);

      const def = resolveCredentialDefinition(cred);
      const title =
        def.full_title ||
        def.full_name ||
        def.display_name ||
        def.code;

      const tooltip =
        def.code && (def.full_title || def.full_name)
          ? `${def.code} = ${def.full_title || def.full_name}`
          : def.code;

      const card = document.createElement("div");
      card.className = "credential-card";

      card.innerHTML = `
        <div class="credential-badge" title="${tooltip}">
          ${def.code}
        </div>

        <div class="credential-meta credential-title">
          <strong>${title}</strong>
        </div>

        <div class="credential-meta">
          Issued by <strong>${cred.issued_by || "Agile AI University"}</strong>
        </div>

        <div class="credential-meta">
          Issued on ${safeDate(cred.issued_at)}
        </div>

        ${
          String(cred.validity).toLowerCase() === "lifetime"
            ? `<div class="credential-meta credential-validity">
                 Validity: <strong>Lifetime</strong>
               </div>`
            : ""
        }

        ${
          cred?.credential_id
            ? `<div class="credential-meta">
                 Credential ID: <code>${cred.credential_id}</code>
               </div>`
            : ""
        }

        <div class="credential-actions">
          <a href="${buildVerifyUrl(
            cred
          )}" target="_blank" rel="noopener" class="btn secondary">
            Verify
          </a>

          <a href="${buildLinkedInUrl(
            cred,
            title
          )}" target="_blank" rel="noopener" class="btn primary">
            Add to LinkedIn
          </a>

          <button class="btn secondary share-btn">
            View official credential record
          </button>
        </div>

        <div class="credential-helper">
          <small>
            ${def.description ? `${def.description}<br />` : ""}
            Use <strong>View official credential record</strong> to share
            this credential for verification.
            Use <strong>Add to LinkedIn</strong> only to add it to your profile.
          </small>
        </div>
      `;

      card
        .querySelector(".share-btn")
        .addEventListener("click", () =>
          shareCredential(cred, def)
        );

      container.appendChild(card);
    });

    renderCompleted = true;
    console.log("[Credentials Renderer] Render complete");
    signalRenderComplete();
  };
})();
