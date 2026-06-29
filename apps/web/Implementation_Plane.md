# WorkLedger — Frontend Implementation Plan (Final)

> **Last reviewed against codebase:** 2026-06-29
> All API endpoints verified against actual NestJS controllers.

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Route Architecture](#2-route-architecture)
3. [State Management Rules](#3-state-management-rules)
4. [API Layer](#4-api-layer)
5. [Auth Flow](#5-auth-flow)
6. [Onboarding Shell](#6-onboarding-shell)
7. [App Shell — All Routes](#7-app-shell--all-routes)
8. [Admin Shell — All Routes](#8-admin-shell--all-routes)
9. [Public Routes](#9-public-routes)
10. [Shared Components](#10-shared-components)
11. [Feature Flags on the Frontend](#11-feature-flags-on-the-frontend)
12. [Notifications](#12-notifications)
13. [Build Order](#13-build-order)

---

## 1. Folder Structure

```
apps/web/
├── app/
│   ├── (auth)/                        ← No sidebar/header layout
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx    ← ?token= query param
│   │   ├── verify-email/page.tsx      ← ?token= query param
│   │   ├── accept-invite/page.tsx     ← ?token= workspace invite
│   │   └── callback/page.tsx          ← Google OAuth: ?token=<accessToken>
│   │
│   ├── (onboarding)/
│   │   └── onboarding/
│   │       ├── layout.tsx             ← Progress stepper header only
│   │       ├── page.tsx               ← Step 1: Business profile
│   │       ├── team/page.tsx          ← Step 2: Invite team (optional)
│   │       └── first-client/page.tsx  ← Step 3: Create first client
│   │
│   ├── (app)/                         ← Main app — sidebar + header
│   │   ├── layout.tsx                 ← Auth guard, sidebar, header, toast
│   │   ├── dashboard/page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx           ← Client overview (tabs)
│   │   │       └── edit/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── layout.tsx         ← Project tabs layout
│   │   │       ├── page.tsx           ← Overview tab
│   │   │       ├── tasks/page.tsx
│   │   │       ├── milestones/page.tsx
│   │   │       ├── files/page.tsx
│   │   │       ├── comments/page.tsx
│   │   │       └── share/page.tsx
│   │   ├── proposals/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── versions/page.tsx
│   │   ├── invoices/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── payments/page.tsx
│   │   ├── expenses/page.tsx          ← Feature-flagged: expense-tracking
│   │   ├── reports/page.tsx
│   │   ├── team/
│   │   │   ├── page.tsx
│   │   │   └── invite/page.tsx
│   │   ├── notifications/page.tsx     ← Inbox only
│   │   └── settings/
│   │       ├── layout.tsx             ← Settings sidebar tab nav
│   │       ├── profile/page.tsx       ← Name, avatar, password, sessions
│   │       ├── workspace/page.tsx
│   │       ├── billing/page.tsx
│   │       ├── notifications/page.tsx
│   │       ├── email-templates/page.tsx  ← Feature-flagged
│   │       └── danger/page.tsx           ← NEVER feature-flagged
│   │
│   ├── (admin)/
│   │   ├── layout.tsx                 ← isSuperAdmin guard
│   │   └── admin/
│   │       ├── page.tsx               ← Platform overview
│   │       ├── users/
│   │       │   ├── page.tsx
│   │       │   └── [id]/
│   │       │       ├── page.tsx       ← Profile + Workspaces + Activity tabs
│   │       │       └── sessions/page.tsx
│   │       ├── workspaces/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx      ← Overview + Members + Usage + Audit tabs
│   │       ├── billing/
│   │       │   ├── page.tsx
│   │       │   ├── plans/page.tsx
│   │       │   ├── transactions/page.tsx
│   │       │   └── coupons/page.tsx
│   │       ├── features/flags/page.tsx
│   │       ├── services/
│   │       │   ├── status/page.tsx    ← Live health tiles
│   │       │   └── incidents/page.tsx
│   │       ├── audit/
│   │       │   ├── page.tsx
│   │       │   └── security/page.tsx  ← Auth events + suspicious activity
│   │       ├── queues/page.tsx        ← BullMQ inspection
│   │       ├── notifications/page.tsx ← Broadcast announcements
│   │       └── settings/page.tsx      ← Platform config
│   │
│   ├── (marketing)/
│   │   ├── page.tsx                   ← Landing page (/)
│   │   ├── pricing/page.tsx
│   │   ├── status/page.tsx            ← Uptime Robot embed for MVP
│   │   ├── legal/
│   │   │   ├── privacy/page.tsx
│   │   │   └── terms/page.tsx
│   │   └── changelog/page.tsx         ← changelog.json driven
│   │
│   └── portal/                        ← Public token routes
│       ├── [shareToken]/page.tsx      ← Client project portal
│       ├── proposals/view/[token]/page.tsx
│       └── invoices/view/[token]/page.tsx
│
├── components/
│   ├── ui/                            ← Base design system
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   ├── AppHeader.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── SettingsTabs.tsx
│   ├── forms/
│   │   ├── ClientForm.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── InvoiceForm.tsx
│   │   ├── ProposalForm.tsx
│   │   ├── MilestoneForm.tsx
│   │   └── TaskForm.tsx
│   ├── features/
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── invoices/
│   │   ├── proposals/
│   │   ├── reports/
│   │   └── admin/
│   └── shared/
│       ├── DataTable.tsx              ← TanStack Table v8, server-side pagination
│       ├── SlideOver.tsx              ← Right-panel drawer
│       ├── StatusBadge.tsx
│       ├── ConfirmDialog.tsx
│       ├── EmptyState.tsx
│       ├── PageHeader.tsx
│       ├── UndoToast.tsx
│       └── LoadingSpinner.tsx
│
├── hooks/
│   ├── useAuth.ts
│   ├── useWorkspace.ts
│   ├── useFeatureFlag.ts
│   ├── useNotifications.ts
│   └── useUndoDelete.ts
│
├── lib/
│   ├── api/
│   │   ├── client.ts                  ← Axios instance + interceptors
│   │   ├── queryKeys.ts               ← Central key factory
│   │   ├── auth.ts
│   │   ├── clients.ts
│   │   ├── projects.ts
│   │   ├── invoices.ts
│   │   ├── proposals.ts
│   │   ├── milestones.ts
│   │   ├── tasks.ts
│   │   ├── files.ts
│   │   ├── comments.ts
│   │   ├── reports.ts
│   │   ├── members.ts
│   │   ├── workspace.ts
│   │   └── admin.ts
│   ├── stores/
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── flags.store.ts
│   ├── utils/
│   │   ├── currency.ts
│   │   ├── date.ts
│   │   └── cn.ts
│   └── validations/
│       ├── client.schema.ts
│       ├── project.schema.ts
│       ├── invoice.schema.ts
│       ├── proposal.schema.ts
│       └── auth.schema.ts
│
└── middleware.ts                      ← Route protection + redirects
```

---

## 2. Route Architecture

### Shell Rules

| Shell | Auth requirement | Guard behaviour |
|---|---|---|
| `(auth)` | None | Redirect to `/dashboard` if refreshToken cookie + `/auth/me` succeeds |
| `(onboarding)` | JWT required | Redirect to `/dashboard` if `onboardingComplete === true` |
| `(app)` | JWT + workspace | Redirect to `/login` if no token |
| `(admin)` | JWT + `isSuperAdmin: true` | 403 page if not super admin |
| `(marketing)` | None | None |
| `portal/` | Share token in URL | 404 if token invalid |

### Middleware (`middleware.ts`)

> **Critical:** Next.js route groups like `(app)` are **invisible** in URLs. The real path is `/dashboard`, NOT `/(app)/dashboard`.

```ts
import { NextRequest, NextResponse } from 'next/server';

const APP_PATHS = ['/dashboard', '/clients', '/projects', '/invoices',
  '/proposals', '/team', '/settings', '/reports', '/expenses', '/notifications'];
const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = req.cookies.has('refreshToken');

  if (AUTH_PATHS.some(p => pathname.startsWith(p)) && hasSession)
    return NextResponse.redirect(new URL('/dashboard', req.url));

  if (APP_PATHS.some(p => pathname.startsWith(p)) && !hasSession)
    return NextResponse.redirect(new URL('/login', req.url));

  // Admin isSuperAdmin check → done in (admin)/layout.tsx via JWT decode
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|portal|api).*)'],
};
```

### Project Sub-Routes (Tab Pattern)

`/projects/[id]/layout.tsx` renders sticky header + tab bar. Real routes — shareable, bookmarkable, SSR-ready. Active tab from `usePathname()`.

```
Overview    →  /projects/[id]
Tasks       →  /projects/[id]/tasks
Milestones  →  /projects/[id]/milestones
Files       →  /projects/[id]/files
Comments    →  /projects/[id]/comments
Share       →  /projects/[id]/share
```

---

## 3. State Management Rules

| Data | Tool | Rule |
|---|---|---|
| Server data (projects, invoices, etc.) | React Query | All remote data. **Never** in Zustand. |
| Auth state (user, workspace, role) | Zustand `auth.store` | Set on login, cleared on logout. |
| Access token | Zustand + `localStorage` | Key: `wl_access_token`. Initialised from localStorage on module load. Survives page refresh without network call. |
| UI state (sidebar, modals) | Zustand `ui.store` | Never mix with server data. |
| Feature flags | Zustand `flags.store` | Fetched once on login. 5-min stale. |
| Form state | React Hook Form + Zod | Per form. Schema must match backend DTO exactly. |

### Query Key Factory

```ts
// lib/api/queryKeys.ts
export const queryKeys = {
  clients:    (wsId: string) => ['clients', wsId] as const,
  client:     (wsId: string, id: string) => ['clients', wsId, id] as const,
  projects:   (wsId: string) => ['projects', wsId] as const,
  project:    (wsId: string, id: string) => ['projects', wsId, id] as const,
  tasks:      (wsId: string, pid: string) => ['tasks', wsId, pid] as const,
  milestones: (wsId: string, pid: string) => ['milestones', wsId, pid] as const,
  files:      (wsId: string, pid: string) => ['files', wsId, pid] as const,
  comments:   (wsId: string, pid: string) => ['comments', wsId, pid] as const,
  invoices:   (wsId: string) => ['invoices', wsId] as const,
  invoice:    (wsId: string, id: string) => ['invoices', wsId, id] as const,
  proposals:  (wsId: string) => ['proposals', wsId] as const,
  proposal:   (wsId: string, id: string) => ['proposals', wsId, id] as const,
  reports:    (wsId: string, period: string) => ['reports', wsId, period] as const,
  members:    (wsId: string) => ['members', wsId] as const,
  notifications: () => ['notifications'] as const,
};

export const STALE_TIMES = { list: 60_000, detail: 30_000, reports: 300_000, flags: 300_000 };
```

### Optimistic Update Pattern

1. `queryClient.cancelQueries(key)`
2. `const prev = queryClient.getQueryData(key)` — snapshot
3. `queryClient.setQueryData(key, optimisticFn)` — apply immediately
4. On error → rollback with `prev`
5. On success (delete) → `UndoToast` for 10 seconds

---

## 4. API Layer

### Axios Instance (`lib/api/client.ts`)

```ts
import axios from 'axios';
import { useAuthStore } from '@/lib/stores/auth.store';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
  withCredentials: true,
});

apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(res => res, async error => {
  if (error.response?.status === 401 && !error.config._retry) {
    error.config._retry = true;
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
        {}, { withCredentials: true }
      );
      const newToken = data.data.accessToken;
      useAuthStore.getState().setSession(newToken);
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(error.config);
    } catch {
      useAuthStore.getState().clearSession();
      window.location.replace('/login');
    }
  }
  return Promise.reject(error);
});
```

### Idempotency Keys

```ts
// Generate once on form mount — NOT on every render
const idempotencyKey = useRef(nanoid());

apiClient.post('/invoices', data, {
  headers: { 'Idempotency-Key': idempotencyKey.current }
});
```

---

## 5. Auth Flow

### Verified API Endpoints (from actual controllers)

| Action | Method | Endpoint |
|---|---|---|
| Signup | POST | `/auth/signup` |
| Login | POST | `/auth/login` |
| Logout | POST | `/auth/logout` |
| Get profile | GET | `/auth/me` |
| Verify email | POST | `/auth/email/verify` |
| Request password reset | POST | `/auth/password/reset-request` |
| Reset password | POST | `/auth/password/reset` |
| Silent refresh | POST | `/auth/refresh` |
| Google OAuth start | GET | `/auth/google` |
| Google callback | GET | `/auth/google/callback` → redirects to `/auth/callback?token=<accessToken>` |

### Login → Dashboard Sequence

```
1. POST /auth/login → { data: { accessToken } }
   Cookie set: refreshToken (httpOnly, SameSite=Lax dev / Strict prod)
2. setSession(accessToken) → Zustand + localStorage[wl_access_token]
3. GET /auth/me → { data: { user, workspace, role } }
4. Store user, workspace, role in Zustand auth.store
5. workspace.onboardingComplete?
   false → router.push('/onboarding')
   true  → router.push('/dashboard')
```

### Silent Refresh (on 401)

```
1. API call returns 401
2. Interceptor catches it (_retry guard prevents infinite loop)
3. POST /auth/refresh → new accessToken
4. Stored in Zustand + localStorage
5. Original request retried — user sees nothing
```

### Logout Sequence

```
1. POST /auth/logout (revokes refreshToken in DB)
2. clearSession() → Zustand + localStorage cleared
3. queryClient.clear() → React Query cache wiped
4. router.push('/login')
```

### Google OAuth Flow

```
1. User clicks "Continue with Google" → link to GET /auth/google
2. API redirects to Google consent screen
3. Google returns to GET /auth/google/callback (on API)
4. API redirects browser to: /auth/callback?token=<accessToken>
5. /auth/callback page:
   - Read token from searchParams
   - setSession(token) → Zustand + localStorage
   - GET /auth/me → store user + workspace
   - router.push('/dashboard') or '/onboarding'
```

### Page Refresh Recovery

Token in localStorage → Zustand initialises from it instantly. `(app)/layout.tsx` guard:

1. Token present + user in store → render children immediately
2. Token present, no user → `GET /auth/me` to rehydrate
3. `/auth/me` returns 401 → `POST /auth/refresh` → retry
4. Both fail → `clearSession()` + `router.replace('/login')`

---

## 6. Onboarding Shell

Triggered when `workspace.onboardingComplete === false` after first login.

### Step 1 — `/onboarding` (Business Profile)
**Fields:** Workspace name · Logo · Address · Default currency · Tax rate · Invoice prefix · Timezone
**API:** `PATCH /workspace/settings` | **Skip:** allowed | **Next:** `/onboarding/team`

### Step 2 — `/onboarding/team` (Invite Team)
**Fields:** Email(s) + role (MANAGER/MEMBER)
**API:** `POST /workspace/members/invite` (one per email) | **Skip:** allowed | **Next:** `/onboarding/first-client`

### Step 3 — `/onboarding/first-client` (First Client)
**Fields:** Client name · Company · Email
**API:** `POST /clients`, then `PATCH /workspace/settings { onboardingComplete: true }`
**Skip:** Sets `onboardingComplete: true` without creating a client

**Layout:** Progress bar "Step X of 3" · No sidebar · Back button on steps 2+

---

## 7. App Shell — All Routes

### `/dashboard`

| Widget | Endpoint | Status | Stale |
|---|---|---|---|
| Revenue this month | `GET /reports/summary?period=month` | ⚠️ BUILD | 5 min |
| Outstanding invoices | `GET /invoices?status=SENT,OVERDUE` | ✅ | 1 min |
| Active projects | `GET /projects?status=IN_PROGRESS,REVIEW` | ✅ | 1 min |
| Overdue milestones | `GET /milestones?status=OVERDUE` | ✅ | 1 min |
| Tasks due today | `GET /tasks?dueDate=today&assignee=me` | ✅ | 1 min |
| Recent activity | `GET /audit-logs?limit=20` | ⚠️ BUILD | 30s |
| Upcoming deadlines | `GET /milestones?dueWithin=7` | ✅ | 5 min |
| Top clients | `GET /reports/top-clients` | ⚠️ BUILD | 5 min |

Quick-create: **New Client · New Project · New Invoice** → SlideOver drawer, not page navigation.

---

### `/clients`

```
GET    /clients?search=&status=&page=&limit=
POST   /clients
PATCH  /clients/:id
DELETE /clients/:id
```

**Table:** Name · Company · Active projects · Outstanding balance · Last activity
**Filters:** Search · Status (ACTIVE / AT_RISK / CHURNED)
**Actions:** View · Edit · Archive (soft delete + undo toast)
**Bulk:** Archive · Tag

---

### `/clients/[id]`

**Tabs:** Overview · Projects · Invoices · Proposals
**Overview:** Contact card · Revenue summary (billed/paid/outstanding) · Internal notes

---

### `/projects`

```
GET    /projects?status=&clientId=&page=&limit=
POST   /projects
PATCH  /projects/:id
DELETE /projects/:id
POST   /projects/:id/share-token/regenerate
GET    /projects/share/:shareToken            ← Public (client portal)
```

**Views:** List · Board (Kanban: LEAD → KICKOFF → IN_PROGRESS → REVIEW → REVISION → DELIVERED → CLOSED)

---

### `/projects/[id]` — Tab Layout

All tabs share a sticky project header: Name · Client · Stage badge · Deadline · Team avatars · Share portal button

---

#### Overview Tab (`/projects/[id]`)

- Stage tracker stepper (click to advance, MANAGER+) + stage history with timestamps
- Project details: description, dates, estimated value, currency, tags
- Milestone progress bars
- Budget vs actual (paid invoices sum vs estimated value)
- Team member list

---

#### Tasks Tab (`/projects/[id]/tasks`)

```
GET    /tasks?projectId=
POST   /tasks                        ← parentId in body for subtasks
PATCH  /tasks/:id
DELETE /tasks/:id
POST   /tasks/:id/comments           ← Task-level (team only)
GET    /tasks/:id/comments
DELETE /tasks/comments/:commentId
```

**Kanban:** TODO → IN_PROGRESS → IN_REVIEW → DONE
**Task detail (SlideOver):** status · priority · assignee · due date · subtasks (inline create) · comment thread
**Task comments are team-only — never shown to client.**

---

#### Milestones Tab (`/projects/[id]/milestones`)

```
GET    /milestones?projectId=
POST   /milestones
PATCH  /milestones/:id
DELETE /milestones/:id
POST   /milestones/share/:shareToken/milestone/:milestoneId/signoff  ← Public
```

**Statuses:** PENDING → SUBMITTED → APPROVED / REVISION_REQUESTED

**Client sign-off flow:**
1. MANAGER marks milestone SUBMITTED
2. Client views on portal → Approve or Request Revision
3. API: `POST /milestones/share/:shareToken/milestone/:milestoneId/signoff`
   Body: `{ action: 'APPROVE' | 'REVISION', note?: string }`

---

#### Files Tab (`/projects/[id]/files`)

```
POST   /files/upload-url             ← Get pre-signed Cloudinary/R2 URL
POST   /files/register               ← Save metadata AFTER direct cloud upload (not POST /files)
GET    /files/project/:projectId     ← List (NOT /files?projectId=)
GET    /files/:id/versions
PATCH  /files/:id/deliverable        ← Toggle deliverable flag
DELETE /files/:id
```

**Two-step upload flow:**
1. `POST /files/upload-url` → pre-signed URL
2. Upload directly to cloud storage (API server not in the chain)
3. `POST /files/register` with metadata → saved to DB

**Deliverable flag:** Clients see only deliverable-flagged files on portal.

---

#### Comments Tab (`/projects/[id]/comments`)

```
GET    /comments?projectId=
POST   /comments
PATCH  /comments/:id
DELETE /comments/:id
```

> **Note:** `/comments` = project-level (can be client-visible).
> `/tasks/:id/comments` = task-level (team only). These are **separate modules**.

**Types:** Internal (indigo border, team only) · Client-visible (green border, shown on portal)

---

#### Share Tab (`/projects/[id]/share`)

```
GET    /projects/:id                 ← shareToken is in the project response object
POST   /projects/:id/share-token/regenerate
```

Shows: Public URL · Copy + QR code · Enable/disable toggle · Regenerate (confirm dialog) · Preview button

---

### `/proposals`

```
GET    /proposals?status=&clientId=&page=&limit=
POST   /proposals
PATCH  /proposals/:id                ← Auto-saves ProposalVersion snapshot before update
DELETE /proposals/:id
GET    /proposals/:id/versions
POST   /proposals/:id/versions/:version/restore
GET    /proposals/view/:viewToken    ← Public, transitions to VIEWED
POST   /proposals/view/:viewToken/accept   ← Public, auto-creates draft Project
POST   /proposals/view/:viewToken/reject   ← Public
```

**Status filters:** DRAFT · SENT · VIEWED · ACCEPTED · REJECTED · EXPIRED
**Actions:** View · Edit (creates version snapshot) · Send · Duplicate · Delete

---

### `/proposals/[id]`

Header (title, client, status, valid until, version #) · Line items · Totals · Terms/notes · Event timeline
**Actions:** Edit · Send · Download PDF · Duplicate · Convert to project

### `/proposals/[id]/versions`

List (version #, saved by, saved at) · View snapshot · Restore

---

### `/invoices`

```
GET    /invoices?status=&clientId=&projectId=&page=&limit=
POST   /invoices
PATCH  /invoices/:id
DELETE /invoices/:id
POST   /invoices/:id/send            ← PDF render + email via queue
POST   /invoices/:id/payments        ← Record manual payment
GET    /invoices/view/:viewToken     ← Public, transitions to VIEWED on GET
```

**Outstanding banner:** Sum SENT+OVERDUE (shown in red if > 0)
**Status filters:** DRAFT · SENT · VIEWED · PARTIALLY_PAID · PAID · OVERDUE · CANCELLED
**Bulk:** Send reminder to selected OVERDUE invoices

---

### `/invoices/new`

1. Client + Project (select existing)
2. Line items (description, qty, unit rate, tax rate per line)
3. Auto-calculated totals (subtotal, tax, discount, grand total)
4. Metadata (invoice number auto-generated from workspace prefix+sequence, due date, currency, notes, payment terms)
5. Send options: Save as draft · Save and send now

**Idempotency:** `nanoid()` generated once on form mount → passed as `Idempotency-Key` header.

---

### `/invoices/[id]`

Header (number, status, client, dates) · Line items (read-only) · Totals · Payment timeline · "Viewed at" indicator
**Actions:** Download PDF · Send/Resend · Record payment (SlideOver) · Cancel invoice · Duplicate

---

### `/invoices/[id]/payments`

**List:** Amount · Method · Reference · Recorded by · Date
**Record payment (SlideOver):** Amount · Method (BANK/CASH/CARD/CRYPTO/OTHER) · Reference · Date · Note
Auto-computes remaining balance. Invoice auto-marks PAID when balance = 0.

---

### `/expenses` _(feature-flagged: `expense-tracking`)_

> ⚠️ **No `/expenses` API module exists yet.** Build the API module before building this page.

**Table:** Description · Project · Category · Amount · Date · Billable? · Invoiced?
**Create (SlideOver):** Description · Amount · Currency · Category · Project (optional) · Date · Billable toggle · Receipt upload

---

### `/reports`

> ⚠️ **No `/reports` API module exists yet.** Build these endpoints first:
> `GET /reports/summary`, `GET /reports/invoices`, `GET /reports/top-clients`, `GET /reports/projects`

**Period selector:** This month · Last 3m · Last 6m · Last 12m · All time

**Revenue:** Monthly bar chart · Revenue/Collected/Outstanding stat cards · Multi-currency breakdown
**Invoices:** Status donut chart · Avg days to payment · Overdue list
**Clients:** Top clients table (billed/paid/outstanding/projects)
**Projects:** Completion rate · Avg duration · Status bar chart
**Export:** Download all as CSV

---

### `/team`

```
GET    /workspace/members
POST   /workspace/members/invite
PATCH  /workspace/members/:memberId/role
DELETE /workspace/members/:memberId
POST   /workspace/members/accept     ← Public, token-based invite acceptance
```

**Table:** Name · Email · Role · Joined · Last active
**Pending invites:** Email · Role · Expiry · Resend/Cancel
**Actions:** Change role (OWNER only) · Remove member (OWNER only)

---

### `/notifications`

```
GET    /notifications?isRead=false&page=&limit=
PATCH  /notifications/:id/read
PATCH  /notifications/read-all
GET    /notifications/unread-count
```

Inbox only (preferences are in `/settings/notifications`). Header bell: badge = unread count, polls every 60s.

---

### `/settings` — Tab Layout

Tabs: Profile · Workspace · Billing · Notifications · Email Templates _(flagged)_ · Danger Zone

---

#### `/settings/profile`

Personal info · Avatar upload · Change password · 2FA (Phase 2) · Active sessions (revoke)

```
GET    /auth/me
PATCH  /auth/me
```

> ⚠️ `/auth/sessions` (list + revoke) needs to be built.

---

#### `/settings/workspace`

```
GET    /workspace/settings
PATCH  /workspace/settings           ← OWNER only
```

**Fields:** Name · Slug (read-only) · Logo · Brand color · Business info · Default currency · Tax rate · Payment terms · Invoice prefix + preview · Timezone · Invoice footer text

---

#### `/settings/email-templates` _(feature-flagged: `email-templates`)_

> ⚠️ `GET/PATCH /workspace/me/email-templates/:type` does not exist yet.

Templates: Invoice sent · Payment reminder · Proposal sent · Milestone complete
Each: Subject · Body (rich text, `{{variable}}` placeholders) · Preview with sample data · Reset to default

---

#### `/settings/notifications`

```
PATCH  /notification-preferences
```

Per-event email toggles: Invoice viewed/paid/overdue · Proposal accepted/rejected · Milestone approved/revision · New client comment · Member joined · Plan limit warning (80%)

---

#### `/settings/billing`

**Phase 1:** Current plan badge · Feature comparison table · Upgrade CTA
**Phase 2:** Active subscription · Next billing date · Payment method · Invoice history · Upgrade/downgrade

---

#### `/settings/danger`

> ⚠️ `POST /workspace/me/export` and `DELETE /workspace/me` need to be built.

**Export data:** ZIP with all CSVs + PDFs + uploaded files
**Delete workspace:** Type exact workspace name to confirm · 30-day grace period · Confirmation email
**Never feature-flag this page.**

---

## 8. Admin Shell — All Routes

> `isSuperAdmin: true` required. Checked in `(admin)/layout.tsx` by decoding JWT.

### What Exists in the API Right Now

```
GET    /admin/users          ← Basic list, no pagination
PATCH  /admin/workspaces/:id/plan   ← Override plan + expiry
GET    /admin/metrics        ← Platform-wide counts
```

**Everything else must be built.**

---

### `/admin` — Platform Overview

Uses `GET /admin/metrics`. Widgets: total users · active workspaces · signups today/week · API error rate · service health tiles · queue depths · recent signups feed.

---

### `/admin/users`

| Endpoint | Status |
|---|---|
| `GET /admin/users` | ✅ EXISTS |
| `GET /admin/users/:id` | ⚠️ BUILD |
| `PATCH /admin/users/:id/suspend` | ⚠️ BUILD |
| `POST /admin/users/:id/impersonate` | ⚠️ BUILD |
| `DELETE /admin/users/:id` | ⚠️ BUILD |
| `GET /admin/users/:id/sessions` | ⚠️ BUILD |
| `DELETE /admin/users/:id/sessions/:tokenId` | ⚠️ BUILD |
| `DELETE /admin/users/:id/sessions` | ⚠️ BUILD |

**Table:** Name · Email · Plan · Verified · Last login · Signup · Workspace count
**Actions:** View · Suspend/Unsuspend · Force verify · Force reset email · Impersonate (audit logged) · Delete (GDPR)

---

### `/admin/workspaces`

| Endpoint | Status |
|---|---|
| `GET /admin/workspaces` | ⚠️ BUILD |
| `PATCH /admin/workspaces/:id/plan` | ✅ EXISTS |
| `PATCH /admin/workspaces/:id/suspend` | ⚠️ BUILD |
| `DELETE /admin/workspaces/:id` | ⚠️ BUILD |
| `GET /admin/workspaces/:id` | ⚠️ BUILD |

**Detail tabs:** Overview · Members · Usage · Audit log

---

### `/admin/services/status`

| Service | Health check |
|---|---|
| NestJS API | `GET /health` → 200 |
| PostgreSQL | Prisma `$queryRaw SELECT 1` |
| Redis | `PING` via ioredis |
| Go PDF service | `GET /pdf-service/health` |
| Resend | Email API ping |
| Cloudinary / R2 | Bucket HEAD request |

Each tile: UP / DEGRADED / DOWN · Response time ms · Last checked
**API to build:** `GET /admin/services/health`

---

### `/admin/audit`

Full platform event log. Columns: Timestamp · User · Workspace · Action · Entity type · Entity ID. Filters + CSV export.
**API to build:** `GET /admin/audit-logs`

---

### `/admin/queues`

BullMQ queues: `invoice.send` · `invoice.reminder` · `email.notification` · `pdf.generate` · `snapshot.prune` · `limit.warning`
Per queue: Waiting/Active/Completed/Failed. Failed jobs: retry/discard.
**API to build:** `GET/POST/DELETE /admin/queues/*`

---

### `/admin/features/flags`

Feature flag table · Toggle per plan · Workspace overrides
**API to build:** `GET/PATCH /admin/feature-flags` + workspace override endpoints

---

### `/admin/notifications`

Broadcast to: all users / FREE / PRO+
**API to build:** `POST /admin/notifications/broadcast`

---

### `/admin/billing`

MRR/ARR · Subscriptions by plan · Revenue trend · Transactions
> Phase 2 — requires Stripe/Paddle integration.

---

### `/admin/settings`

Maintenance mode · Default plan · Platform name/logo · Support email · Max free storage
**API to build:** `GET/PATCH /admin/platform-settings`

---

## 9. Public Routes

### `/portal/[shareToken]` — Client Project Portal

```
GET    /projects/share/:shareToken
POST   /milestones/share/:shareToken/milestone/:milestoneId/signoff
```

No login required. Invalid token → 404.
**Shows:** Workspace branding · Project stage (stepper) · Milestones + deliverables · Client-visible comments · Invoice links
**Client actions:** Approve milestone · Request revision (comment required) · Download deliverable files

---

### `/portal/proposals/view/[token]`

```
GET    /proposals/view/:viewToken
POST   /proposals/view/:viewToken/accept   ← Records name + IP + timestamp, auto-creates Project
POST   /proposals/view/:viewToken/reject
```

Full proposal with workspace branding.

---

### `/portal/invoices/view/[token]`

```
GET    /invoices/view/:viewToken     ← Sets viewedAt, transitions to VIEWED on GET
```

PDF-style invoice view. Download PDF button. Phase 2: Pay now button.

---

### `/auth/verify-email?token=`

On load → `POST /auth/email/verify { token }` immediately (no user action).
Success → redirect to dashboard | Expired → resend button | Invalid → contact support

---

### `/auth/reset-password?token=`

Form: New password + confirm → `POST /auth/password/reset { token, password }`
Success → `/login` | Expired/invalid → request new link button

---

### `/auth/accept-invite?token=`

1. Fetch invite info → workspace name + inviter + role
2. Existing user: show login form → auto-accept on login
3. New user: show signup form → account created + invite accepted in one step
4. Complete → `/onboarding` (first workspace) or `/dashboard`

---

### `/auth/callback?token=`

Google OAuth callback. Reads `token` from searchParams. Stores in Zustand + localStorage. Calls `/auth/me`. Redirects to `/dashboard` or `/onboarding`.

---

## 10. Shared Components

### `DataTable`
TanStack Table v8. Server-side pagination — every filter change = new API call.
Props: `columns`, `data`, `filters`, `pagination`, `bulkActions`, `isLoading`, `emptyState`

### `SlideOver`
Right-panel drawer. Used for: task detail, record payment, create expense, file upload, quick-create forms. Prevents full-page navigations for quick actions.
Props: `title`, `open`, `onClose`, `children`

### `StatusBadge`
Maps all entity status enums to styled badges.
Covers: `ProjectStatus`, `InvoiceStatus`, `ProposalStatus`, `MilestoneStatus`, `TaskStatus`, `Plan`, `Role`

### `UndoToast`
10-second window after soft delete.
Props: `entityName`, `onUndo`, `onDismiss`
On undo: `POST /:entity/:id/restore`

### `PageHeader`
Breadcrumb · Title · Primary action button · Secondary actions

### `ConfirmDialog`
Required before: delete, archive, regenerate token, suspend, cancel.
Props: `title`, `description`, `confirmText`, `onConfirm`, `variant` (`danger` | `warning`)
Workspace deletion: user must type exact workspace name.

### `EmptyState`
Per-feature unique copy. Props: `title`, `description`, `icon`, `action`

---

## 11. Feature Flags on the Frontend

```ts
// hooks/useFeatureFlag.ts
export function useFeatureFlag(key: string): boolean {
  return useFlagsStore(s => s.flags[key] ?? false);
}

// Usage in sidebar nav
const hasExpenses = useFeatureFlag('expense-tracking');
{hasExpenses && <NavItem href="/expenses" label="Expenses" icon={Receipt} />}
```

| Flag key | Gates |
|---|---|
| `expense-tracking` | `/expenses` nav item + page |
| `recurring-invoices` | Recurring toggle on invoice form |
| `time-tracking` | `/time-tracking` nav item + page |
| `email-templates` | `/settings/email-templates` tab |
| `advanced-reports` | Advanced chart sections on `/reports` |
| `custom-domain-portal` | Custom domain field in workspace settings |
| `milestone-billing` | "Link to invoice" option on milestones |

**Never gate:** `/settings/danger`, data export, `/settings/billing`, legal pages

---

## 12. Notifications

### MVP: Polling (60s)

```ts
useQuery({
  queryKey: ['notifications', 'unread-count'],
  queryFn: () => apiClient.get('/notifications/unread-count').then(r => r.data.data),
  refetchInterval: 60_000,
  refetchIntervalInBackground: false,
});
```

### Phase 2: Server-Sent Events

```ts
useEffect(() => {
  const es = new EventSource(`${API_URL}/api/v1/notifications/stream`, {
    withCredentials: true
  });
  es.onmessage = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
  return () => es.close();
}, []);
```

---

## 13. Build Order

### Phase 1 — Foundation (mostly done ✅)

- [x] Monorepo, NestJS API, all core modules
- [x] Zustand auth store (localStorage persistence)
- [x] Axios client (withCredentials + 401 interceptor)
- [ ] `(auth)` shell: login, signup, forgot-password, reset-password, verify-email, accept-invite, Google callback
- [ ] `middleware.ts` — route protection
- [ ] `(app)/layout.tsx` auth guard (token + `/auth/me` rehydration)

### Phase 2 — Core Product

- [ ] Onboarding (3 steps)
- [ ] `/dashboard` (mock data acceptable for initial build)
- [ ] `/clients` + `/clients/new` + `/clients/[id]`
- [ ] `/projects` + `/projects/new` + `/projects/[id]` (all 6 tabs)
- [ ] `/invoices` + new + detail + payments
- [ ] `/proposals` + new + detail + versions
- [ ] `/team` + invite
- [ ] `/settings/profile` + workspace + notifications + danger

### Phase 3 — Polish + Extensions

- [ ] **Build API:** `/reports/*` aggregate endpoints, then build `/reports` page
- [ ] **Build API:** `/expenses` module, then build `/expenses` page
- [ ] `/notifications` inbox
- [ ] `/settings/billing` plan comparison
- [ ] **Build API:** email template endpoints, then `/settings/email-templates`

### Phase 4 — Public Routes (Client Portals)

- [ ] `/portal/[shareToken]`
- [ ] `/portal/proposals/view/[token]`
- [ ] `/portal/invoices/view/[token]`

### Phase 5 — Admin Shell

- [ ] **Build API:** all missing admin endpoints (see §8)
- [ ] `(admin)/layout.tsx` isSuperAdmin guard
- [ ] `/admin` overview + all sub-pages

### Phase 6 — Marketing + Launch

- [ ] Landing page · `/pricing` · `/status` · `/legal/*` · `/changelog`
- [ ] SEO: `generateMetadata()`, sitemap.xml, OG tags

---

## API Gaps — Must Build Before Frontend Pages

| Frontend Feature | Missing API Endpoint |
|---|---|
| Dashboard revenue widget | `GET /reports/summary` |
| Reports page | `GET /reports/invoices`, `/reports/top-clients`, `/reports/projects` |
| Expenses page | Entire `/expenses` module |
| Active sessions in profile | `GET/DELETE /auth/sessions/*` |
| Workspace export | `POST /workspace/me/export` |
| Workspace delete | `DELETE /workspace/me` |
| Email templates | `GET/PATCH /workspace/me/email-templates/:type` |
| Admin user detail + actions | `GET/PATCH/POST/DELETE /admin/users/:id/*` |
| Admin workspace list + actions | `GET/PATCH/DELETE /admin/workspaces/*` |
| Admin queue inspection | `GET/POST/DELETE /admin/queues/*` |
| Admin service health | `GET /admin/services/health` |
| Admin feature flags | `GET/PATCH /admin/feature-flags` + overrides |
| Admin broadcast | `POST /admin/notifications/broadcast` |
| Admin platform settings | `GET/PATCH /admin/platform-settings` |
| Notification inbox + bell | `GET /notifications`, `PATCH /notifications/:id/read`, `GET /notifications/unread-count` |

---

## Open Questions

1. **Notifications MVP:** Polling 60s (above) or SSE from day 1?
   Recommendation: Polling. Upgrade to SSE once real concurrent users arrive.

2. **Rich text:** TipTap for proposals (professional docs). Plain `<textarea>` for comments + tasks (simpler).

3. **Status page:** Uptime Robot embed for MVP. Custom `/status` page in Phase 6.

4. **Blog + Changelog:** Hashnode for blog. `changelog.json` in repo, rendered on `/changelog`.

5. **Invoice PDF preview:** `<iframe>` + PDF.js on invoice detail page. Download link as fallback.

6. **Expenses priority:** Confirm P2 (core product) or P3 (feature-flagged extension)?
