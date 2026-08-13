FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

COPY . .

RUN useradd --system --uid 1001 appuser \
    && chown -R appuser:appuser /app

USER appuser

ENV PORT=8080
EXPOSE 8080

CMD ["node", "index.js"]