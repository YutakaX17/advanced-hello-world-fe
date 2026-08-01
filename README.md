# Advanced Hello World Frontend

Deployable Vite, React, and TypeScript assembler. It provides the browser entry
point, build configuration, backend proxy, and unprivileged Nginx container. UI
contracts and feature behavior come from separately versioned packages.

`modules.json` is the authoritative, schema-validated record of packages
selected by this assembler. It pins repositories to full commit SHAs and drives
package installation, generated typed registration, styles, installed-version
checks, and compatibility validation.

## Requirements

- Git
- Node.js 22
- npm
- A backend at `http://localhost:8000` for native application use
- Docker Engine with Compose for container workflows

## Native setup without Docker

Clone the frontend repositories as siblings:

```bash
git clone https://github.com/YutakaX17/advanced-hello-world-fe-core.git
git clone https://github.com/YutakaX17/advanced-hello-world-fe-messages.git
git clone https://github.com/YutakaX17/advanced-hello-world-fe.git
cd advanced-hello-world-fe
npm run modules:install -- --local-root ..
npm run dev
```

Omit `--local-root ..` in a clean workspace to clone the immutable commits
recorded by the manifest. The installer builds core first, builds each selected
feature, installs the assembler, generates `src/generated-modules.ts`, and
verifies installed package versions.

Open <http://localhost:5173>. Vite proxies `/api` to
`http://localhost:8000`, so start the native Django backend described in the
[backend README](https://github.com/YutakaX17/advanced-hello-world-be#native-setup-without-docker).

To use another API origin, create `.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8000/api
```

Do not commit `.env.local`.

## Hybrid setup

A productive development arrangement is:

```text
PostgreSQL container :5432
          ↓
Native Django        :8000
          ↑ /api
Native Vite          :5173
```

Use the backend README to start PostgreSQL in Docker and Django natively, then
run `npm run dev` here. This keeps browser and server hot reload while avoiding
a local PostgreSQL installation.

## Docker setup

Build the frontend image directly. The build installs the exact module commits
selected by `modules.json`:

```bash
docker build -t advanced-hello-world-fe:local .
```

The container listens on port `8080`, serves the SPA, and proxies `/api` to a
service named `backend`. Therefore, use the
[distribution repository](https://github.com/YutakaX17/advanced-hello-world)
for the complete networked stack:

```bash
git clone https://github.com/YutakaX17/advanced-hello-world.git
cd advanced-hello-world
cp .env.example .env
docker compose up -d --wait
```

## Development and verification

```bash
npm run format:check
npm run lint
npm run modules:check
npm run typecheck
npm test
npm run build
```

## Production and releases

The final image uses unprivileged Nginx and exposes port `8080`. Its container
health endpoint is `/health`. Released images are published at
`ghcr.io/yutakax17/advanced-hello-world-fe` with immutable version tags, image
provenance, and SBOM attestations. A successful version-tag build also creates
a GitHub Release with immutable image metadata, an SPDX image SBOM, and SHA-256
checksums.

Pull requests run frontend quality checks, dependency review, CodeQL, secret
scanning, and vulnerability scanning. See [CONTRIBUTING.md](CONTRIBUTING.md),
[SECURITY.md](SECURITY.md), and the
[releases](https://github.com/YutakaX17/advanced-hello-world-fe/releases).

## Repository family

- [Backend core](https://github.com/YutakaX17/advanced-hello-world-be-core)
- [Backend assembler](https://github.com/YutakaX17/advanced-hello-world-be)
- [Frontend core](https://github.com/YutakaX17/advanced-hello-world-fe-core)
- [Frontend messages](https://github.com/YutakaX17/advanced-hello-world-fe-messages)
- [All-in-one distribution](https://github.com/YutakaX17/advanced-hello-world)
