/* LAAU Lab public entry: 20260923-del-1. No protected lesson content belongs here. */
(function () {
  "use strict";

  const config = Object.freeze({
    apiKey: "AIzaSyCti7ubJjnU8LJTghNaXhaSZzqCpozkeXg",
    authDomain: "fb-agileai-university.firebaseapp.com",
    projectId: "fb-agileai-university",
    storageBucket: "fb-agileai-university.firebasestorage.app",
    messagingSenderId: "458881040066",
    appId: "1:458881040066:web:c832c420f9b4282e76c55b"
  });
  const emailStorageKey = "laauLabPendingEmail";
  const byId = (id) => document.getElementById(id);
  const ui = {
    initial: byId("initial-state"), signIn: byId("sign-in-view"), workspace: byId("workspace-view"),
    normal: byId("normal-sign-in"), completeForm: byId("complete-email-form"),
    google: byId("google-button"), googleLabel: byId("google-label"),
    emailForm: byId("email-form"), emailInput: byId("email-input"), emailButton: byId("email-button"),
    completeInput: byId("complete-email-input"), completeButton: byId("complete-email-button"),
    cancelEmail: byId("cancel-email-button"), signInStatus: byId("sign-in-status"),
    workspaceStatus: byId("workspace-status"), email: byId("account-email"),
    courseList: byId("course-list"), noAccess: byId("no-access"), signOut: byId("sign-out-button")
  };
  let authPromise;
  let emailLink = null;
  let busy = false;
  let refreshing = null;
  let sessionGeneration = 0;
  let isSignedIn = false;

  function beginSessionChange() {
    sessionGeneration += 1;
    // In-flight reads may finish, but cannot render over a later sign-in or sign-out.
    refreshing = null;
  }

  function rememberEmail(value) {
    try {
      if (value) window.sessionStorage.setItem(emailStorageKey, value);
      else window.sessionStorage.removeItem(emailStorageKey);
    } catch (_) { /* Email confirmation remains available when storage is blocked. */ }
  }

  function recalledEmail() {
    try { return window.sessionStorage.getItem(emailStorageKey) || ""; }
    catch (_) { return ""; }
  }

  function message(element, text, isError = false) {
    element.textContent = text;
    element.dataset.error = String(isError);
    element.hidden = !text;
  }

  function setBusy(value, action) {
    busy = value;
    [ui.google, ui.emailInput, ui.emailButton, ui.completeInput, ui.completeButton, ui.cancelEmail, ui.signOut].forEach((control) => {
      control.disabled = value;
    });
    ui.googleLabel.textContent = value && action === "google" ? "Signing in…" : "Sign in with Google";
    ui.emailButton.textContent = value && action === "email" ? "Sending link…" : "Send sign-in link";
    ui.completeButton.textContent = value && action === "complete" ? "Signing in…" : "Complete sign in";
    ui.signOut.textContent = value && action === "logout" ? "Signing out…" : "Sign out";
  }

  function showSignIn(text = "", isError = false) {
    isSignedIn = false;
    ui.initial.hidden = true;
    ui.workspace.hidden = true;
    ui.courseList.replaceChildren();
    ui.noAccess.hidden = true;
    ui.email.textContent = "";
    ui.signIn.hidden = false;
    message(ui.signInStatus, text, isError);
  }

  async function request(path, options = {}) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(path, {
        credentials: "same-origin", cache: "no-store", redirect: "error",
        ...options, signal: controller.signal,
        headers: { Accept: "application/json", ...(options.headers || {}) }
      });
      const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error("Lab request failed");
        error.status = response.status;
        error.code = typeof data.error === "string" ? data.error : data.error?.code || data.code || "";
        throw error;
      }
      return data;
    } finally {
      window.clearTimeout(timer);
    }
  }

  function readableError(error) {
    const code = String(error?.code || "").toLowerCase();
    const known = {
      "auth/popup-closed-by-user": "The sign-in window was closed. Choose Sign in with Google to try again.",
      "auth/cancelled-popup-request": "The sign-in request was cancelled. Please try again.",
      "auth/popup-blocked": "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.",
      "auth/unauthorized-domain": "Sign-in is not configured for this Lab address yet. Please contact LAAU support.",
      "auth/operation-not-allowed": "This sign-in method is not available yet. Please contact LAAU support.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/invalid-action-code": "This sign-in link is invalid or has already been used. Request a new link.",
      "auth/expired-action-code": "This sign-in link has expired. Request a new link.",
      "auth/user-disabled": "This account is disabled. Please contact LAAU support.",
      "auth/too-many-requests": "There have been too many attempts. Please wait before trying again.",
      "auth/network-request-failed": "The sign-in service could not be reached. Check your connection and try again.",
      "email_not_verified": "A verified email address is required. Please use the secure email-link option.",
      "email_unverified": "A verified email address is required. Please use the secure email-link option.",
      "recent_auth_required": "Please sign in again to start a fresh Lab session.",
      "recent_sign_in_required": "Please sign in again to start a fresh Lab session.",
      "auth_too_old": "Please sign in again to start a fresh Lab session."
    };
    if (known[code]) return known[code];
    if (error?.name === "AbortError") return "The request took too long. Check your connection and try again.";
    if (error?.status === 401) return "Your sign-in could not be verified. Please sign in again.";
    if (error?.status === 403) return "Lab access could not be confirmed. Please contact LAAU support.";
    if (error?.status === 429) return "There have been too many attempts. Please wait before trying again.";
    return "We could not complete the request. Please try again or contact support@laau.university.";
  }

  async function getAuth() {
    if (!authPromise) {
      authPromise = (async () => {
        if (!window.firebase?.auth) throw new Error("Sign-in library unavailable");
        const app = window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(config);
        const auth = app.auth();
        await auth.setPersistence(window.firebase.auth.Auth.Persistence.NONE);
        // Each Lab session is created by a fresh sign-in, never by a cached SDK identity.
        await auth.signOut();
        return auth;
      })().catch((error) => { authPromise = null; throw error; });
    }
    return authPromise;
  }

  function safeEntryUrl(value) {
    if (typeof value !== "string" || !value.startsWith("/del/content/")) throw new Error("Invalid workspace address");
    const url = new URL(value, window.location.origin);
    if (url.origin !== window.location.origin || url.username || url.password || !url.pathname.startsWith("/del/content/")) {
      throw new Error("Invalid workspace address");
    }
    return url.pathname + url.search + url.hash;
  }

  function renderCourses(data) {
    if (!data?.user || typeof data.user.email !== "string" || !Array.isArray(data.courses)) throw new Error("Invalid Lab session response");
    const cards = data.courses.map((course) => {
      if (!course || typeof course.id !== "string" || typeof course.title !== "string" || !course.title.trim()) throw new Error("Invalid workspace");
      const entryUrl = safeEntryUrl(course.entryUrl);
      const card = document.createElement("article");
      card.className = "course-card";
      const label = document.createElement("p");
      label.className = "course-label";
      label.textContent = "ASSIGNED WORKSPACE";
      const title = document.createElement("h2");
      title.textContent = course.title;
      const description = document.createElement("p");
      description.className = "course-description";
      description.textContent = typeof course.description === "string" ? course.description : "Open your assigned Dynamic Experiential Learning workspace.";
      card.append(label, title, description);
      if (course.expiresAt) {
        const date = new Date(course.expiresAt);
        if (!Number.isFinite(date.getTime())) throw new Error("Invalid assignment date");
        const expiry = document.createElement("p");
        expiry.className = "course-expiry";
        expiry.textContent = "Access until " + date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        card.append(expiry);
      }
      const link = document.createElement("a");
      link.className = "button button-primary button-inline";
      link.href = entryUrl;
      link.textContent = "Open workspace →";
      card.append(link);
      return card;
    });
    ui.courseList.replaceChildren(...cards);
    ui.courseList.hidden = cards.length === 0;
    ui.noAccess.hidden = cards.length !== 0;
    ui.email.textContent = data.user.email;
    ui.initial.hidden = true;
    ui.signIn.hidden = true;
    ui.workspace.hidden = false;
    isSignedIn = true;
    message(ui.workspaceStatus, "");
  }

  async function refreshSession({ initial = false } = {}) {
    if (refreshing && refreshing.generation === sessionGeneration) return;
    const refresh = { generation: sessionGeneration };
    refreshing = refresh;
    const isCurrent = () => refresh.generation === sessionGeneration && refreshing === refresh;
    try {
      const data = await request("/del/me");
      if (!isCurrent()) return;
      renderCourses(data);
    } catch (error) {
      if (!isCurrent()) return;
      if (error?.status === 401) {
        showSignIn(initial ? "" : "Your Lab session has ended. Sign in again to continue.");
      } else if (isSignedIn) {
        // Do not leave clickable assignments visible when current access cannot be checked.
        ui.courseList.replaceChildren();
        ui.noAccess.hidden = true;
        message(ui.workspaceStatus, "We could not refresh your Lab access. Check your connection and reload this page to try again.", true);
      } else {
        showSignIn("We could not check your Lab session. You can try signing in again.", true);
      }
    } finally {
      if (refreshing === refresh) refreshing = null;
    }
  }

  async function establishSession(auth, result) {
    try {
      if (!result.user.emailVerified) {
        const error = new Error("Verified email required");
        error.code = "email_not_verified";
        throw error;
      }
      const token = await result.user.getIdToken(true);
      await request("/del/session", { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: "{}" });
      rememberEmail("");
      emailLink = null;
    } finally {
      // The SDK identity lives only in memory. Protected access uses the server's HttpOnly cookie.
      await auth.signOut();
    }
    await refreshSession();
  }

  ui.google.addEventListener("click", async () => {
    if (busy) return;
    beginSessionChange();
    setBusy(true, "google");
    message(ui.signInStatus, "");
    try {
      const auth = await getAuth();
      const provider = new window.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await establishSession(auth, await auth.signInWithPopup(provider));
    } catch (error) { message(ui.signInStatus, readableError(error), true); }
    finally { setBusy(false); }
  });

  ui.emailForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || !ui.emailForm.reportValidity()) return;
    setBusy(true, "email");
    message(ui.signInStatus, "");
    try {
      const email = ui.emailInput.value.trim();
      const auth = await getAuth();
      await auth.sendSignInLinkToEmail(email, { url: window.location.origin + "/index.html", handleCodeInApp: true });
      rememberEmail(email);
      message(ui.signInStatus, "Sign-in link sent. Check your inbox and spam folder, then open the latest link to continue.");
    } catch (error) { message(ui.signInStatus, readableError(error), true); }
    finally { setBusy(false); }
  });

  ui.completeForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (busy || !emailLink || !ui.completeForm.reportValidity()) return;
    beginSessionChange();
    setBusy(true, "complete");
    message(ui.signInStatus, "");
    try {
      const auth = await getAuth();
      await establishSession(auth, await auth.signInWithEmailLink(ui.completeInput.value.trim(), emailLink));
    } catch (error) { message(ui.signInStatus, readableError(error), true); }
    finally { setBusy(false); }
  });

  ui.cancelEmail.addEventListener("click", () => {
    if (busy) return;
    emailLink = null;
    ui.completeForm.hidden = true;
    ui.normal.hidden = false;
    message(ui.signInStatus, "");
    ui.google.focus();
  });

  ui.signOut.addEventListener("click", async () => {
    if (busy) return;
    beginSessionChange();
    setBusy(true, "logout");
    ui.courseList.replaceChildren();
    ui.noAccess.hidden = true;
    try {
      await request("/del/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (authPromise) await (await authPromise).signOut();
      rememberEmail("");
      ui.completeForm.hidden = true;
      ui.normal.hidden = false;
      showSignIn("You have signed out of LAAU Lab.");
    } catch (_) {
      message(ui.workspaceStatus, "Sign-out could not be completed. Check your connection and choose Sign out again.", true);
    } finally { setBusy(false); }
  });

  async function start() {
    const incomingUrl = window.location.href;
    const url = new URL(incomingUrl);
    const looksLikeEmailLink = url.searchParams.has("oobCode") || url.searchParams.get("mode") === "signIn";
    if (looksLikeEmailLink) {
      // Keep the callback in memory only; remove one-time codes from the visible URL/history.
      window.history.replaceState(null, "", window.location.pathname);
      showSignIn();
      try {
        const auth = await getAuth();
        if (!auth.isSignInWithEmailLink(incomingUrl)) {
          message(ui.signInStatus, "This sign-in link is not valid. Request a new link.", true);
          return;
        }
        emailLink = incomingUrl;
        ui.normal.hidden = true;
        ui.completeForm.hidden = false;
        ui.completeInput.value = recalledEmail();
        ui.completeInput.focus();
      } catch (error) { message(ui.signInStatus, readableError(error), true); }
    } else {
      await refreshSession({ initial: true });
    }
  }

  window.addEventListener("focus", () => { if (isSignedIn && !busy) refreshSession(); });
  window.setInterval(() => {
    if (isSignedIn && !busy && document.visibilityState === "visible") refreshSession();
  }, 60000);
  start();
})();
