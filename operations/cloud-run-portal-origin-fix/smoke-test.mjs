import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

// Only local preflight and unauthenticated requests; no learner records or tokens.
const entry = process.env.LAAU_SMOKE_ENTRY || '/app/index.js';
const child = spawn(process.execPath, [entry], {
  env: {
    ...process.env,
    PORT: '18081',
    GCLOUD_PROJECT: 'laau-local-smoke-test',
    GOOGLE_CLOUD_PROJECT: 'laau-local-smoke-test',
    FIRESTORE_EMULATOR_HOST: '127.0.0.1:1',
    GCE_METADATA_HOST: '127.0.0.1:1'
  },
  stdio: ['ignore', 'pipe', 'pipe']
});
let output = '';
child.stdout.on('data', chunk => { output = (output + chunk).slice(-8000); });
child.stderr.on('data', chunk => { output = (output + chunk).slice(-8000); });
let spawnError;
child.on('error', error => { spawnError = error; });
const base = 'http://127.0.0.1:18081';
const origins = [
  'https://portal.laau.university',
  'https://portal.agileai.university',
  'https://assessment.agileai.university',
  'https://verify.agileai.university'
];
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (spawnError) throw spawnError;
    if (child.exitCode !== null) throw Error('Backend exited: ' + output);
    try {
      const response = await fetch(base + '/ready', { signal: AbortSignal.timeout(1000) });
      ready = response.status === 200 && (await response.json()).ready === true;
      if (ready) break;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 125));
  }
  assert.ok(ready, 'Backend must start: ' + output);
  for (const origin of origins) {
    const response = await fetch(base + '/portal/resolve-entitlements', {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization'
      },
      signal: AbortSignal.timeout(3000)
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), origin);
    assert.match(response.headers.get('access-control-allow-methods'), /\bGET\b/);
    assert.match(response.headers.get('access-control-allow-headers'), /\bauthorization\b/i);
    const unauthenticated = await fetch(base + '/portal/resolve-entitlements', {
      headers: { Origin: origin }, signal: AbortSignal.timeout(3000)
    });
    assert.equal(unauthenticated.status, 401);
    assert.equal(unauthenticated.headers.get('access-control-allow-origin'), origin);
    assert.equal((await unauthenticated.json()).error, 'NO_TOKEN');
  }
  const denied = await fetch(base + '/portal/resolve-entitlements', {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://unapproved.invalid',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'authorization'
    },
    signal: AbortSignal.timeout(3000)
  });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  console.log('PASS: four allowed origins, unapproved origin blocked, token requirement retained.');
} finally {
  child.kill('SIGTERM');
}
