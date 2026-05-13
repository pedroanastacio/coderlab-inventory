# AGENTS.md - Coderlab Inventory

## Tech Stack

| Component  | Technology                |
| ---------- | ------------------------- |
| Backend    | NestJS + TypeScript       |
| ORM        | Prisma + PostgreSQL       |
| Frontend   | React + Vite + TypeScript |
| UI         | shadcn/ui + Tailwind CSS  |
| Container  | Docker + docker-compose   |

---

## Commands

### Full Development (Docker)

```bash
docker-compose up --build
```

### Backend Local

```bash
cd back-end
cp .env.example .env
pnpm install
pnpm prisma migrate dev
pnpm start:dev
```

### Frontend

```bash
cd front-end
pnpm install
pnpm dev
```

---

## Architecture

### Backend Clean Architecture

- `domain/` - Entities + Repository interfaces
- `application/` - Use cases
- `infra/` - Controllers, DTOs, Prisma repositories
- `shared/` - Common types and functions

### Frontend (Vite + shadcn/ui)

- `components/ui/` - shadcn components
- `lib/utils.ts` - cn() utility
- `features/` - Organized features

---

## Features

- Product listing
- Filter by name
- Create/edit form
- Delete product
- Responsive layout

---

## Security

- **Never commit `.env` files** — they contain real secrets (DB password, API keys, etc.). `.gitignore` already excludes them.
- **Always keep `.env.example` up to date** — it contains only variables with placeholder values / no sensitive data. Commit this one.
- **Never log or expose environment variables** in logs, console, API responses, or terminal output in shareable environments.
- **Check before committing**: `git diff --cached` to verify no real `.env` got staged.

---

## Skills

- **nestjs-best-practices**: Backend NestJS

---

## References

- Requirements: `docs/requirements.md`
- NestJS Skill: `.agents/skills/nestjs-best-practices/`
- Plans: `docs/superpowers/plans/`
- Specs: `docs/superpowers/specs/`
