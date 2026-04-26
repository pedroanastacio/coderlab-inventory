# AGENTS.md - Coderlab Inventory

## Tech Stack

| Componente | Tecnologia                |
| ---------- | ------------------------- |
| Backend    | NestJS + TypeScript       |
| ORM        | Prisma + PostgreSQL       |
| Frontend   | React + Vite + TypeScript |
| UI         | shadcn/ui + Tailwind CSS  |
| Container  | Docker + docker-compose   |

---

## Commands

### Desenvolvimento Completo (Docker)

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

## Arquitetura

### Backend Clean Architecture

- `domain/` - Entities + Repository interfaces
- `application/` - Use cases
- `infra/` - Controllers, DTOs, Prisma repositories
- `shared/` - Common types and functions

### Frontend (Vite + shadcn/ui)

- `components/ui/` - shadcn components
- `lib/utils.ts` - cn() utility
- `features/` - Features organizadas

---

## Features

- Listagem de produtos
- Filtro por nome
- Formulário criação/edição
- Exclusão de produto
- Layout responsivo

---

## Skills

- **nestjs-best-practices**: Backend NestJS

---

## Referências

- Requisitos: `docs/requirements.md`
- Skill NestJS: `.agents/skills/nestjs-best-practices/`
