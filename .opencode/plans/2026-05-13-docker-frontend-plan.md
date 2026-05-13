# Docker Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `frontend` service to docker-compose so `docker-compose up --build` starts db + backend + frontend with a single command.

**Architecture:** Vite dev server runs inside a Node 24 Alpine container with HMR via polling. The browser accesses both frontend (:5173) and backend (:3000) through host-mapped ports, so no API URL changes are needed.

**Tech Stack:** Docker, docker-compose, React + Vite + TypeScript

---

### Task 1: Create `front-end/Dockerfile`

**Files:**
- Create: `front-end/Dockerfile`

- [ ] **Step 1: Write the Dockerfile**

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

- [ ] **Step 2: Verify the file exists**

Run: `ls -la front-end/Dockerfile`
Expected: file exists, readable

---

### Task 2: Update `front-end/vite.config.ts`

**Files:**
- Modify: `front-end/vite.config.ts`

- [ ] **Step 1: Add `server` block to Vite config**

Current content:

```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Change to:

```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
})
```

- [ ] **Step 2: Verify syntax**

Run: `cd front-end && npx tsc --noEmit`
Expected: No type errors

---

### Task 3: Update `docker-compose.yml`

**Files:**
- Modify: `docker-compose.yml`

- [ ] **Step 1: Add `frontend` service**

Current file ends at line 35 with:

```yaml
volumes:
  pgdata:
```

Add after the `backend` service block (before `volumes:`):

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

Full resulting `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    ports:
      - "${DATABASE_PORT}:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER} -d ${DATABASE_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./back-end
      dockerfile: Dockerfile
    command: pnpm start:dev
    volumes:
      - ./back-end:/app
      - /app/node_modules
    ports:
      - "${BACKEND_PORT}:3000"
    depends_on:
      db:
        condition: service_healthy
    env_file:
      - ./back-end/.env

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

volumes:
  pgdata:
```

- [ ] **Step 2: Validate YAML**

Run: `docker-compose config`
Expected: No errors, shows all 3 services (db, backend, frontend)

---

### Task 4: Full integration test

- [ ] **Step 1: Build and start all services**

Run: `docker-compose up --build -d`
Expected: Docker builds images and starts containers for db, backend, frontend

- [ ] **Step 2: Verify all containers are running**

Run: `docker-compose ps`
Expected: All 3 services show status "Up"

- [ ] **Step 3: Check frontend is serving**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173`
Expected: `200`

- [ ] **Step 4: Check HMR WebSocket is accessible**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/__vite_ping`
Expected: `200`

- [ ] **Step 5: Tear down**

Run: `docker-compose down -v`
Expected: Containers and volumes removed

---

### Task 5: Update AGENTS.md with new command

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Update commands section**

Replace the "Full Development (Docker)" section from:

```markdown
### Full Development (Docker)

```bash
docker-compose up --build
```
```

To reflect that this now starts everything including the frontend (no change needed to the command itself — it already says `docker-compose up --build`).

No change needed — the existing `docker-compose up --build` already covers it.

- [ ] **Step 2: Commit all changes**

```bash
git add front-end/Dockerfile front-end/vite.config.ts docker-compose.yml
git commit -m "feat: add frontend to docker-compose for single-command setup"
```
