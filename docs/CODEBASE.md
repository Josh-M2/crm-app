# Codebase Documentation

## Purpose

This project is a multi-tenant CRM SaaS built with Next.js App Router. Users can sign up, log in, create or join organizations, and manage organization-scoped lead lists, leads, deals, dashboard metrics, analytics, settings, join requests, roles, and activity history.

The most important application rule is:

```txt
All CRM data must be scoped to the selected organization.
```

That means leads, lead lists, deals, dashboard totals, analytics, organization users, invites, and activities should always be queried with an organization ID and protected by organization membership checks.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- HeroUI / NextUI components
- Prisma ORM
- Neon PostgreSQL
- NextAuth credentials auth with JWT sessions
- SWR for client-side fetching and mutation
- Axios for client API calls
- Recharts for analytics charts
- Vitest for unit tests
- Playwright for end-to-end tests

## Important Commands

```bash
npm run dev
npm run build
npm run start
npm run db:seed
npm run test:unit
npm run test:e2e
```

On Windows, direct local binaries can be run with:

```powershell
npx tsc --noEmit
```

## Environment Variables

The application expects these values in `.env`:

```txt
DATABASE_URL
NEXTAUTH_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
```

`DATABASE_URL` is used by Prisma. `NEXTAUTH_SECRET` is used by NextAuth JWT token verification.
SMTP values are used by the password reset email flow. If they are missing, reset email delivery is treated as unconfigured.

## Top-Level Structure

```txt
prisma/
  schema.prisma
  seed.cjs

src/
  app/
    (Landing)/
    (auth)/
    (protected)/
    api/
    assets/
    components/
    context/
    lib/
    types/
  middleware/
  middleware.ts

tests/
  unit/
  e2e/

docs/
  CODEBASE.md
  DATABASE_SCHEMA.md
```

## Route Groups

### Landing Routes

```txt
src/app/(Landing)/page.tsx
src/app/(Landing)/contact/page.tsx
```

These routes are public marketing/landing pages. They use the shared landing components in:

```txt
src/app/components/landing/
```

### Auth Routes

```txt
src/app/(auth)/login/page.tsx
src/app/(auth)/signup/page.tsx
src/app/(auth)/reset-password/page.tsx
```

The login page uses NextAuth credentials sign-in. The signup page calls the custom signup API and then signs in using credentials.
The login page also exposes the forgot-password flow, which sends reset links through SMTP. The reset-password page validates a token before accepting a new password.

Authenticated users are redirected away from `/login`, `/signup`, and `/reset-password` to `/dashboard` by middleware.

### Protected App Routes

```txt
src/app/(protected)/dashboard/page.tsx
src/app/(protected)/analytics/page.tsx
src/app/(protected)/leads/page.tsx
src/app/(protected)/leads/[categorized_lead_id]/page.tsx
src/app/(protected)/deals/page.tsx
src/app/(protected)/settings/page.tsx
src/app/(protected)/settings/manage-users/page.tsx
```

These routes are protected by middleware. Users without a valid token are redirected to `/login`.

## Middleware

Middleware entry:

```txt
src/middleware.ts
```

Protection helper:

```txt
src/middleware/protectRoutes.ts
```

Security helper:

```txt
src/middleware/security.ts
```

Protected route prefixes:

```txt
/analytics
/dashboard
/deals
/leads
/settings
/testimony
```

Auth routes:

```txt
/login
/signup
/reset-password
```

Behavior:

- all `/api/:path*` requests pass through the security middleware
- API requests are rate limited by client IP and path
- sensitive auth endpoints are limited more strictly than general API endpoints
- oversized API request bodies are rejected before route handlers run
- baseline security headers are applied to middleware responses
- unauthenticated users visiting protected app routes are redirected to `/login`
- a `callbackUrl` query parameter is attached for protected redirects
- authenticated users visiting `/login`, `/signup`, or `/reset-password` are redirected to `/dashboard`
- nested protected routes are covered, including `/leads/[categorized_lead_id]` and `/settings/manage-users`

Current API rate limits:

```txt
General API routes: 120 requests per minute per client IP and path
Sensitive auth routes: 10 requests per minute per client IP and path
Maximum API request body size: 1 MB
```

Sensitive auth routes:

