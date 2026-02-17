/* =========================================================
   RUNTIME SELF-CHECK RUNNER
   Mode: Observational
   Output: JSON (stdout)
========================================================= */

const { getRegisteredChecks } = require("./runtime-check-registry.js");

async function runRuntimeSelfChecks() {
  const checks = getRegisteredChecks();
  const results = [];

  for (const check of checks) {
    try {
      const outcome = await check.run();
      results.push({
        id: check.id,
        phase: check.phase,
        severity: check.severity,
        ...outcome,
      });
    } catch (err) {
      results.push({
        id: check.id,
        phase: check.phase,
        severity: check.severity,
        status: "FAIL",
        observations: [`Runner error: ${err.message}`],
      });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    checks: results,
  };
}

/* ---------------------------------------------------------
   CLI ENTRYPOINT
--------------------------------------------------------- */

if (require.main === module) {
  runRuntimeSelfChecks()
    .then((results) => {
      console.log(JSON.stringify(results, null, 2));
    })
    .catch((err) => {
      console.error("[RUNTIME SELF-CHECK ERROR]", err);
      process.exit(1);
    });
}

module.exports = {
  runRuntimeSelfChecks,
};
