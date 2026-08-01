# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS build
WORKDIR /app
RUN apk add --no-cache git
COPY package*.json modules.json ./
COPY scripts ./scripts
RUN node scripts/install-modules.mjs
COPY . .
RUN npm run modules:check
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.31-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:8080/health || exit 1
