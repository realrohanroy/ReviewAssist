# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/frontend/package*.json ./packages/frontend/

RUN npm ci

# Copy full repository source
COPY . .

# Generate Prisma Client and build backend
RUN cd packages/backend && npx prisma generate && npm run build

# Stage 2: Production runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Security: Install OpenSSL for Prisma and dumb-init for PID 1 signal handling
RUN apk add --no-cache openssl dumb-init

# Copy workspace package manifests
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Install only production dependencies
RUN npm ci --omit=dev --workspace=@review-collector/backend

# Copy generated Prisma schema and client
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Run as non-root node user
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "packages/backend/dist/index.js"]
