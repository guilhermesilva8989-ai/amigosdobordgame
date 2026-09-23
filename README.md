# Amigos do Board Game

Painel financeiro para organizar o fundo de um grupo de jogos de tabuleiro. A página pública permite acompanhar entradas, despesas, saldo, participantes e meta financeira. As alterações são feitas na área administrativa, protegida por login.

![Banner do Amigos do Board Game](apps/web/public/banner-horizontal.png)

## Funcionalidades

- Painel público com resumo financeiro e movimentações recentes.
- Participantes exibidos por apelidos, preservando seus nomes na consulta pública.
- Meta financeira com acompanhamento do progresso.
- Área administrativa para gerenciar participantes, contribuições, despesas e meta.
- Configurações da página inicial, incluindo banner, textos e opções de exibição.
- Autenticação de administrador com JWT.

## Tecnologias

React, Vite e TypeScript no frontend; NestJS, Prisma e PostgreSQL na API. O projeto também utiliza Docker Compose e Vitest.

## Estrutura

- `apps/web`: página pública e área administrativa.
- `apps/api`: API, regras de negócio, testes e migrações do banco.
- `compose.yaml`: serviços locais do Docker Compose.
- `.env.example`: exemplo das variáveis de ambiente.

## Executar localmente

Pré-requisitos: Node.js 24, npm e Docker Desktop.

1. Instale as dependências e prepare as variáveis de ambiente:

   ```bash
   npm install
   cp .env.example .env
   ```

2. Confira e ajuste os valores em `.env` para o seu ambiente. Inicie o banco:

   ```bash
   docker compose up -d
   ```

3. Aplique as migrações do Prisma conforme a configuração em `apps/api`. Inicie a API e o frontend em terminais separados:

   ```bash
   npm run start:dev --workspace=apps/api
   ```

   ```bash
   npm run dev --workspace=apps/web
   ```

## Verificação

```bash
npm run lint --workspace=apps/api
npm run build --workspace=apps/api
npm run test --workspace=apps/api
npm run lint --workspace=apps/web
npm run build --workspace=apps/web
```

O painel público é somente para consulta. Para cadastrar ou modificar dados, acesse a área administrativa.
