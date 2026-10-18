# FamilyOS — Audit & Remediation Tracker

Audit date: 2026-10-18
Scope: `apps/api` (NestJS + Mongoose), `apps/web` (React + Vite + Tailwind), infra/docs.
Method: full read-through of every controller/service/model/page/component, plus live
HTTP probing of the running stack (`/health` healthy, MongoDB connected, web dev server up).

Severity: **P0** = broken/non-functional feature, **P1** = wrong behaviour or data loss,
**P2** = quality/robustness, **P3** = cosmetic.

Legend: `[ ]` open · `[x]` done

---

## 1. Realtime (sockets) — completely inert

| ID | Sev | Finding | Evidence |
|----|-----|---------|----------|
| RT-1 | P0 | `@WebSocketGateway` exists and is registered, but there is **no `@SubscribeMessage`** anywhere and `RealtimeGateway` is **never injected**, so `joinFamilyRoom()` / `emit*()` are dead code — no domain event ever reaches a client. | `apps/api/src/modules/realtime/realtime.gateway.ts:1-75`, zero matches for `@SubscribeMessage` |
| RT-2 | P0 | Gateway has **no authentication**: any client could join any `family:<id>` room if a handler existed. | `realtime.gateway.ts:22-33` |
| RT-3 | P0 | Frontend declares `socket.io-client` but the package is **never imported**; there is no client, no reconnect, no cache invalidation. | `apps/web/package.json:26`, zero matches in `apps/web/src` |
| RT-4 | P1 | No dev proxy for the socket path, so even a correct client could not reach the gateway through Vite. | `apps/web/vite.config.ts` (only `/api`) |
| RT-5 | P1 | `notifications` has **no create path**: rows can only appear from the seed script, so the notification stream can never produce live events. | `notifications.service.ts` (list/count/read-all only) |
| RT-6 | P1 | No unread badge in the header; the bell is a plain link and nothing polls or subscribes. | `Header.tsx:16-22` |

**Target contract (implemented):** authenticated socket.io gateway on the default `/socket.io`
path. Handshake auth resolves the `session` cookie (or `handshake.auth.token`) through the same
`sessionStore`, joins `family:<familyId>`, and emits `domain:action` events to that room:

```
task:created  task:updated  task:deleted
event:created event:updated event:deleted
expense:created expense:updated expense:deleted
budget:created budget:updated
baby-log:created baby-log:updated baby-log:deleted
notification:created notification:read
```

## 2. Settings — the whole page is a mock

| ID | Sev | Finding | Evidence |
|----|-----|---------|----------|
| ST-1 | P0 | `SettingsPage` renders **six static cards and zero interactive controls**. Profile, family members, language, notification prefs, security and logout do nothing at all. | `apps/web/src/pages/SettingsPage.tsx:1-41` |
| ST-2 | P0 | **Logout is not wired**: no call to `POST /api/v1/auth/logout`, no cache clear, no redirect. | `SettingsPage.tsx:29-37` |
| ST-3 | P0 | **No settings API client at all** — `GET/PATCH /api/v1/settings/profile` and `PATCH /api/v1/settings/preferences` exist server-side but are never called. | zero `fetch` in `SettingsPage.tsx` |
| ST-4 | P1 | `PATCH /api/v1/settings/profile` & `/preferences` return the **entire user document including `passwordHash`**. | `settings.service.ts:42,58` |
| ST-5 | P1 | Both PATCH handlers use `@Body() body: any` → no validation, no whitelist; any field can be written. | `settings.controller.ts:21,29` |
| ST-6 | P1 | No **change-password** endpoint (Security row is unimplementable today). | no hash/IPassword route |
| ST-7 | P1 | No GET for notification preferences; the model has no preference fields to persist. | `user.model.ts:1-33` |
| ST-8 | P2 | Copy bug: language row description reads the duplicated `"עברית, עברית"`. | `SettingsPage.tsx:14` |

**Target contract (implemented):**

```
GET    /api/v1/settings/profile            -> { data: { id, email, displayName, preferredLocale,
                                                      timezone, notificationPreferences, createdAt } }
PATCH  /api/v1/settings/profile            (DTO: UpdateProfileDto)  -> same shape as GET
PATCH  /api/v1/settings/preferences        (DTO: UpdatePreferencesDto) -> same shape as GET
POST   /api/v1/settings/password           (DTO: ChangePasswordDto) -> { success: true }
GET    /api/v1/families/current            -> { data: { id, name, defaultCurrency, timezone, memberCount } }
GET    /api/v1/families/members            -> { data: [{ id, displayName, email, role, isYou }] }
GET    /api/v1/families/invitations        -> { data: [...] }
POST   /api/v1/families/invitations        -> { data: { id, email, role, inviteUrl, expiresAt } }
DELETE /api/v1/families/invitations/:id    -> { success: true }
POST   /api/v1/families/invitations/accept -> { success: true, familyId }
```

`notificationPreferences` shape: `{ taskAssigned: bool, taskDueSoon: bool, eventReminder: bool,
expenseAdded: bool, weeklySummary: bool, email: bool }` (defaults: all true except `email`).

