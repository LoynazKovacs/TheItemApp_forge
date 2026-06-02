# syntax=docker/dockerfile:1
#
# Forge API backend: Fastify app-container that registers the Forge manifest
# (models, dashboards, windows, lookups) with core, serves its seed bundle, and
# stays alive for the health check so the app persists in the core catalog.
#

FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
RUN npm install
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npx tsc -p tsconfig.json

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./
RUN npm install --omit=dev

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY dbseed ./dbseed

EXPOSE 3011

HEALTHCHECK --interval=10s --timeout=5s --retries=10 --start-period=30s \
  CMD node -e "require('http').get('http://127.0.0.1:3011/api/health', (r) => { r.resume(); process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

CMD ["node", "dist/index.js"]
