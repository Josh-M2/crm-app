# Database Schema Documentation

## Overview

The database is a Neon PostgreSQL database accessed through Prisma.

Schema file:

```txt
prisma/schema.prisma
```

Datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Generator:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

The schema supports a multi-tenant CRM where users belong to organizations through `OrganizationUser`, and all CRM entities are scoped to an organization.

## Core Data Rules

- `User` stores identity and auth data.
- `Organization` stores workspace/company data.
- `OrganizationUser` stores membership and role per organization.
- `LeadCategory` stores lead lists/categories.
- `Lead` stores individual lead records.
- `Deal` stores sales opportunities.
- `Activity` stores audit/recent-activity history.
- `Invite` stores join requests/invitations.
- Dashboard and analytics values are derived from `Lead`, `Deal`, and `Activity`.
- Organization role is not global on `User`; it belongs to `OrganizationUser`.
- Every lead, deal, activity, invite, and lead category must be tied to an organization.

## Enums

### `LeadStatus`

```prisma
enum LeadStatus {
  NEW
  IN_PROGRESS
  CONVERTED
  CONTACTED
}
```

Used by:

```txt
Lead.status
```

Meaning:

- `NEW`: new lead with no major progress yet
- `CONTACTED`: lead has been contacted
- `IN_PROGRESS`: lead is actively being worked
- `CONVERTED`: lead converted successfully

Dashboard conversion rate uses:

```txt
CONVERTED leads / total leads
```

Analytics "Leads by Status" groups by this enum.

### `DealStatus`

```prisma
enum DealStatus {
  PENDING
  LOST
  WON
}
```

Used by:

```txt
Deal.status
```

Meaning:

- `PENDING`: active/open deal
- `WON`: won deal
- `LOST`: lost deal

Dashboard active deals use `PENDING`.

Dashboard revenue and analytics revenue use `WON`.

### `OrganizationUserRole`

```prisma
enum OrganizationUserRole {
  AGENT
  MINER
  ADMIN
}
```

Used by:

```txt
OrganizationUser.role
```

Current app meaning:

- `ADMIN`: can manage organization users, requests, destructive actions, and all CRM data
- `AGENT`: used as a lead list owner and deal owner
- `MINER`: used as assigned user for lead lists

Important:

Role is scoped per organization. The same user can have different roles in different organizations.

## Models

## `User`

```prisma
model User {
  id                       String         @id @default(uuid())
  email                    String         @unique
  name                     String?
  password                 String
  createdAt                DateTime       @default(now())
  updatedAt                DateTime       @updatedAt
  organizations            OrganizationUser[]
  ownedOrganizations       Organization[] @relation("OrganizationOwner")
  leadCategoriesOwned      LeadCategory[] @relation("CategoryOwner")
  leadCategoriesAssigned   LeadCategory[] @relation("CategoryAssignee")
  deals                    Deal[]
  activities               Activity[]
}
```

Purpose:

Stores account identity, credentials, and relations to organizations and CRM records.

Fields:

- `id`: primary key UUID
- `email`: unique login email
- `name`: optional display name
- `password`: bcrypt-hashed password
- `createdAt`: creation timestamp
- `updatedAt`: automatic update timestamp

Relations:

- `organizations`: memberships through `OrganizationUser`
- `ownedOrganizations`: organizations where this user is the owner
- `leadCategoriesOwned`: lead lists where this user is owner
- `leadCategoriesAssigned`: lead lists assigned to this user
- `deals`: deals owned by this user
- `activities`: activities performed by this user

Security note:

API responses should never return the full user record when not needed because it includes `password`.

## `Organization`

```prisma
model Organization {
  id              String             @id @default(uuid())
  name            String
  code            String             @unique
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  owner           User               @relation("OrganizationOwner", fields: [ownerId], references: [id])
  ownerId         String
  users           OrganizationUser[]
  leads           Lead[]
  deals           Deal[]
  activities      Activity[]
  invites         Invite[]
  leadCategories  LeadCategory[]
}
```

Purpose:

Represents a tenant/workspace in the CRM.

Fields:

- `id`: primary key UUID
- `name`: organization name
- `code`: unique organization join code
- `createdAt`: creation timestamp
- `updatedAt`: automatic update timestamp
- `ownerId`: user who owns the organization

Relations:

- `owner`: owning user
- `users`: organization memberships
- `leads`: organization leads
- `deals`: organization deals
- `activities`: organization activity feed
- `invites`: organization join requests/invitations
- `leadCategories`: organization lead lists/categories

Business rules:

- Organization owner should not be removed or demoted through manage-users.
- All CRM data should be filtered by `organizationId`.

## `OrganizationUser`

