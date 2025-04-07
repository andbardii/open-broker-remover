FROM node:18-alpine AS deps

# Install dependencies required for node-gyp
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json* ./
COPY src/server/package.json src/server/package-lock.json* ./src/server/

# Install dependencies with clear separation between prod and dev
RUN npm ci --only=production
RUN cd src/server && npm ci --only=production
RUN npm ci
RUN cd src/server && npm ci

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/server/node_modules ./src/server/node_modules

# Copy source code
COPY . .

# Build both frontend and backend
RUN npm run build
RUN cd src/server && npm run build

# Production stage
FROM node:18-alpine AS runner

# Install SQLite
RUN apk add --no-cache sqlite curl

# Create app directory
WORKDIR /app

# Copy built files and production dependencies
COPY --from=builder /app/dist ./client
COPY --from=builder /app/src/server/dist ./
COPY --from=deps /app/src/server/node_modules ./node_modules
COPY package.json ./
COPY src/server/package.json ./

# Create data directory with proper permissions
RUN mkdir -p /app/data

# Create a non-root user and switch to it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app /app/data
USER appuser

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/app/data

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Command to run the app
CMD ["node", "index.js"] 