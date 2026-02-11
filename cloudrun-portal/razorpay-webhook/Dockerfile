# Use a lightweight Node.js image
FROM node:20-slim

# Set working directory inside the container
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install production dependencies
RUN npm install --only=production

# Copy application code
COPY index.js ./

# Cloud Run listens on port 8080
ENV PORT=8080
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
