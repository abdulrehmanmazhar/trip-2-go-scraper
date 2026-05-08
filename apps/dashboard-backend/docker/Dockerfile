# Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy configs for local packages
COPY configs ./configs

# Set working directory
WORKDIR /app/level1/level2

# Copy package files
COPY apps/dashboard-backend/package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY apps/dashboard-backend .

# Build the application
RUN npm run dist

RUN npm run postDist

# Production stage
FROM node:22-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder /app/level1/level2/package*.json ./

# Copy production dependencies
COPY --from=builder /app/level1/level2/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/level1/level2/dist ./dist

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port
EXPOSE 4000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]