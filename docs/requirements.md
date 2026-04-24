# Teste Técnico – Desenvolvedor(a) Backend/Fullstack (Atualizado)

## 1. Objetivo

Desenvolver uma aplicação simples de gerenciamento de produtos, com foco na qualidade do código, organização, arquitetura e capacidade de tomada de decisão.

**IMPORTANTE:** O objetivo não é apenas entregar funcionalidades, mas também demonstrar como você pensa e estrutura soluções.

---

## 2. Tecnologias

### Backend

- Node.js (v20 ou superior)
- Typescript
- NestJS
- Banco de dados: PostgreSQL, MySQL, ou SQLite
- ORM: Prisma ou TypeORM

### Frontend

- React (Vite + react-ts)
- React Router

### Diferenciais

- Docker
- Testes automatizados

---

## 3. Requisitos Backend

### Categoria

- `GET /category`

### Produto

- `GET /product` (com filtro por nome)
- `GET /product/:id`
- `POST /product`
- `PATCH /product/:id`
- `DELETE /product/:id`

### Regras de negócio obrigatórias

- Produto deve ter pelo menos uma categoria
- Preço não pode ser negativo
- Categoria não pode ter loop de hierarquia

---

## 4. Requisitos Frontend

- Listagem de produtos
- Filtro por nome
- Formulário de criação/edição
- Exclusão de produto
- Layout responsivo

---

## 5. Uso de Inteligência Artificial

Você pode utilizar IA (ChatGPT, Copilot, etc).

### Obrigatório:

- Informar qual IA utilizou
- Em quais partes utilizou
- Exemplos de prompts
- O que foi adaptado por você
- O que corrigiu da IA

---

## 6. Arquitetura

Crie um diagrama simples mostrando:

- Estrutura do backend
- Fluxo de requisição
- Organização de módulos

---

## 7. Decisões Técnicas

Explique:

- Escolha de ORM
- Organização do projeto
- Tratamento de erros
- Escalabilidade
- Melhorias para produção

---

## 8. Entregáveis

- Link do GitHub
- README com instruções
- Explicação técnica
- Diagrama
- Seção sobre uso de IA

---

## 9. Avaliação

- Código: 30%
- Arquitetura: 25%
- Decisões técnicas: 20%
- Uso de IA: 15%
- Organização: 10%
