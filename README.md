# LeadNest CRM

LeadNest CRM is a multi-tenant CRM SaaS built with Next.js App Router, Prisma, Neon PostgreSQL, and NextAuth.

Users can sign up, log in, create or join organizations, manage organization-scoped lead lists, individual leads, deals, users, dashboard metrics, analytics charts, and activity history. They can also share customer stories and receive organization join-request notifications.

## Documentation

Read these first when working on the project:

```txt
docs/CODEBASE.md
docs/DATABASE_SCHEMA.md
```

- `docs/CODEBASE.md` documents routes, API endpoints, auth, authorization, frontend pages, utilities, tests, and current architecture decisions.
- `docs/DATABASE_SCHEMA.md` documents the Prisma enums, models, relationships, database rules, migrations, and derived metrics.

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

Copy the environment template and fill in its values:

```bash
cp env.sample .env
```

`DATABASE_URL` and `NEXTAUTH_SECRET` are required for sign-in and CRM data. Set
`NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to the URL where the app runs (for
example, `http://localhost:3000` in development). SMTP variables are optional
and enable password-reset and contact email. `CONTACT_EMAIL` optionally chooses
the inbox for contact messages; without it, contact mail goes to `SMTP_USER`.
The contact form reports an error when SMTP is unconfigured. Keep `.env` out of Git.

For a new database, apply the committed migrations and generate Prisma Client:

```bash
npx prisma migrate deploy
npx prisma generate
```

For an existing database, check its migration state before applying migrations:

```bash
npx prisma migrate status
```

This repository does not include a seed script or demo account. Create an account
through `/signup`, then create an organization or request to join one.

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

Check TypeScript and lint:

```bash
npx tsc --noEmit
npm run lint
```

Run Playwright e2e tests:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright starts the app on `http://127.0.0.1:3100` for browser tests.

Run TypeScript manually on Windows:

```powershell
npx tsc --noEmit
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
- password reset by email and password change for signed-in users
- API rate limiting, request body limits, and security headers
- organization onboarding
- organization context
- role-based organization membership checks
- lead lists
- individual leads
- deals
- collapsible desktop navigation and mobile navigation drawer
- responsive public navigation that collapses below desktop width, with a mobile menu
- saved desktop sidebar preference, clear empty states, and workspace quick actions
- dashboard
- analytics
- settings/manage users
- join request accept/decline
- notifications for join requests and their outcomes
- activity logging
- contact form with server-side validation and SMTP delivery
- public customer stories and signed-in story submission
- unit and e2e test foundations

Intentionally skipped for now:

- Stripe billing
- direct third-party integrations
- live collaboration / mouse presence

The public pricing and integrations sections describe their current availability.
They do not advertise plans or connections that the app has not implemented.

## Useful Files

```txt
prisma/schema.prisma
prisma/migrations/
src/app/lib/routeAuth.ts
src/app/context/OrganizationContext.tsx
src/middleware.ts
src/middleware/protectRoutes.ts
src/middleware/security.ts
```

For a complete file-by-file and route-by-route explanation, use `docs/CODEBASE.md`.