```prisma
model OrganizationUser {
  id              String               @id @default(uuid())
  role            OrganizationUserRole
  user            User                 @relation(fields: [userId], references: [id])
  userId          String
  organization    Organization         @relation(fields: [organizationId], references: [id])
  organizationId  String

  @@unique([userId, organizationId])
}
```

Purpose:

Join table between `User` and `Organization`. Stores the user's role inside that organization.

Fields:

- `id`: primary key UUID
- `role`: organization-scoped role
- `userId`: related user
- `organizationId`: related organization

Constraints:

- `@@unique([userId, organizationId])` prevents duplicate membership for the same user in the same organization.

Business rules:

- API authorization checks use this table.
- A user must have an `OrganizationUser` row to access organization data.
- Role changes happen here, not on `User`.

## `LeadCategory`

```prisma
model LeadCategory {
  id              String        @id @default(uuid())
  name            String
  owner           User          @relation("CategoryOwner", fields: [ownerId], references: [id])
  ownerId         String
  assignedTo      User          @relation("CategoryAssignee", fields: [assignedToId], references: [id])
  assignedToId    String
  organization    Organization  @relation(fields: [organizationId], references: [id])
  organizationId  String
  leads           Lead[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  activities      Activity[]
}
```

Purpose:

Stores what the UI calls a "Lead List." It groups individual leads and assigns responsibility.

Fields:

- `id`: primary key UUID
- `name`: lead list name
- `ownerId`: user who owns the list, usually an agent
- `assignedToId`: user assigned to work the list, usually a miner
- `organizationId`: owning organization
- `createdAt`: creation timestamp
- `updatedAt`: automatic update timestamp

Relations:

- `owner`: owner user
- `assignedTo`: assigned user
- `organization`: organization that owns the list
- `leads`: individual leads in this list
- `activities`: activities related to this list

Business rules:

- Owner and assigned user must belong to the selected organization.
- UI label should say "Lead List" even though the model name is `LeadCategory`.

## `Lead`

```prisma
model Lead {
  id               String        @id @default(uuid())
  name             String
  company          String
  email            String
  status           LeadStatus
  lastInteraction  DateTime
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  organization     Organization  @relation(fields: [organizationId], references: [id])
  organizationId   String
  category         LeadCategory? @relation(fields: [categoryId], references: [id])
  categoryId       String?
  activities       Activity[]
}
```

Purpose:

Stores an individual sales lead.

Fields:

- `id`: primary key UUID
- `name`: lead contact/name
- `company`: company name
- `email`: lead email address
- `status`: lead status enum
- `lastInteraction`: last meaningful interaction date
- `createdAt`: creation timestamp
- `updatedAt`: automatic update timestamp
- `organizationId`: owning organization
- `categoryId`: optional lead list/category

Relations:

- `organization`: organization that owns the lead
- `category`: optional lead list
- `activities`: activity records for this lead

Business rules:

- Leads must be queried by organization.
- Leads can be displayed inside `/leads/[categorized_lead_id]`.
- Deleting a lead logs an activity without preserving a foreign key to the deleted lead.

## `Deal`

```prisma
model Deal {
  id              String        @id @default(uuid())
  name            String
  amount          Decimal
  status          DealStatus
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  organization    Organization  @relation(fields: [organizationId], references: [id])
  organizationId  String
  owner           User          @relation(fields: [ownerId], references: [id])
  ownerId         String
  activities      Activity[]
}
```

Purpose:

Stores sales opportunities and revenue data.

Fields:

- `id`: primary key UUID
- `name`: deal name
- `amount`: deal amount as Prisma decimal
- `status`: deal status enum
- `createdAt`: creation timestamp
- `updatedAt`: automatic update timestamp
- `organizationId`: owning organization
- `ownerId`: owning user

Relations:

- `organization`: organization that owns the deal
- `owner`: user responsible for the deal
- `activities`: activity records for this deal

Business rules:

- Owner must belong to the selected organization.
- Dashboard active deals count uses `PENDING`.
- Dashboard and analytics revenue use `WON`.
- Deleting a deal logs an activity without preserving a foreign key to the deleted deal.

## `Activity`

```prisma
model Activity {
  id              String        @id @default(uuid())
  description     String
  date            DateTime      @default(now())
  user            User          @relation(fields: [userId], references: [id])
  userId          String
  organization    Organization  @relation(fields: [organizationId], references: [id])
  organizationId  String
  leadCategory    LeadCategory? @relation(fields: [leadCategoryId], references: [id])
  leadCategoryId  String?
  lead            Lead?         @relation(fields: [leadId], references: [id])
  leadId          String?
  deal            Deal?         @relation(fields: [dealId], references: [id])
  dealId          String?
}
```

Purpose:

Stores audit/recent-activity history for organization actions.

