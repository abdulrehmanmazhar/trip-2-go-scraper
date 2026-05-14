# -------------------
# Build stage
# -------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy full monorepo structure
COPY configs ./configs
COPY packages ./packages
COPY apps ./apps

# Install only for dashboard-backend
WORKDIR /app/apps/dashboard-backend

RUN npm install

# Build
RUN npm run dist
RUN npm run postDist

WORKDIR /app/packages/ws-core

RUN npm install

RUN npm run build


# -------------------
# Production stage
# -------------------
FROM node:22-alpine

RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy ONLY needed parts
COPY --from=builder /app/apps/dashboard-backend ./apps/dashboard-backend
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/configs ./configs

WORKDIR /app/apps/dashboard-backend

RUN npm prune --omit=dev

USER nodejs

EXPOSE 4000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]