## 3. Families — broken write path & leaky reads

| ID | Sev | Finding | Evidence |
|----|-----|---------|----------|
| FM-1 | P0 | `POST /api/v1/families` uses `session.startTransaction()`, which **fails on standalone MongoDB** (the configured setup) → 500. | `families.service.ts:33-49`; `.env:8` |
| FM-2 | P1 | `GET /api/v1/families` returns `family.toObject()` spreads → raw `_id`/`__v` and **no `id`**, bypassing the global `toJSON` transform. | `families.service.ts:26` |
| FM-3 | P1 | `POST /api/v1/families` takes an inline object literal type → `ValidationPipe` has no metatype, nothing is validated. | `families.controller.ts:20-30` |
| FM-4 | P2 | `FamilyInvitation` / `AuditLog` models exist but are **used by nothing** — no invite flow, no audit trail. | no imports outside the model files |

## 4. Domains — accepted input silently discarded, self-contradicting validation

| ID | Sev | Finding | Evidence |
|----|-----|---------|----------|
| DO-1 | P0 | `POST /api/v1/tasks` discards `priority`, `category`, `dueAt`, `assigneeUserId`, `status` — only title/description/creator are stored, so new tasks never appear in dashboard buckets. | `tasks.service.ts:20-28` vs `create-task.dto.ts:15-33` |
| DO-2 | P0 | `assigneeUserId` is validated as `@IsUUID()` while the schema is `ObjectId` → **no value can satisfy both** (400 or 500 every time). Same bug in `UpdateTaskDto` and `CreateBabyLogDto.babyProfileId`. | `update-task.dto.ts:37`, `baby/dto/create-baby-log.dto.ts:11`, `task.model.ts:26`, `baby-log.model.ts:11` |
| DO-3 | P0 | `POST /api/v1/baby/logs` is therefore unusable, and `GET /api/v1/baby/profile` is read-only (no create/update route) so no profile can be created from the app. | `baby.controller.ts:13` |
| DO-4 | P1 | No budget create/update route → the budget page can only ever show seeded rows. | `budget.controller.ts` (GET only) |
| DO-5 | P1 | `POST /api/v1/documents` is **metadata-only**: it fabricates a `storageKey`, never receives bytes, and `contentType`/`sizeBytes` are optional in the DTO but `required` in the schema → 500 on omission. No download/upload route exists. | `documents.service.ts:21-38`, `document.model.ts:23-27` |
| DO-6 | P1 | `PATCH` in calendar/baby/budget/documents accept `@Body() body: any` → **mass assignment** (`familyId`, `createdByUserId` are writable). | `calendar.controller.ts:61`, `baby.controller.ts:44`, `budget.controller.ts:44`, `documents.controller.ts:36` |
| DO-7 | P1 | `MaxQueryDepth`/pagination absent: `GET` lists are unbounded (tasks, expenses, documents, calendar). | services |
| DO-8 | P2 | Unauthenticated writes `throw new Error('Unauthorized')` → **HTTP 500** instead of 401. | `tasks.controller.ts:29` and 8 siblings |

## 5. Dashboard & notifications

| ID | Sev | Finding | Evidence |
|----|-----|---------|----------|
| DB-1 | P1 | `budgetAmount` sums **all** budgets regardless of `period`, so "used vs total" is wrong once more than one period exists. | `dashboard.controller.ts:110` |
| DB-2 | P2 | Dashboard aggregation lives in the controller instead of a service (untestable, duplicated with the domain services). | `dashboard.controller.ts:47-108` |
| NT-1 | P1 | No mark-single-read / delete for notifications; only `read-all`. | `notifications.controller.ts` |
| NT-2 | P2 | `GET /health` returns **200 even when `status: 'unhealthy'`**. | `health.controller.ts:25-34` |

## 6. Frontend — dead controls

| ID | Sev | Finding | Evidence |
|----|-----|---------|----------|
| FE-1 | P0 | **No API client layer**: every call is an inline `fetch` duplicated per page; only 5 endpoints are ever called (`auth/me`, `dashboard`, `tasks`, `auth/login`, `auth/register`). | `useAuth.ts:19`, `DashboardPage.tsx:29`, `TasksPage.tsx:19`, `LoginPage.tsx:30`, `RegisterPage.tsx:35` |
| FE-2 | P0 | Dead buttons: "משימה חדשה", task complete-toggle, "אירוע חדש", baby log-type buttons, "הוצאה חדשה", "העלה מסמך" (+EmptyState action), "סמן הכל כנקרא", header avatar menu. | `TasksPage.tsx:76,111` · `CalendarPage.tsx:42` · `BabyPage.tsx:33-39` · `BudgetPage.tsx:9` · `DocumentsPage.tsx:9,21` · `NotificationsPage.tsx:9` · `Header.tsx:23` |
| FE-3 | P0 | Calendar, Baby, Budget, Documents, Notifications pages fetch **nothing** — they render static/empty states regardless of DB content. | those page files |
| FE-4 | P1 | `SkipLink` targets `#main-content`, which **only exists in `AppShell`** → the skip link is broken on the landing page (and login/register render none). | `SkipLink.tsx:4`, `AppShell.tsx:14` |
| FE-5 | P1 | Landing header hides its nav below `md` with **no replacement**, so feature/security anchors are unreachable on phones. | `LandingPage.tsx:81` |
| FE-6 | P1 | `soundMuted` accessibility setting is stored and toggled but **consumed by nothing** — it has no effect. | `accessibility/settings.ts:9,61-68` |
| FE-7 | P2 | `data-hide-images` also hides the brand logo (arguably intended, but undocumented). | `index.css:85-88`, `BrandLogo.tsx:25` |
| FE-8 | P2 | `TasksPage` label maps are loose `Record<string,string>` → unknown enums render `undefined`. | `TasksPage.tsx:25-43` |

