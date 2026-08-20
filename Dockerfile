FROM node:20-alpine AS frontend-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM frontend-deps AS frontend-builder
WORKDIR /app
COPY . .
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_POCKETBASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_POCKETBASE_URL=$VITE_POCKETBASE_URL
RUN npm run build

FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY backend/ ./

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs appuser \
  && mkdir -p /app/logs /app/dist \
  && chown -R appuser:nodejs /app

COPY --from=backend-builder --chown=appuser:nodejs /app /app
COPY --from=frontend-builder --chown=appuser:nodejs /app/dist /app/dist
COPY --chown=appuser:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER appuser
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/healthcheck || exit 1

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
