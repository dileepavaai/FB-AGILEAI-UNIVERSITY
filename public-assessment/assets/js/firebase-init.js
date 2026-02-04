/* ============================================================
   Firebase Initialization (CSP-SAFE, CANONICAL)
   ------------------------------------------------------------
   - External script only (no inline)
   - Idempotent (safe to load multiple times)
   - Exposes explicit readiness signal
   - Designed for payments + health-check usage
   ============================================================ */

(function () {
  // Global readiness flag (used by payments.js / health-check.js)
  window.__FIREBASE_READY__ = false;

  // Hard guard: SDK must exist
  if (typeof window.firebase === "undefined") {
    console.error("[Firebase] SDK not loaded (firebase is undefined)");
    return;
  }

  try {
    // Already initialized → mark ready and exit
    if (firebase.apps && firebase.apps.length > 0) {
      window.__FIREBASE_READY__ = true;
      console.info("[Firebase] Already initialized");
      return;
    }

    // Canonical config (PUBLIC, SAFE)
    const firebaseConfig = {
      apiKey: "AIzaSyCti7ubJjnU8LJTghNaXhaSZzqCpozkeXg",
      authDomain: "fb-agileai-university.firebaseapp.com",
      projectId: "fb-agileai-university",
      storageBucket: "fb-agileai-university.appspot.com",
      messagingSenderId: "458881040066",
      appId: "1:458881040066:web:c832c420f9b4282e76c55b",
      measurementId: "G-1RMK7HMMLY"
    };

    // Initialize
    firebase.initializeApp(firebaseConfig);

    // Mark ready
    window.__FIREBASE_READY__ = true;
    console.info("[Firebase] Initialized successfully");

  } catch (err) {
    console.error("[Firebase] Initialization failed", err);
    window.__FIREBASE_READY__ = false;
  }
})();
