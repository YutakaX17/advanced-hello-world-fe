# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS build
ARG CORE_PACKAGE_SOURCE=github:YutakaX17/advanced-hello-world-fe-core#main
WORKDIR /app
RUN apk add --no-cache git
COPY package*.json ./
RUN npm pkg set "dependencies.@yutakax17/advanced-hello-world-fe-core=${CORE_PACKAGE_SOURCE}"
RUN npm install
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:8080/health || exit 1
