/* LAAU Learning History | 20260922-learning-history-1
 * Read-only credential-backed records. No reconciliation, registration,
 * payment, enrolment, or Firestore mutations run from this page.
 * Dependencies: PortalAuth, resolvePortalEntitlements, ProgramService.
 */
(function (window, document) {
    "use strict";

    const VERSION = "20260922-learning-history-1";
    const TIMEOUT_MS = 15000;
    const DEFAULT_API = "https://cloud-run-portal-458881040066.asia-south1.run.app/portal/resolve-entitlements";
    if (window.LearningHistory?.version === VERSION) return;

    let elements;
    let generation = 0;
    let activeRequest = null;
    let identityKey = "";
    let signingOut = false;
    let suspended = false;
    let authResolved = false;
    let authTimer = null;
    let ownedPrograms = null;
    let ownedEntitlements = null;

    const isRecord = value => Boolean(value && typeof value === "object" && !Array.isArray(value));
    const isText = value => typeof value === "string" && value.trim().length > 0;
    const emailOf = user => typeof user?.email === "string" ? user.email.trim().toLowerCase() : "";
    const keyOf = user => isText(user?.uid) ? `${user.uid}\n${emailOf(user)}` : "";
    const currentUser = () => window.PortalAuth?.getCurrentUser?.() || null;

    function showState(state, message) {
        elements.loading.hidden = state !== "loading";
        elements.error.hidden = state !== "error";
        elements.empty.hidden = state !== "empty";
        elements.records.hidden = state !== "ready";
        elements.count.hidden = state !== "ready";
        elements.records.setAttribute("aria-busy", state === "loading" ? "true" : "false");
        elements.status.textContent = message;
        elements.errorMessage.textContent = state === "error" ? message : "";
        elements.retry.disabled = state === "loading";
    }

    function clearPublishedState() {
        if (ownedEntitlements && window.__AAIU_ENTITLEMENTS__ === ownedEntitlements) {
            delete window.__AAIU_ENTITLEMENTS__;
        }
        if (ownedPrograms && window.__AAIU_PROGRAMS__ === ownedPrograms) {
            delete window.__AAIU_PROGRAMS__;
            window.ProgramService?.clearCache?.();
        }
        ownedPrograms = null;
        ownedEntitlements = null;
    }

    function clear() {
        generation += 1;
        if (activeRequest) {
            activeRequest.controller.abort();
            window.clearTimeout(activeRequest.timer);
            activeRequest = null;
        }
        clearPublishedState();
        elements.records.replaceChildren();
        elements.count.textContent = "";
        elements.count.hidden = true;
        elements.errorMessage.textContent = "";
    }

    function isCurrent(request) {
        return request.generation === generation && !signingOut && !suspended &&
            keyOf(currentUser()) === request.identity;
    }

    function assertCurrent(request) {
        if (!isCurrent(request) || request.controller.signal.aborted) {
            throw new Error("Request cancelled");
        }
    }

    // Bound token acquisition, response headers, JSON parsing and metadata
    // together. Cancellation also settles operations which ignore AbortSignal.
    function untilCancelled(promise, request) {
        return new Promise((resolve, reject) => {
            const signal = request.controller.signal;
            const cancel = () => reject(new Error("Request cancelled"));
            if (signal.aborted) {
                cancel();
                return;
            }
            signal.addEventListener("abort", cancel, { once: true });
            Promise.resolve(promise).then(resolve, reject).finally(() => {
                signal.removeEventListener("abort", cancel);
            });
        });
    }

    function validatePayload(payload, user) {
        if (!isRecord(payload) || !Array.isArray(payload.credentials) ||
            (payload.programs !== undefined && !isRecord(payload.programs)) ||
            (payload.status !== undefined && payload.status !== "success") ||
            (payload.email !== undefined && emailOf(payload) !== emailOf(user))) {
            throw new Error("Invalid entitlement response");
        }
        for (const credential of payload.credentials) {
            if (!isRecord(credential) ||
                !["credential_id", "program_code", "email", "issued_status"].every(field => isText(credential[field])) ||
                (credential.learner_uid != null && !isText(credential.learner_uid))) {
                throw new Error("Invalid credential response");
            }
        }
        // Historical credentials may have no UID yet. A stored UID may never
        // disagree with Firebase identity, even when the email happens to match.
        return payload.credentials.filter(credential =>
            emailOf(credential) === emailOf(user) &&
            (credential.learner_uid == null || credential.learner_uid === user.uid)
        );
    }

    function credentialKey(credential) {
        return JSON.stringify([credential.credential_id, credential.program_code, emailOf(credential)]);
    }

    function resolveCredentials(payload, credentials, user) {
        const resolved = window.resolvePortalEntitlements({
            executiveEntitlement: payload.executiveEntitlement,
            userEntitlements: payload.userEntitlements,
            credentials,
            authenticatedUser: { email: user.email }
        });
        if (!isRecord(resolved) || !Array.isArray(resolved.visibleCredentials)) {
            throw new Error("Invalid visibility response");
        }
        const sourceKeys = new Set(credentials.map(credentialKey));
        const seen = new Set();
        const visibleCredentials = [];
        for (const credential of resolved.visibleCredentials) {
            if (!isRecord(credential) || !isText(credential.credential_id) || !isText(credential.program_code) ||
                emailOf(credential) !== emailOf(user) || !sourceKeys.has(credentialKey(credential))) {
                throw new Error("Invalid visible credential");
            }
            const id = credential.credential_id.trim().toUpperCase();
            if (!seen.has(id)) {
                seen.add(id);
                visibleCredentials.push(credential);
            }
        }
        return { ...resolved, visibleCredentials };
    }

    function node(tag, className, text) {
        const element = document.createElement(tag);
        element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function buildRecords(records) {
        const fragment = document.createDocumentFragment();
        for (const { credential, program } of records) {
            const item = node("li", "history-record");
            const heading = node("div", "history-record-heading");
            heading.append(
                node("p", "history-programme-code", credential.program_code),
                node("h3", "history-record-title", isText(program?.programName) ? program.programName : credential.program_code),
                node("span", "history-record-status", "Credential recorded")
            );
            const details = node("dl", "history-record-details");
            const identity = node("div", "history-record-identity");
            identity.append(node("dt", "", "Credential ID"), node("dd", "", credential.credential_id));
            details.append(identity);
            const link = node("a", "history-record-link", "View credentials");
            link.setAttribute("href", "/credentials/my-credentials.html");
            item.append(heading, details, link);
            fragment.append(item);
        }
        return fragment;
    }

    async function load(user) {
        clear();
        showState("loading", "Loading your learning history…");
        const request = {
            generation,
            identity: keyOf(user),
            controller: new window.AbortController(),
            timedOut: false,
            timer: null
        };
        activeRequest = request;
        request.timer = window.setTimeout(() => {
            request.timedOut = true;
            request.controller.abort();
        }, TIMEOUT_MS);

        try {
            if (!emailOf(user) || typeof user.getIdToken !== "function" ||
                typeof window.resolvePortalEntitlements !== "function" ||
                typeof window.ProgramService?.get !== "function") {
                throw new Error("History dependencies unavailable");
            }
            const token = await untilCancelled(user.getIdToken(), request);
            assertCurrent(request);
            if (!isText(token)) throw new Error("Authentication token unavailable");
            const response = await untilCancelled(window.fetch(window.AAIU_CONFIG?.ENTITLEMENT_API || DEFAULT_API, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                cache: "no-store",
                credentials: "omit",
                signal: request.controller.signal
            }), request);
            assertCurrent(request);
            if (!response.ok) throw new Error("Entitlement request failed");
            const payload = await untilCancelled(response.json(), request);
            assertCurrent(request);
            const credentials = validatePayload(payload, user);
            const resolved = resolveCredentials(payload, credentials, user);
            assertCurrent(request);

            ownedPrograms = Object.freeze({ ...(payload.programs || {}) });
            window.__AAIU_PROGRAMS__ = ownedPrograms;
            window.ProgramService.clearCache?.();
            const records = await untilCancelled(Promise.all(resolved.visibleCredentials.map(async credential => ({
                credential,
                program: await window.ProgramService.get(credential.program_code)
            }))), request);
            assertCurrent(request);
            const fragment = buildRecords(records);
            assertCurrent(request);

            ownedEntitlements = Object.freeze(resolved);
            window.__AAIU_ENTITLEMENTS__ = ownedEntitlements;
            elements.records.replaceChildren(fragment);
            elements.count.textContent = `${records.length} ${records.length === 1 ? "record" : "records"}`;
            showState(records.length ? "ready" : "empty", records.length
                ? `${records.length} credential ${records.length === 1 ? "record" : "records"} available.`
                : "No credential records are available for this account.");
            document.dispatchEvent(new window.CustomEvent("entitlements:ready", {
                detail: { source: "LearningHistory", version: VERSION }
            }));
        } catch (error) {
            if (!isCurrent(request)) return;
            clearPublishedState();
            elements.records.replaceChildren();
            elements.count.textContent = "";
            showState("error", request.timedOut
                ? "Loading your learning history took too long. Please try again."
                : "We couldn’t load your learning history. Please try again.");
        } finally {
            window.clearTimeout(request.timer);
            if (activeRequest === request) activeRequest = null;
        }
    }

    function syncIdentity(force = false) {
        if (suspended || signingOut) return;
        authResolved = true;
        window.clearTimeout(authTimer);
        const user = currentUser();
        const nextKey = keyOf(user);
        if (!nextKey) {
            identityKey = "";
            clear();
            showState("signed-out", "Sign in to view your learning history.");
            return;
        }
        if (!force && identityKey === nextKey) return;
        identityKey = nextKey;
        void load(user);
    }

    function stopForSignOut() {
        signingOut = true;
        identityKey = "";
        window.clearTimeout(authTimer);
        clear();
        showState("signed-out", "Sign in to view your learning history.");
    }

    function initialize() {
        const ids = {
            status: "history-status", loading: "history-loading", error: "history-error",
            errorMessage: "history-error-message", retry: "history-retry", empty: "history-empty",
            records: "history-records", count: "history-count"
        };
        elements = Object.fromEntries(Object.entries(ids).map(([key, id]) => [key, document.getElementById(id)]));
        if (Object.values(elements).some(element => !element)) return;
        elements.retry.addEventListener("click", () => {
            if (!authResolved || typeof window.PortalAuth?.whenReady !== "function") {
                window.location.reload();
                return;
            }
            syncIdentity(true);
        });
        ["portal:identity-ready", "portal:auth-authenticated"].forEach(event =>
            document.addEventListener(event, () => syncIdentity())
        );
        ["portal:auth-redirecting", "portal:signout-started", "portal:signout-completed"].forEach(event =>
            document.addEventListener(event, stopForSignOut)
        );
        document.addEventListener("portal:signout-failed", () => {
            signingOut = false;
            syncIdentity(true);
        });
        window.addEventListener("pagehide", () => {
            suspended = true;
            identityKey = "";
            clear();
            showState("signed-out", "Checking your session…");
        });
        window.addEventListener("pageshow", () => {
            if (!suspended) return;
            suspended = false;
            syncIdentity(true);
        });
        if (typeof window.PortalAuth?.whenReady !== "function") {
            showState("error", "We couldn’t verify your session. Please reload this page.");
            return;
        }
        authTimer = window.setTimeout(() => {
            if (!authResolved && !signingOut && !suspended) {
                showState("error", "We couldn’t verify your session. Please reload this page.");
            }
        }, TIMEOUT_MS);
        Promise.resolve(window.PortalAuth.whenReady()).then(() => syncIdentity()).catch(() => {
            window.clearTimeout(authTimer);
            if (!authResolved && !signingOut && !suspended) {
                showState("error", "We couldn’t verify your session. Please reload this page.");
            }
        });
    }

    window.LearningHistory = Object.freeze({ version: VERSION });
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})(window, document);
