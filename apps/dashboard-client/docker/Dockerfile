# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY configs ./configs

WORKDIR /app/level1/level2

COPY apps/dashboard-client/package*.json ./

RUN npm install

COPY apps/dashboard-client .

COPY apps/dashboard-client/vite.config.ts ./

RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/level1/level2/package*.json ./
COPY --from=builder /app/level1/level2/node_modules ./node_modules
COPY --from=builder /app/level1/level2/dist ./dist
COPY --from=builder /app/level1/level2/vite.config.ts ./vite.config.ts

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
