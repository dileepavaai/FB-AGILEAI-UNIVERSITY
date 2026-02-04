/* =========================================================
   RUNTIME SELF-CHECK — GOVERNED OBSERVATIONAL RUNNER
   Scope: Runtime Integrity & CORS Validation
   Mode: Observational (NON-BLOCKING)
   Output: Machine-readable JSON
========================================================= */

/* ---------------------------------------------------------
   CORS PREFLIGHT CHECK — PORTAL ENTITLEMENT RESOLVER
--------------------------------------------------------- */
async function checkCorsPreflight() {
  const endpoint =
    "https://asia-south1-fb-agileai-university.cloudfunctions.net/resolvePortalEntitlements";

  const origin = "https://portal.agileai.university";

  const result = {
    check: "CORS_PREFLIGHT_PORTAL_RESOLVER",
    status: "UNKNOWN",
    observations: [],
  };

  try {
    const res = await fetch(endpoint, {
      method: "OPTIONS",
      headers: {
        Origin: origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Authorization, Content-Type",
      },
    });

    const allowOrigin = res.headers.get("access-control-allow-origin");
    const allowMethods = res.headers.get("access-control-allow-methods");
    const allowHeaders = res.headers.get("access-control-allow-headers");

    if (!allowOrigin) {
      result.status = "FAIL";
      result.observations.push("Missing Access-Control-Allow-Origin header");
    } else if (allowOrigin !== origin) {
      result.status = "WARN";
      result.observations.push(`Allow-Origin mismatch: ${allowOrigin}`);
    }

    if (!allowMethods || !allowMethods.includes("POST")) {
      result.status = "WARN";
      result.observations.push("POST not explicitly allowed in CORS methods");
    }

    if (!allowHeaders || !allowHeaders.toLowerCase().includes("authorization")) {
      result.status = "WARN";
      result.observations.push("Authorization header not allowed by CORS");
    }

    if (result.observations.length === 0) {
      result.status = "PASS";
      result.observations.push("CORS preflight validated successfully");
    }

  } catch (err) {
    result.status = "FAIL";
    result.observations.push(`Preflight fetch failed: ${err.message}`);
  }

  return result;
}

/* ---------------------------------------------------------
   RUNTIME SELF-CHECK RUNNER (REGISTERED CHECKS)
--------------------------------------------------------- */
async function runRuntimeSelfCheck() {
  const checks = [];

  // 🔐 Register checks here (order does not imply priority)
  checks.push(await checkCorsPreflight());

  return {
    runtime: "fb-agileai-university",
    scope: "portal-runtime",
    mode: "observational",
    executedAt: new Date().toISOString(),
    checks,
  };
}

/* ---------------------------------------------------------
   EXECUTION (CLI / CI / MANUAL)
--------------------------------------------------------- */
runRuntimeSelfCheck()
  .then(report => {
    console.log(JSON.stringify(report, null, 2));
  })
  .catch(err => {
    console.error("[Runtime Self-Check] Execution failed", err);
    process.exitCode = 1; // non-blocking signal
  });
