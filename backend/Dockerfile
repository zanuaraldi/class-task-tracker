# Production-ready Bun Dockerfile for Class Task Tracker Backend
FROM oven/bun:1.2-alpine AS base
WORKDIR /app

# Copy root monorepo config files
COPY package.json bun.lock tsconfig.base.json ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

# Install workspace dependencies
RUN bun install --frozen-lockfile

# Copy shared source & backend source
COPY shared/ ./shared/
COPY backend/ ./backend/

# Working directory
WORKDIR /app/backend

# Expose backend port
EXPOSE 3000

ENV NODE_ENV=production

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Default execution command
CMD ["bun", "run", "src/index.ts"]
