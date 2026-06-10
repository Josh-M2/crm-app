# LeadNest CRM

LeadNest CRM is a multi-tenant CRM SaaS built with Next.js App Router, Prisma, Neon PostgreSQL, and NextAuth.

Users can sign up, log in, create or join organizations, manage organization-scoped lead lists, individual leads, deals, users, dashboard metrics, analytics charts, and activity history.

## Documentation

Read these first when working on the project:

```txt
docs/CODEBASE.md
docs/DATABASE_SCHEMA.md
```

- `docs/CODEBASE.md` documents routes, API endpoints, auth, authorization, frontend pages, utilities, seed data, tests, and current architecture decisions.
- `docs/DATABASE_SCHEMA.md` documents every enum, model, field, relationship, database rule, derived metric, seed behavior, and future schema consideration.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- HeroUI / NextUI
- Prisma ORM
- Neon PostgreSQL
- NextAuth credentials auth with JWT sessions
- SWR
- Axios
- Recharts
- Vitest
- Playwright

## Setup

Install dependencies:

```bash
npm install
```

Create `.env` with:

```txt
NEON_DEV_DATABASE_URL=
NEXTAUTH_SECRET=
```

Generate Prisma Client if needed:

```bash
npx prisma generate
```

Push schema changes to the database when needed:

```bash
npx prisma db push
```

Seed demo CRM data:

```bash
npm run db:seed
```

Demo login after seeding:

```txt
Email: admin@leadnest.test
Password: Password123456
Organization code: leadnest_demo
```

## Development

Start the dev server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Build production output:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

## Tests

Run unit tests:

```bash
npm run test:unit
```

Run Playwright e2e tests:

```bash
npm run test:e2e
```

Run TypeScript manually on Windows:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
```

Test structure:

```txt
tests/
  unit/
  e2e/
```

## Core Rule

Everything in the CRM must be scoped to the selected organization:

- leads
- lead lists
- deals
- dashboard totals
- analytics
- users
- invites
- activities

Organization role is stored in `OrganizationUser`, not on `User`.

## Current Scope

Implemented:

- auth
- organization onboarding
- organization context
- role-based organization membership checks
- lead lists
- individual leads
- deals
- dashboard
- analytics
- settings/manage users
- join request accept/decline
- activity logging
- seed data
- unit and e2e test foundations

Intentionally skipped for now:

- Stripe billing
- live collaboration / mouse presence

## Useful Files

```txt
prisma/schema.prisma
prisma/seed.cjs
src/app/lib/routeAuth.ts
src/app/context/OrganizationContext.tsx
src/middleware.ts
src/middleware/protectRoutes.ts
```

For a complete file-by-file and route-by-route explanation, use `docs/CODEBASE.md`.
