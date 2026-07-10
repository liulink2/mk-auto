# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`mk-auto` is the management system for **MK Autoteck Centre**, an auto workshop. It tracks car services/invoices, parts & supplies purchasing, suppliers, expenses, and reconciles inventory. Built on Next.js 15 (App Router) + React 19, Prisma + PostgreSQL, NextAuth, Ant Design, and OpenAI vision for invoice extraction.

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml`).

```bash
pnpm dev            # dev server (Next.js with --turbopack) on :3000
pnpm build          # production build
pnpm start          # serve production build
pnpm lint           # next lint (eslint: next/core-web-vitals + next/typescript)

pnpm prisma generate       # regenerate client (also runs on postinstall)
pnpm prisma migrate dev    # create/apply a migration against dev DB
pnpm prisma studio         # inspect data

docker compose up -d       # local Postgres 16 (db mk_auto, postgres/postgres on :5432)
```

There is **no test framework** configured — do not assume `pnpm test` exists.

## Required env

`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `OPENAI_API_KEY` (see `.env` / `.env.local`).

## Architecture

**App Router layout.** `src/app/` holds both pages and API routes. UI pages live under `src/app/dashboard/<feature>/`; each feature owns local `components/`, `hooks/`, `types.ts`, and `utils/`. API handlers are `src/app/api/<resource>/route.ts` (+ `[id]/route.ts` for item-scoped ops). Path alias `@/*` → `src/*`.

**Auth (NextAuth v4, JWT strategy).**
- `src/auth/authOptions.ts` — credentials provider, bcrypt password check, Prisma adapter. JWT/session callbacks copy `id`, `username`, `role` onto the token/session. Session type augmented in `src/types/next-auth.d.ts`.
- `src/middleware.ts` — `withAuth` gate; requires a token for **all** routes except `/login`, `/register`, `/api/*`, and Next static assets.
- Roles are `ADMIN | MANAGER`. **API routes are NOT covered by the middleware matcher** — each route must call `getServerSession(authOptions)` and check `session.user.role` itself. This is applied inconsistently today: e.g. `api/users` enforces ADMIN, but most CRUD routes (`car-services`, `supplies`, `inventory/settle`) do no auth check. When adding endpoints, add the session/role guard explicitly.

**Data model (`prisma/schema.prisma`, PostgreSQL).** Core domain entities: `CarService` (+ `CarServiceItem` of type `SERVICE` or `PARTS`), `Supply` (+ `Supplier`, self-referential hierarchy via `parentId`), `Expense`, `ServiceExtraInfo`, `User`. Auth tables (`Account`/`Session`/`VerificationToken`) back NextAuth.
- **Denormalized `month`/`year` Int columns** exist on `CarService`, `Supply`, `Expense` and are indexed — all listing/filtering is by month+year. They are derived **server-side** from the record's date (e.g. `carInDateTime`), not sent by the client. Preserve this when writing create/update handlers.
- **Money types are mixed:** `Supply` uses Prisma `Decimal` (with `decimal.js`); `CarService`/`CarServiceItem`/`Expense` use `Float`. Match the existing type per model.

**Inventory reconciliation (the `settled` flag).** Both `Supply` and `CarServiceItem` carry `settled: Boolean`. `Supply.mappedNames` (+ the `supplies/[id]/mapping` route) link purchased supplies to the part names sold on car services. `POST /api/inventory/settle` bulk-marks given `supplyIds` and `carServiceItemIds` as settled. Listing endpoints default to `settled: false` and only include settled rows when `includeSettled=true`.

**OpenAI invoice extraction.** `POST /api/supplies/extract-invoice` sends a base64 image to `gpt-4.1-mini` (vision) with a fixed prompt and parses the returned JSON into supply line items. Model name and prompt are hardcoded in that route.

**Client providers.** `src/app/layout.tsx` wraps the tree in `CompanySettingsProvider` → `Providers` (`SessionProvider` + Ant Design `AntdRegistry` + `App`). The React 19 compatibility shim `@ant-design/v5-patch-for-react-19` is imported once in the root layout — keep it.

**Company settings are hardcoded**, not persisted: `src/contexts/CompanySettingsContext.tsx` returns a static `defaultSettings` object (name, address, ABN, etc.) used for invoice rendering. Edit that file to change company details.

## Conventions

- TypeScript `strict` is on. Prefer Prisma-generated types/enums (`Role`, `ServiceType`, `PaymentType`, `DiscountType`) from `@prisma/client` over redefining them.
- Use the shared Prisma singleton from `@/lib/prisma` (guards against multiple clients in dev) — never `new PrismaClient()` in route/component code.
- API error pattern: `try/catch`, `console.error`, return `NextResponse.json({ error }, { status })`.
- UI is Ant Design components + Tailwind 4 utility classes.