```txt
/api/auth/callback/credentials
/api/auth/signin
/api/auth/signup
/api/auth/forgot-password
/api/auth/reset-password
/api/auth/change-password
```

Security headers applied by middleware:

```txt
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-DNS-Prefetch-Control: off
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

## Authentication

### NextAuth Handler

```txt
src/app/api/auth/[...nextauth]/route.ts
```

This route handles NextAuth authentication. The app uses JWT sessions and credentials login.
Credential login normalizes emails with `trim().toLowerCase()`, compares passwords with bcrypt, and returns only safe user fields to NextAuth.

### Signup API

```txt
src/app/api/auth/signup/route.ts
```

Behavior:

- accepts `name`, `email`, and `password`
- rejects missing email/password
- normalizes email with `trim().toLowerCase()`
- requires passwords to be at least 12 characters
- rejects duplicate email
- hashes password with `bcrypt` cost 12
- creates a `User`
- returns only safe user fields: `id`, `email`, and `name`

### Token Check API

```txt
src/app/api/auth/check-token/route.ts
```

This checks whether a NextAuth token exists and returns an unauthorized response if it does not.

### Password Reset APIs

```txt
src/app/api/auth/forgot-password/route.ts
src/app/api/auth/reset-password/route.ts
```

`forgot-password` accepts an email address, creates a short-lived reset token for matching users, and sends a reset email when SMTP is configured.

`reset-password` validates reset tokens with `GET` and updates the user password with `POST`. Reset links expire after 30 minutes and are invalidated after a successful password update.

## Authorization Helpers

File:

```txt
src/app/lib/routeAuth.ts
```

Functions:

- `getCurrentUser(req)`
  - reads the JWT token from the request
  - requires a token email
  - loads the matching user from the database
  - returns either `{ user }` or `{ response }`

- `getOrgMembership(req, organizationId)`
  - calls `getCurrentUser`
  - verifies the user belongs to the organization
  - returns the user and membership role
  - returns `403` if the user is not in the organization

- `requireOrgRole(role, allowedRoles)`
  - checks role authorization
  - returns a `NextResponse` when unauthorized

- `isOrgUser(userId, organizationId)`
  - checks whether a user belongs to an organization
  - used when assigning lead owners, assignees, and deal owners

## Organization Context

File:

```txt
src/app/context/OrganizationContext.tsx
```

The context stores:

- `selectedOrg`
- `organizations`
- `setSelectedOrg`
- `setOrganizations`
- `isLoading`

The selected organization is persisted in `localStorage` under:

```txt
selectedOrg
```

This context fetches the signed-in user's organizations from:

```txt
GET /api/organization/fetch-org
```

The active organization controls dashboard, analytics, leads, deals, settings, and manage-users data.

## API Routes

### Auth

```txt
POST /api/auth/signup
GET  /api/auth/check-token
POST /api/auth/forgot-password
GET  /api/auth/reset-password
POST /api/auth/reset-password
*    /api/auth/[...nextauth]
```

### Organization

```txt
POST /api/organization/create-org
GET  /api/organization/fetch-org
GET  /api/organization/fetch-org-users
POST /api/organization/setup-user
```

`create-org` creates an organization owned by the current user and creates an `ADMIN` `OrganizationUser` membership for that owner.

`fetch-org` returns organizations for the current user.

`fetch-org-users` returns organization members using narrowed user fields:

```txt
id
name
email
role
```

`setup-user` manages role changes and membership removal. It requires `ADMIN` and protects against:

- managing your own membership
- removing or demoting the organization owner
- removing or demoting the final remaining admin

### Organization Join Requests

```txt
POST /api/organization/join-org/request
GET  /api/organization/join-org/fetch-requests
POST /api/organization/join-org/accept-request
POST /api/organization/join-org/delete-request
```

`request` creates an invite/join request for an organization code.

`fetch-requests` requires `ADMIN` and returns pending, unaccepted invites for the selected organization.

`accept-request` requires `ADMIN`, marks an invite accepted, and creates or reuses an `OrganizationUser` membership with role `AGENT`.

`delete-request` requires `ADMIN`, deletes the invite, and logs an activity saying the request was declined.

### Dashboard

```txt
GET /api/dashboard/init-dashboard
```

Requires `selectedOrg`.

Uses `getOrgMembership`.

Returns:

- total leads
- active deals
- conversion rate
- won revenue
- recent activities

Current metric rules:

- total leads: count of leads in selected organization
- converted leads: leads with status `CONVERTED`
- conversion rate: converted leads divided by total leads
- active deals: count of deals with status `PENDING`
- revenue: sum of deals with status `WON`
- recent activities: latest eight activities in selected organization

Activity responses intentionally select only safe user fields and do not return password hashes.

### Analytics

```txt
GET /api/analytics/init-analytics
```

Requires `selectedOrg`.

Uses `getOrgMembership`.

Returns:

- revenue over time
- leads by status
- monthly new leads

Metric rules:

- revenue over time: `WON` deals grouped by updated month
- leads by status: leads grouped by `LeadStatus`
- monthly new leads: leads grouped by created month

### Lead Lists

Lead lists are represented by the `LeadCategory` model.

```txt
GET  /api/leads/manage-lead-category/fetch-organization-leads
POST /api/leads/manage-lead-category/add-categorized-lead
POST /api/leads/manage-lead-category/delete-categorized-lead
```

`fetch-organization-leads` returns lead lists for the selected organization, including owner and assigned user previews.

`add-categorized-lead` creates a lead list with:

- name
- owner
- assigned user
- organization

The owner and assigned user must be members of the selected organization.

`delete-categorized-lead` requires `ADMIN` and deletes a lead list for the selected organization.

### Individual Leads

```txt
GET  /api/leads/manage-lead-list/fetch-lead-list
POST /api/leads/manage-lead-list/add-lead-item
POST /api/leads/manage-lead-list/update-lead-item
POST /api/leads/manage-lead-list/delete-lead
```

Individual leads belong to an organization and may belong to a lead list through `categoryId`.

Create/update accepts:

- name
- company
- lead email
- status
- organization ID
- category ID

Delete requires `ADMIN`.

Create, update, and delete actions write activity records.

### Deals

```txt
GET  /api/deals/fetch-deals-data
POST /api/deals/add-deal
POST /api/deals/update-deal
POST /api/deals/delete-deal
```

Deals belong to an organization and an owner.

Deal owner must be an organization member.

Delete requires `ADMIN`.

Create, update, and delete actions write activity records.

## Frontend Pages

### Dashboard

File:

```txt
src/app/(protected)/dashboard/page.tsx
```

Uses:

```txt
src/app/lib/dashboard/api.ts
src/app/lib/dashboard/helpers.ts
src/app/types/dashboard.ts
```

Displays:

- Total Leads
- Active Deals
- Conversion Rate
- Revenue
- Recent Activity

If no organization is selected, renders `SetUpOrg`.

### Analytics

File:

```txt
src/app/(protected)/analytics/page.tsx
```

Uses:

```txt
src/app/lib/analytics/api.ts
src/app/types/analytics.ts
```

Displays:

- Revenue Over Time line chart
- Leads by Status pie chart
- Monthly New Leads bar chart

If no organization is selected, renders `SetUpOrg`.

### Leads

Main lead list page:

```txt
src/app/(protected)/leads/page.tsx
```

Nested individual lead page:

```txt
src/app/(protected)/leads/[categorized_lead_id]/page.tsx
```

Terminology:

- "Lead List" in the UI maps to `LeadCategory` in the database.
- Individual lead records map to `Lead`.
- Lead list owner is usually an `AGENT`.
- Assigned user is usually a `MINER`.

The main leads page shows lead lists with:

- list name
- owner
- assigned user
- actions

The nested page shows individual leads in that list.

### Deals

File:

```txt
src/app/(protected)/deals/page.tsx
```

Uses:

```txt
src/app/lib/deals/api.ts
src/app/lib/deals/constants.ts
src/app/lib/deals/helpers.ts
src/app/lib/deals/mutations.ts
src/app/types/deals.ts
```

Displays a table of deals and supports modal-based create, update, and delete actions.

### Settings

Settings page:

```txt
src/app/(protected)/settings/page.tsx
```

Manage users page:

```txt
src/app/(protected)/settings/manage-users/page.tsx
```

Manage users supports:

- viewing organization users
- changing roles
- removing users
- viewing join requests
- accepting join requests
- declining join requests

Admin protections live in API routes, not only the UI.

## Shared Components

```txt
src/app/components/Navbar.tsx
src/app/components/Footer.tsx
src/app/components/Sidebar.tsx
src/app/components/SetUpOrg.tsx
src/app/components/UserAvatar.tsx
```

`SetUpOrg` lets a signed-in user create a new organization or request to join an existing organization by organization code.

Landing components:

```txt
src/app/components/landing/CTASection.tsx
src/app/components/landing/FeaturesSection.tsx
src/app/components/landing/Home.tsx
src/app/components/landing/IntegrationsSection.tsx
src/app/components/landing/PricingSection.tsx
src/app/components/landing/TestimonialSection.tsx
```

## Utility Modules

```txt
src/middleware/security.ts
```

Applies API request throttling, request body size protection, and baseline HTTP security headers.

```txt
src/app/lib/axiosInstance.ts
```

Creates an Axios instance with `baseURL: "/api"`.

```txt
src/app/lib/prismaInstance.ts
```

Exports the shared Prisma client instance.

```txt
src/app/lib/validators.ts
```

Contains validation helpers for name, email, password, and repeated password.

```txt
src/app/lib/smtp.ts
```

Contains SMTP configuration, low-level SMTP sending, and reset email content helpers for password reset delivery.

```txt
src/app/lib/inputChange.ts
```

Reusable input change handler that updates form state and matching error state.

```txt
src/app/lib/orgCodeGenerator.ts
```

Generates organization codes by normalizing the organization name and appending a UUID.

```txt
src/app/lib/utils.ts
```

General utility module.

## Type Modules

```txt
src/app/types/auth.ts
src/app/types/dashboard.ts
src/app/types/analytics.ts
src/app/types/deals.ts
```

These files define frontend/API data shapes for auth forms, dashboard data, analytics chart data, and deals.

## Activity Logging

Activities are written for major CRM and admin actions, including:

- lead list created
- lead list deleted
- lead created
- lead updated
- lead deleted
- deal created
- deal updated
- deal deleted
- join request accepted
- join request declined
- user role changed
- user removed from organization

Deleted lead and deal activities do not keep foreign keys to deleted records. They preserve the name in the activity description instead.

## Seed Data

Seed file:

```txt
prisma/seed.cjs
```

Command:

```bash
npm run db:seed
```

The seed creates a demo organization with users, lead lists, leads, deals, and activities.

Demo login:

```txt
Email: admin@leadnest.test
Password: Password123456
Organization code: leadnest_demo
```

Seed behavior:

- creates or updates demo users
- creates or updates the demo organization
- refreshes demo CRM data inside the demo organization
- does not wipe unrelated organizations

## Testing

### Unit Tests

Config:

```txt
vitest.config.ts
vitest.setup.ts
```

Tests:

```txt
tests/unit/lib/validators.test.ts
tests/unit/lib/inputChange.test.ts
tests/unit/lib/orgCodeGenerator.test.ts
tests/unit/lib/smtp.test.ts
tests/unit/lib/dashboard/helpers.test.ts
tests/unit/lib/deals/helpers.test.ts
```

Run:

```bash
npm run test:unit
```

### End-to-End Tests

Config:

```txt
playwright.config.ts
```

Tests:

```txt
tests/e2e/auth-routes.spec.ts
tests/e2e/password-reset.spec.ts
```

Run:

```bash
npm run test:e2e
```

Current e2e coverage:

- unauthenticated users are redirected from `/dashboard` to `/login`
- login page renders
- reset password page renders
- reset password page shows a missing token error before calling the confirmation API

Playwright runs the dev server on port `3100`.

## Current Known Decisions

- Stripe billing is intentionally skipped for now.
- Live collaboration / mouse presence is intentionally skipped for now.
- Dashboard and analytics values are derived from real tables, not stored as separate dashboard tables.
- Organization role is stored on `OrganizationUser`, not on `User`.
- `LeadCategory` is currently the database name for what the UI calls a "Lead List."
- Large datasets should be fetched per page, not placed in global context.

## Future Work

Potential next steps:

- Stripe subscriptions and billing gates
- Live collaboration and presence
- stronger integration tests for API routes
- more Playwright coverage for organization, leads, deals, dashboard, and analytics flows
- pagination/search for large lead and deal datasets
- more polished loading, error, and empty states across every page
- stricter role-specific UI hiding in addition to API authorization
