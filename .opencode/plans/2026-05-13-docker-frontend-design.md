# Docker Frontend — Design Spec

Date: 2026-05-13
Status: Approved (2026-05-13)

## Problem

`docker-compose up` starts only `db` (PostgreSQL) and `backend` (NestJS). The frontend (React + Vite) requires a separate `pnpm dev` command, forcing evaluators of the technical challenge to install Node/pnpm and manage an extra terminal.

## Goal

A single `docker-compose up --build` starts all three services (db, backend, frontend). The frontend must retain Hot Module Replacement (HMR) for development convenience.

## Approach

Add a `frontend` service to `docker-compose.yml` with its own Dockerfile, running Vite's dev server inside the container. Vite's HMR works via polling (`usePolling: true`) to detect filesystem changes through Docker's volume mount.

### Why no API URL changes needed

The React app's axios calls (e.g., `http://localhost:3000`) execute in the **browser**, not inside the container. Since the backend port is mapped to the host, the same URL works unchanged.

## Changes

### 1. Create `front-end/Dockerfile`

```dockerfile
FROM node:24-alpine
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 5173
CMD ["pnpm", "dev"]
```

### 2. Modify `front-end/vite.config.ts`

Add `server` block to `defineConfig`:

```ts
server: {
  host: true,
  port: 5173,
  watch: { usePolling: true },
},
```

- `host: true` — binds Vite to `0.0.0.0`, required inside Docker
- `port: 5173` — explicit port (matches docker-compose mapping)
- `watch.usePolling: true` — enables HMR through Docker volume mounts

### 3. Modify `docker-compose.yml`

Add `frontend` service:

```yaml
frontend:
  build:
    context: ./front-end
    dockerfile: Dockerfile
  command: pnpm dev
  volumes:
    - ./front-end:/app
    - /app/node_modules
  ports:
    - "5173:5173"
  depends_on:
    - backend
```

## Resulting flow

```
docker-compose up --build
  → db     (PostgreSQL, port 5432)
  → backend (NestJS,  port 3000)
  → frontend (Vite,   port 5173) ← new
```

Open `http://localhost:5173` → everything works. Edit frontend code → HMR reloads in the browser. One command, zero manual setup.

## Non-goals

- Production-grade multi-stage build or Nginx serving — unnecessary for a dev challenge, adds complexity without benefit.
- CI/CD changes — out of scope.
- Test configuration changes — e2e tests already target `localhost` URLs and work unchanged.
