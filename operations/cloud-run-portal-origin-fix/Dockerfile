# Validate and test against the exact deployed runtime. No dependency installation.
FROM asia-south1-docker.pkg.dev/fb-agileai-university/cloud-run-source-deploy/cloud-run-portal@sha256:83a36228c8773ae022a1aec12803bf0a387e033c1f4997ed7d0b13beb777a7fb AS checked
WORKDIR /app
RUN node -e "const fs=require('node:fs'),crypto=require('node:crypto');const s=fs.readFileSync('/app/index.js','utf8').replace(/\r\n/g,'\n');if(crypto.createHash('sha256').update(s).digest('hex')!=='e3ebd988e01c7289d15b44d3c7e094dec43ba8e54866bdf9262d57e57b4d9f5c')throw Error('Deployed source does not match reviewed source');"
COPY --chown=1001:1001 index.js /app/index.js
COPY --chown=1001:1001 smoke-test.mjs /tmp/laau-smoke-test.mjs
RUN node --check /app/index.js && node /tmp/laau-smoke-test.mjs

# Final image inherits all existing runtime settings and replaces only index.js.
FROM asia-south1-docker.pkg.dev/fb-agileai-university/cloud-run-source-deploy/cloud-run-portal@sha256:83a36228c8773ae022a1aec12803bf0a387e033c1f4997ed7d0b13beb777a7fb
COPY --from=checked --chown=1001:1001 /app/index.js /app/index.js
