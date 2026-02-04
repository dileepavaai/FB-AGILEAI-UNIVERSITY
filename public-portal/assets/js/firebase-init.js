/* ============================================================
   Firebase Initialization — AUTH ONLY (HARDENED)
   FINAL · LOCKED · PRODUCTION-SAFE

   GUARANTEES (PRESERVED):
   - Auth readiness === auth state resolved + token checked
   - No DOM mutation (UI owns structure)
   - Google fallback is SIGNAL-ONLY (no UI, no alerts)
   ============================================================ */

(function () {
  "use strict";

  /* ------------------------------------------------------------
     GLOBAL READINESS CONTRACT (AUTHORITATIVE)
     ------------------------------------------------------------ */
  window.__FIREBASE_READY__ = false;
  window.__AAIU_AUTH_READY__ = null;
  window.__AAIU_AUTH_STATE__ = null;
  window.__AAIU_GOOGLE_FALLBACK_REQUIRED__ = false;

  /* ------------------------------------------------------------
     HARD GUARD — SDK MUST EXIST
     ------------------------------------------------------------ */
  if (typeof window.firebase === "undefined") {
    console.error("[Firebase] SDK not loaded");
    return;
  }

  /* ------------------------------------------------------------
     ADMIN TELEMETRY (OBSERVATIONAL ONLY)
     ------------------------------------------------------------ */
  const ADMIN_DOMAINS = ["agileai.university"];

  function isAdminUser(email) {
    return ADMIN_DOMAINS.includes(email?.split("@")[1]);
  }

  function adminTelemetry(event, payload = {}) {
    try {
      if (!window.__AAIU_IS_ADMIN__) return;
      console.info(`[Telemetry][Auth] ${event}`, payload);
    } catch (_) {}
  }

  /* ------------------------------------------------------------
     DISPOSABLE EMAIL BLOCKLIST
     ------------------------------------------------------------ */
  const DISPOSABLE_DOMAINS = [
    "tempmail.com",
    "mailinator.com",
    "10minutemail.com",
    "guerrillamail.com",
    "yopmail.com",
    "trashmail.com",
    "fakeinbox.com"
  ];

  function normalizeEmail(email) {
    return email?.trim().toLowerCase() || null;
  }

  function isDisposable(email) {
    const domain = email?.split("@")[1];
    return DISPOSABLE_DOMAINS.some(
      d => domain === d || domain?.endsWith(`.${d}`)
    );
  }

  /* ------------------------------------------------------------
     RATE-LIMIT COOLDOWN (CLIENT-SIDE)
     ------------------------------------------------------------ */
  const COOLDOWN_MS = 15 * 60 * 1000;
  const COOLDOWN_KEY = "AAIU_AUTH_COOLDOWN_UNTIL";

  function isInCooldown() {
    const until = Number(localStorage.getItem(COOLDOWN_KEY));
    return until && Date.now() < until;
  }

  function startCooldown() {
    localStorage.setItem(
      COOLDOWN_KEY,
      String(Date.now() + COOLDOWN_MS)
    );
  }

  /* ------------------------------------------------------------
     GOOGLE PROVIDER (CANONICAL · SINGLETON)
     ------------------------------------------------------------ */
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });

  async function signInWithGoogle() {
    adminTelemetry("google-signin-started");
    try {
      await firebase.auth().signInWithPopup(googleProvider);
      localStorage.removeItem(COOLDOWN_KEY);
    } catch (err) {
      adminTelemetry("google-signin-failed", { code: err.code });
      throw err;
    }
  }

  /* ------------------------------------------------------------
     INITIALIZATION
     ------------------------------------------------------------ */
  try {
    if (firebase.apps?.length) {
      window.__FIREBASE_READY__ = true;
      return;
    }

    firebase.initializeApp({
      apiKey: "AIzaSyCti7ubJjnU8LJTghNaXhaSZzqCpozkeXg",
      authDomain: "fb-agileai-university.firebaseapp.com",
      projectId: "fb-agileai-university",
      storageBucket: "fb-agileai-university.appspot.com",
      messagingSenderId: "458881040066",
      appId: "1:458881040066:web:c832c420f9b4282e76c55b"
    });

    const auth = firebase.auth();
    const EMAIL_STORAGE_KEY = "AAIU_EMAIL_FOR_SIGNIN";

    const emailLinkActionCodeSettings = {
      url: "https://portal.agileai.university/portal/",
      handleCodeInApp: true
    };

    /* ----------------------------------------------------------
       AUTH API (EXPORTED · DOM-SAFE · NO UI)
       ---------------------------------------------------------- */
    window.AAIUAuth = Object.freeze({
      auth,

      sendEmailLink: async email => {
        if (isInCooldown()) {
          window.__AAIU_GOOGLE_FALLBACK_REQUIRED__ = true;
          return;
        }

        const normalized = normalizeEmail(email);
        if (!normalized) {
          throw new Error("EMAIL_REQUIRED");
        }

        if (isDisposable(normalized)) {
          throw new Error("DISPOSABLE_EMAIL_BLOCKED");
        }

        localStorage.setItem(EMAIL_STORAGE_KEY, normalized);

        try {
          return await auth.sendSignInLinkToEmail(
            normalized,
            emailLinkActionCodeSettings
          );
        } catch (err) {
          if (err.code === "auth/quota-exceeded") {
            startCooldown();
            window.__AAIU_GOOGLE_FALLBACK_REQUIRED__ = true;
            return;
          }
          throw err;
        }
      },

      completeEmailLinkSignIn: async () => {
        if (!auth.isSignInWithEmailLink(location.href)) return null;

        const email =
          normalizeEmail(localStorage.getItem(EMAIL_STORAGE_KEY));

        if (!email) {
          throw new Error("EMAIL_CONFIRMATION_REQUIRED");
        }

        const result = await auth.signInWithEmailLink(
          email,
          location.href
        );

        localStorage.removeItem(EMAIL_STORAGE_KEY);
        localStorage.removeItem(COOLDOWN_KEY);
        return result.user;
      },

      signInWithGoogle
    });

    /* ----------------------------------------------------------
       AUTH READINESS (LOCKED CONTRACT)
       ---------------------------------------------------------- */
    window.__AAIU_AUTH_READY__ = new Promise(resolve => {
      auth.onAuthStateChanged(async user => {
        if (!user) {
          window.__AAIU_AUTH_STATE__ = { user: null, token: null };
          resolve(window.__AAIU_AUTH_STATE__);
          return;
        }

        try {
          const token = await user.getIdToken(true);
          window.__AAIU_AUTH_STATE__ = { user, token };
          window.__AAIU_IS_ADMIN__ = isAdminUser(user.email);
          adminTelemetry("auth-ready", { uid: user.uid });
          resolve(window.__AAIU_AUTH_STATE__);
        } catch (err) {
          console.error("[Auth] Token resolution failed", err);
          window.__AAIU_AUTH_STATE__ = { user, token: null };
          resolve(window.__AAIU_AUTH_STATE__);
        }
      });
    });

    window.__FIREBASE_READY__ = true;
    console.info("[Firebase] Initialized (alerts removed, DOM-safe)");

  } catch (err) {
    console.error("[Firebase] Initialization failed", err);
    window.__FIREBASE_READY__ = false;
  }
})();
