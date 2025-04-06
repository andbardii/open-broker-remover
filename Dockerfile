FROM node:18-alpine as build

# Install dependencies
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY src/server/package*.json ./src/server/

# Install dependencies
RUN npm install
RUN cd src/server && npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Build the backend
RUN cd src/server && npm run build

# Production stage
FROM node:18-alpine

# Install SQLite and other dependencies
RUN apk add --no-cache sqlite

# Create app directory
WORKDIR /app

# Copy built files
COPY --from=build /app/dist ./client
COPY --from=build /app/src/server/dist ./
COPY --from=build /app/src/server/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Create data directory
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Expose port
EXPOSE 3000

# Command to run the app
CMD ["node", "index.js"] 