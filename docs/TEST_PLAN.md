# Shlanu — Test Plan

This file describes the tests that exist and run, not the tests one could imagine.
A feature that is not in the product has no test here, and a test that would not
fail when the feature breaks is not listed.

## What runs

| Suite | Command | Needs | What it covers |
|-------|---------|-------|----------------|
| API unit | `npm run test -w apps/api` | nothing | env schema, pagination helpers, log lines, request ids, origin matching, reset-mail text |
| API end-to-end | `npm run test:e2e -w apps/api` | MongoDB on `localhost:27017` | the whole HTTP + socket surface, against a built server |
| Web unit | `npm run test -w apps/web` | nothing | currency/date helpers |
| Types | `npx tsc -p apps/api/tsconfig.json`, `npx tsc -p apps/api/tsconfig.e2e.json`, `npx tsc -p apps/web/tsconfig.json` | nothing | every type in the repository |
| Lint | `npm run lint` | nothing | zero warnings, no `any`, arrow functions only |
| Build | `npm run build` | nothing | both apps produce a deployable bundle |

The e2e suite builds `dist-e2e`, starts the server on port 3997 against its own
database, and drops that database around the run. It never touches the
development data.

## What the end-to-end suite asserts

- **Auth** — register, login, `/auth/me`, wrong password, logout; a revoked
  session is refused by HTTP *and* by the socket handshake.
- **Password reset** — an unknown address gets the same answer as a real one; the
  link is single-use; the old password stops working; every session opened
  before the reset is signed out.
- **Family isolation** — a foreign family's write answers 404, a foreign
  timeline answers 200 with an empty list, an invitation can be accepted once.
- **Tasks** — every field persists, `task:created`/`task:updated` are emitted,
  completing stamps `completedAt`, the list pages with `limit`/`offset` and
  `hasMore`, the status filter is the server's, `GET /tasks/:id` works across
  pages, bad ids and limits are refused.
- **Calendar** — create/read/update/delete, range query, inverted range is 400.
- **Budget** — budgets and expenses with realtime events, the month summary
  agrees with the dashboard, the expense list pages.
- **Baby** — twins stay apart by profile and colour, a log creates a profile when
  none exists, the timeline pages one entry at a time, bad colours are 400.
- **Notifications** — list pages, mark one / mark all, unread count.
- **Settings** — export is an attachment without any credential material;
  deleting an account needs its password and then refuses login.
- **API docs** — `/api/docs` and `/api/docs-json` are served.
- **Request tracing** — `X-Request-Id` is generated, echoed when valid, replaced
  when it is not.

## Deliberate gaps

- **No browser automation.** There is no Playwright suite, so routing, focus
  management, the accessibility widget and drag/scroll behaviour are checked by
  hand. Component behaviour is covered only where a pure function can be tested.
- **Desktop only.** Mobile layout and touch behaviour are out of scope for now,
  by product decision.
- **No load or performance tests.** Rate limiting is unit-tested at the
  middleware level; throughput is not measured.
- **Ownership transfer is not a feature.** Deleting an owner's account promotes
  the longest-standing member; only the "owner was alone, family is deleted"
  path is exercised end to end.
- **SMTP delivery is not tested.** CI has no mail server. The message text is
  unit-tested and the full flow is tested through the development log, which is
  where the link goes when SMTP is absent.
- **No audit trail**, because nothing writes one yet.

## Test data

- The e2e database is separate and dropped before and after the run.
- Users and families are created per run with a timestamp suffix, so assertions
  do not depend on ordering between suites that share the database.
- No production data is used anywhere.

## CI

`.github/workflows/ci.yml` runs on every push to `master`: lint, the three type
checks, unit tests, build, then the e2e suite against a MongoDB service
container. `npm audit` reports but does not fail the build, so a new advisory is
visible without blocking unrelated work.
