import assert from 'node:assert/strict';

const [base, mode = 'backend'] = process.argv.slice(2);
assert(base && new URL(base).protocol === 'https:', 'An HTTPS base URL is required.');
const root = base.replace(/\/$/, '');
async function request(path, options = {}) {
  const response = await fetch(root + path, {
    redirect: 'manual', signal: AbortSignal.timeout(30000),
    headers: { 'Cache-Control': 'no-cache', ...(options.headers || {}) },
    ...options
  });
  return response;
}
async function denied(path, options = {}) {
  const response = await request(path, options);
  assert.equal(response.status, 401, `${path} must require authentication`);
  assert.match(response.headers.get('cache-control') || '', /no-store/i, `${path} must not be cached`);
}
if (mode === 'edu') {
  for (const path of ['/leadership-lab', '/leadership-lab/index.html', '/leadership-lab/classic-environment.html']) {
    const r = await request(path);
    assert([301, 302, 303, 307, 308].includes(r.status), `${path} must redirect`);
    const location = new URL(r.headers.get('location'), root);
    assert.equal(location.origin, 'https://lab.laau.university', 'Old Education Lab must lead to the protected Lab');
  }
} else {
  const health = await request('/del/health');
  assert.equal(health.status, 200);
  const healthBody = await health.json();
  assert.equal(healthBody.version, '20260923-del-1');
  assert.equal(healthBody.service, 'laau-del');
  await denied('/del/me');
  await denied('/del/content/DEL-PILOT/index.html');
  await denied('/del/content/DEL-PILOT/index.html', { method: 'HEAD' });
  const logout = await request('/del/logout', {
    method: 'POST', headers: { Origin: 'https://untrusted.invalid', 'Content-Type': 'application/json' }, body: '{}'
  });
  assert.equal(logout.status, 403, 'Cross-origin logout must be rejected');
  if (mode === 'backend') {
    assert.equal((await request('/health')).status, 200, 'Existing backend health must survive');
    assert.equal((await request('/api/v1/learning-resources/me')).status, 401, 'Existing learning resources must remain authenticated');
  } else if (mode === 'lab') {
    const entry = await request('/');
    assert.equal(entry.status, 200);
    assert.match(await entry.text(), /20260923-del-1/, 'Expected Lab entry release');
    for (const path of ['/environments/classic-agile/index.html', '/scenario-packs/aipa/briefing.html', '/environments/classic-agile/assets/js/environment-core.js']) {
      const r = await request(path);
      if ([301, 302, 303, 307, 308].includes(r.status)) {
        const location = new URL(r.headers.get('location'), root);
        assert([new URL(root).origin, 'https://lab.laau.university'].includes(location.origin));
        assert(['/', '/index.html', '/login.html'].includes(location.pathname), 'Legacy path may only redirect to sign-in');
      } else assert([404, 410].includes(r.status), `Old public lesson must be absent: ${path}`);
    }
  } else throw Error('Unknown smoke-test mode');
}
console.log(`PASS: ${mode} access-boundary checks at ${root}`);
