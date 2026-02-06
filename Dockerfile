# Production Dockerfile for Survey Backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install production dependencies first (for better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directories
RUN mkdir -p src/uploads/foto src/uploads/dokumen

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "run", "start"]
