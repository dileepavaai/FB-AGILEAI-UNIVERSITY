# Use official Node.js 20 LTS (slim)
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy dependency definitions first (for caching)
COPY package.json package-lock.json ./

# Install production dependencies deterministically
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Create and use non-root user
RUN useradd --system --uid 1001 appuser \
  && chown -R appuser:appuser /app

USER appuser

# Cloud Run uses port 8080
ENV PORT=8080
EXPOSE 8080

# Start the app directly (Cloud Run best practice)
CMD ["node", "index.js"]