## 7. Responsiveness

| ID | Sev | Finding | Evidence |
|----|-----|---------|----------|
| RS-1 | P1 | `main` has **no bottom padding** while `MobileNav` is a fixed bottom bar (~56px) → the last card on every mobile page is covered. | `AppShell.tsx:14`, `MobileNav.tsx:20` |
| RS-2 | P1 | No `min-w-0`/`truncate` on flex rows: long task/event titles push badges and controls out of the viewport (horizontal overflow). | `TasksPage.tsx:107-142`, `DashboardPage.tsx:91,113` |
| RS-3 | P1 | Long `displayName` in the header has no `max-w`/`truncate`. | `Header.tsx:27-29` |
| RS-4 | P2 | Calendar `grid-cols-7` with `h-10` cells is very tight at 320px and has no min-width guard. | `CalendarPage.tsx:29,59-65` |
| RS-5 | P2 | Hardcoded `px` in `index.css` (card padding, titles, min-heights) does **not** scale with the accessibility root-font-size control → layout drifts at 150-200%. | `index.css:123,144,151,167,225-230` |
| RS-6 | P2 | No `env(safe-area-inset-bottom)` handling for the fixed bar/FAB on notched phones. | `MobileNav.tsx:20`, `AccessibilityWidget.tsx:83` |
| RS-7 | P2 | Accessibility panel toggle is `h-4 w-8` with an `h-3 w-3` knob — below the 44px touch target guideline. | `AccessibilityMenu.tsx:49,54` |

## 8. Security / infra

| ID | Sev | Finding | Evidence |
|----|-----|---------|----------|
| SE-1 | P1 | Sessions are stored in a process-local `Map`: **every restart logs everyone out**, and it does not scale past one instance. | `session.store.ts:9-34` |
| SE-2 | P2 | CSRF token infrastructure exists but `generateCsrfToken()` is never called and the check is skipped unless the client volunteers the header (origin check remains the only real control). | `csrf.middleware.ts:53-69` |
| SE-3 | P2 | Security headers are set by hand; no `helmet`. CSP in nginx allows `https:` broadly. | `security-headers.middleware.ts`, `nginx.conf:16` |
| SE-4 | P2 | `npm run lint` cannot run — **eslint is not installed** in any workspace although `lint` scripts and a CI lint job reference it. | `apps/*/package.json` |
| SE-5 | P2 | No Prettier config exists, so the CI `prettier --check` step can never pass. | repo root |
| SE-6 | P2 | CI workflows trigger on `main, develop` while the default branch is `master` → **CI never runs**. | `.github/workflows/ci.yml` |
| SE-7 | P3 | `.env` keys `STORAGE_PROVIDER`, `EMAIL_ENABLED`, `ENABLE_SOCKET_IO` are read by nothing. | `apps/api/.env` |

---

## E2E test plan

1. **API journey (automated)**: register → `/auth/me` → create task (all fields persisted) →
   list → update to `COMPLETED` → dashboard reflects it → create expense → budget totals →
   create baby profile + log → settings profile/preferences update → change password →
   re-login with the new password → notifications list/unread/read-all → logout → all
   protected reads return empty and writes return 401.
2. **Realtime (automated)**: connect a socket.io client with the session cookie, assert
   `task:created` / `notification:created` arrive for a write performed over HTTP by another
   "member"; assert an unauthenticated socket is rejected and never joins a room.
3. **Invitations (automated)**: owner invites an email → invited user registers → accepts the
   token → membership created and the active family switches.
4. **Browser journey (manual/scripted checklist)**: RTL Hebrew UI, mobile 375px + desktop 1280px,
   accessibility widget, logout, settings persistence across reload.

## Known documentation gaps (not fabricated)

- Email delivery is **disabled** (`EMAIL_ENABLED=false`, no SMTP credentials): invitation
  emails are not sent. The API returns the invite URL and the UI surfaces it for copy/paste.
- File storage uses the **local disk** (`STORAGE_PROVIDER=local`); MinIO/S3 is configured in
  `docker-compose.yml` but no credentials or SDK integration exist yet.
- Sessions are in-memory (see SE-1); Redis/DB-backed sessions are a follow-up.
