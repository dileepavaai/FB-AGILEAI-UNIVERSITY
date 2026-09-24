# Extend only the immutable currently reviewed DEL runtime supplied by the release tool.
# Keep its WORKDIR, USER, ENTRYPOINT, CMD and existing dependencies.
ARG REVIEWED_BASE_IMAGE
FROM ${REVIEWED_BASE_IMAGE}

# The inherited buildpack launcher supplies Node for build steps.
RUN ["/cnb/lifecycle/launcher","--","node","-e","const fs=require(\"node:fs\"),c=require(\"node:crypto\");for(const [f,h] of Object.entries({\"index.js\":\"1746e00157e14514f367ecb66afe18240889d587e9b48fb8a223bcedb49c5256\",\"package.json\":\"b1255f8962eb11fcb09ee3558681b93f5d3807d4ef03b8b38c25bb40130a1fba\",\"package-lock.json\":\"8c844789d914d7d3861f8d8eab01bfa80400732c777264e97330349328ec0528\"})){const actual=c.createHash(\"sha256\").update(fs.readFileSync(f,\"utf8\").replace(/\\r\\n/g,\"\\n\")).digest(\"hex\");if(actual!==h)throw Error(\"Reviewed runtime source differs: \"+f)}"]
COPY aau-backend/index.js ./index.js
COPY aau-backend/del ./del
COPY operations/laau-del/release/verify-private-content.cjs ./del/verify-private-content.cjs
# Read raw bytes: reject CRLF conversion, missing files or any integrity mismatch.
RUN ["/cnb/lifecycle/launcher","--","/bin/sh","-ec","node del/verify-private-content.cjs del && node --check index.js && node --test del/tests/*.test.js"]
