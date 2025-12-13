# Multi-stage build for production optimization
FROM node:20-alpine AS builder

WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy source code - USE MINIMAL BACKEND FOR DEMO
COPY src/index-minimal.ts ./src/index.ts

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install security updates and dumb-init
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create non-root user with specific UID/GID
RUN addgroup -g 1001 -S nodejs && \
    adduser -S bookbyblock -u 1001 -G nodejs

# Copy built application with proper ownership
COPY --from=builder --chown=bookbyblock:nodejs /app/dist ./dist
COPY --from=builder --chown=bookbyblock:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=bookbyblock:nodejs /app/package.json ./

# Set proper permissions
RUN chown -R bookbyblock:nodejs /app && \
    chmod -R 755 /app

# Switch to non-root user
USER bookbyblock

# Expose port
EXPOSE 3001

# Add labels for better container management
LABEL maintainer="BookByBlock Team" \
      version="2.0.0" \
      description="BookByBlock Backend API - Modern Web3 Ticketing Platform"

# Health check with improved reliability
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { hostname: 'localhost', port: 3001, path: '/health', timeout: 5000 }; \
    const req = http.request(options, (res) => process.exit(res.statusCode === 200 ? 0 : 1)); \
    req.on('error', () => process.exit(1)); \
    req.on('timeout', () => process.exit(1)); \
    req.end();"

# Environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    NODE_OPTIONS="--enable-source-maps --max-old-space-size=512"

# Start application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