Fields:

- `id`: primary key UUID
- `description`: human-readable activity text
- `date`: activity timestamp
- `userId`: user who performed the activity
- `organizationId`: organization where the activity happened
- `leadCategoryId`: optional related lead list
- `leadId`: optional related lead
- `dealId`: optional related deal

Relations:

- `user`: actor
- `organization`: owning organization
- `leadCategory`: optional related lead list
- `lead`: optional related lead
- `deal`: optional related deal

Business rules:

- Activities should always have an organization.
- Dashboard recent activity reads from this table.
- Deleted records may have activities without a lead/deal/category foreign key. In that case, the deleted record name is kept in `description`.

Current logged actions:

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

## `Invite`

```prisma
model Invite {
  id              String        @id @default(uuid())
  email           String
  code            String
  accepted        Boolean       @default(false)
  createdAt       DateTime      @default(now())
  organization    Organization  @relation(fields: [organizationId], references: [id])
  organizationId  String
}
```

Purpose:

Stores organization join requests/invitations.

Fields:

- `id`: primary key UUID
- `email`: email requesting or receiving invitation
- `code`: organization code used for the request
- `accepted`: whether the request has been accepted
- `createdAt`: creation timestamp
- `organizationId`: target organization

Relations:

- `organization`: organization associated with the invite/request

Business rules:

- Pending requests are `accepted: false`.
- Admins can accept or decline requests.
- Accepting creates or reuses an `OrganizationUser` membership.
- Accepted users currently receive role `AGENT`.

## Relationship Map

```txt
User 1 -> many OrganizationUser
Organization 1 -> many OrganizationUser

User 1 -> many Organization as owner
Organization many -> 1 User as owner

Organization 1 -> many LeadCategory
LeadCategory many -> 1 Organization

User 1 -> many LeadCategory as owner
User 1 -> many LeadCategory as assignedTo

LeadCategory 1 -> many Lead
Lead many -> 0 or 1 LeadCategory

Organization 1 -> many Lead
Lead many -> 1 Organization

Organization 1 -> many Deal
Deal many -> 1 Organization

User 1 -> many Deal as owner
Deal many -> 1 User as owner

Organization 1 -> many Activity
User 1 -> many Activity
Activity many -> 0 or 1 LeadCategory
Activity many -> 0 or 1 Lead
Activity many -> 0 or 1 Deal

Organization 1 -> many Invite
Invite many -> 1 Organization
```

## Derived Data

These are not stored as separate tables:

- dashboard totals
- dashboard revenue
- conversion rate
- analytics revenue series
- leads by status series
- monthly new leads series

They are derived through Prisma queries from:

```txt
Lead
Deal
Activity
```

## Dashboard Query Rules

Dashboard endpoint:

```txt
GET /api/dashboard/init-dashboard
```

Data rules:

- `leadCount`: count leads where `organizationId = selectedOrg`
- `convertedLeadCount`: count leads where status is `CONVERTED`
- `conversionRate`: converted leads divided by total leads
- `activeDeals`: count deals where status is `PENDING`
- `revenue`: sum amount for deals where status is `WON`
- `activities`: latest eight activities for the organization

## Analytics Query Rules

Analytics endpoint:

```txt
GET /api/analytics/init-analytics
```

Data rules:

- `revenueOverTime`: won deals grouped by `updatedAt` month
- `leadsByStatus`: leads grouped by `status`
- `monthlyNewLeads`: leads grouped by `createdAt` month

## Seed Data

Seed file:

```txt
prisma/seed.cjs
```

Seed command:

```bash
npm run db:seed
```

Seeded demo values:

```txt
Organization: LeadNest Demo CRM
Organization code: leadnest_demo
Admin email: admin@leadnest.test
Admin password: Password123456
```

Seed creates:

- one demo organization
- one admin user
- two agent users
- two miner users
- three lead lists
- ten individual leads
- six deals
- activity history for dashboard/recent activity

The seed refreshes demo CRM data for the demo organization. It does not intentionally delete unrelated organizations.

## Data Safety Notes

- Never return full `User` rows from APIs unless password is intentionally excluded.
- Always check organization membership before returning organization-scoped data.
- Always filter CRM queries by `organizationId`.
- Keep role authorization on the server/API even if the frontend hides buttons.
- Avoid storing dashboard/analytics snapshots unless a future reporting feature specifically requires it.

## Future Schema Considerations

Potential future additions:

- `Subscription` or `BillingCustomer` for Stripe
- `WorkspacePresence` or external Liveblocks data for live collaboration
- pagination/search indexes for large lead and deal tables
- audit metadata fields such as `createdById` and `updatedById`
- invitation expiration timestamps
- soft-delete fields for organizations, leads, deals, and users
