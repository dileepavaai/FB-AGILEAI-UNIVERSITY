# Use official Node.js 20 image
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy rest of the app
COPY . .

# Cloud Run uses port 8080
ENV PORT=8080
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
