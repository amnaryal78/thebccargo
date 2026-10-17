# ==============================================================================
# The BC Cargo & Courier — Multi-Stage Production Dockerfile
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency manifests and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy only server runtime files and compiled dist assets
COPY package.json ./
COPY server.js ./
COPY --from=builder /app/dist ./dist

# Run as non-root user for container security
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
