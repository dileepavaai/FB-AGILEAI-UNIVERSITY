# Extend the exact reviewed production runtime. Keep its WORKDIR, USER,
# ENTRYPOINT and CMD; do not rebuild or update the existing dependencies.
FROM asia-south1-docker.pkg.dev/fb-agileai-university/cloud-run-source-deploy/aau-credential-verify@sha256:278b0fec42696eaa90df1f30dedcac79b9e214e263ce8096f0929df5005177ff

# Refuse if the inherited runtime does not contain the reviewed application.
RUN node -e 'const fs=require("node:fs"),c=require("node:crypto");for(const [f,h] of Object.entries({"index.js":"52701069c42e2ac6c8da67f9f56514c0526a90ef9a442e3086a49c7e8c8b94d0","package.json":"b1255f8962eb11fcb09ee3558681b93f5d3807d4ef03b8b38c25bb40130a1fba","package-lock.json":"8c844789d914d7d3861f8d8eab01bfa80400732c777264e97330349328ec0528"})){const actual=c.createHash("sha256").update(fs.readFileSync(f,"utf8").replace(/\r\n/g,"\n")).digest("hex");if(actual!==h)throw Error("Reviewed runtime source differs: "+f)}'
COPY aau-backend/index.js ./index.js
COPY aau-backend/del ./del
RUN node --check index.js && node --test del/tests/*.test.js
