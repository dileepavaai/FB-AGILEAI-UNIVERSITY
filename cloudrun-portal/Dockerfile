# Use official Node.js 20 LTS (slim)
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy dependency definition
COPY package.json ./

# Install dependencies
# - npm ci is used when package-lock.json exists
# - npm install fallback when it does not
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

# Copy application source
COPY . .

# Create and use non-root user
RUN useradd --system --uid 1001 appuser \
  && chown -R appuser:appuser /app

USER appuser

# Cloud Run uses port 8080
ENV PORT=8080
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
