import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { spawn, type ChildProcess } from 'child_process';
import mongoose from 'mongoose';
import { io, type Socket } from 'socket.io-client';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { StatusCodes } from 'http-status-codes';

/*
 * End-to-end journey.
 *
 * Spawns the compiled server built by the `pretest:e2e` script into its own
 * `dist-e2e/` folder (so running the suite never disturbs a `nest start --watch`
 * dev server, which owns `dist/`) and drives it over HTTP *and* socket.io — i.e.
 * from the outside, exactly like the browser does. Nest's dependency injection
 * needs `emitDecoratorMetadata`, which vitest's esbuild transformer does not
 * emit, so importing the application in-process is not an option; the build is
 * what makes this suite possible.
 *
 * Requires MongoDB on localhost:27017 (`npm run test:e2e -w apps/api`).
 */

/** Vitest runs with the API package as its working directory. */
const apiRoot = process.cwd();

const TEST_PORT = 3997;
const TEST_DB = `Shlanu_e2e_${process.pid}`;
const TEST_DB_URL = `mongodb://localhost:27017/${TEST_DB}`;

const uploadsDir = join(tmpdir(), `shlanu-e2e-uploads-${process.pid}`);

let server: ChildProcess | undefined;
let serverLog = '';
const baseUrl = `http://127.0.0.1:${TEST_PORT}`;
let socket: Socket | undefined;

const stamp = Date.now();
const owner = { email: `owner${stamp}@e2e.test`, password: 'owner-pass-1234' };
const guest = { email: `guest${stamp}@e2e.test`, password: 'guest-pass-1234' };

let ownerCookie = '';
let guestCookie = '';
let guestInviteUrl = '';

/**
 * A parsed JSON body, read loosely: most assertions here reach one or two
 * properties of a response, and restating every DTO on the client side would be
 * noise in a suite that is testing the server. The payloads that get iterated
 * declare their shape instead — `request<{ data: Member[] }>(...)` — so the
 * loose default never spreads past the assertions it was written for.
 */
interface Json {
  [key: string]: Json;
}

interface ApiResponse<TJson> {
  status: number;
  json: TJson;
  text: string;
  session: string;
}

interface RequestOptions {
  body?: unknown;
  form?: FormData;
  cookie?: string;
}

const request = async <TJson = Json>(
  method: string,
  path: string,
  options: RequestOptions = {}
): Promise<ApiResponse<TJson>> => {
  const headers: Record<string, string> = {};
  const cookie = options.cookie ?? ownerCookie;
  if (cookie) headers.cookie = cookie;
  if (options.body !== undefined) headers['content-type'] = 'application/json';

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: options.form ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
  });

  const cookies = response.headers.getSetCookie?.() ?? [];
  const session = cookies.find((entry) => entry.startsWith('session='));

  const text = await response.text();
  let json: TJson;
  try {
    json = (text ? JSON.parse(text) : undefined) as TJson;
  } catch {
    json = text as TJson;
  }

  return {
    status: response.status,
    json,
    text,
    session: session ? session.split(';')[0] : '',
  };
};

/**
 * The gateway accepts the connection and then drops it when the handshake
 * carries no usable session, so the client can surface an "unauthorized" state
 * instead of an opaque connection error.
 */
const expectSocketDropped = async (cookie: string): Promise<void> => {
  const client = io(baseUrl, {
    path: '/socket.io',
    transports: ['websocket'],
    forceNew: true,
    extraHeaders: cookie ? { cookie } : undefined,
  });

  const dropped = await new Promise<boolean>((resolve) => {
    const timer = setTimeout(() => resolve(false), 5000);
    client.once('disconnect', () => {
      clearTimeout(timer);
      resolve(true);
    });
  });

  client.close();
  expect(dropped).toBe(true);
};

/** Resolves with the payload of the first matching event, or `null` on timeout. */
const waitForEvent = <T = Json>(event: string, timeoutMs = 5000): Promise<T | null> => {
  return new Promise((resolve) => {
    if (!socket) {
      resolve(null);
      return;
    }

    const timer = setTimeout(() => resolve(null), timeoutMs);
    socket.once(event, (payload: T) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
};

const connectSocket = (options: { cookie?: string; token?: string }): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    const client = io(baseUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      forceNew: true,
      extraHeaders: options.cookie ? { cookie: options.cookie } : undefined,
      auth: options.token ? { token: options.token } : undefined,
    });

    const timer = setTimeout(() => reject(new Error('socket connect timeout')), 5000);

    client.once('connect', () => {
      clearTimeout(timer);
      resolve(client);
    });
    client.once('connect_error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
};

describe('Shlanu end-to-end journey', () => {
  beforeAll(async () => {
    // Start from an empty database so repeated runs stay independent.
    const connection = await mongoose.createConnection(TEST_DB_URL).asPromise();
    await connection.dropDatabase();
    await connection.close();

    await fs.rm(uploadsDir, { recursive: true, force: true });

    server = spawn(process.execPath, ['dist-e2e/main.js'], {
      cwd: apiRoot,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: String(TEST_PORT),
        DATABASE_URL: TEST_DB_URL,
        DATABASE_NAME: TEST_DB,
        UPLOADS_DIR: uploadsDir,
        EMAIL_ENABLED: 'false',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    server.stdout?.on('data', (chunk) => (serverLog += String(chunk)));
    server.stderr?.on('data', (chunk) => (serverLog += String(chunk)));

    // Poll until the server answers, so the suite fails with its log if it does not.
    const deadline = Date.now() + 90_000;
    for (;;) {
      if (server.exitCode !== null) {
        throw new Error(`server exited before becoming healthy:\n${serverLog}`);
      }

      try {
        const response = await fetch(`${baseUrl}/health`);
        if (response.ok) break;
      } catch {
        // Not listening yet — keep waiting.
      }

      if (Date.now() > deadline) {
        throw new Error(`server did not become healthy in time:\n${serverLog}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  });

  afterAll(async () => {
    socket?.close();
    server?.kill();
    await fs.rm(uploadsDir, { recursive: true, force: true });
  });

  it('registers the family owner and issues a session cookie', async () => {
    const response = await request('POST', '/api/v1/auth/register', {
      body: { ...owner, displayName: 'בעלת המשפחה', preferredLocale: 'he' },
    });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.session).toMatch(/^session=/);

    ownerCookie = response.session;

    expect(response.json.user.email).toBe(owner.email);
    expect(response.json.user.familyId).toBeTruthy();
  });

  it('distinguishes a duplicate sign-up from a bad password', async () => {
    // Registering an address that exists is a conflict, not an authentication
    // failure, and the message must survive to the client.
    const duplicate = await request('POST', '/api/v1/auth/register', {
      body: { ...owner, displayName: 'כפילות' },
    });

    expect(duplicate.status).toBe(StatusCodes.CONFLICT);
    expect(duplicate.json.message).toBe('כתובת אימייל כבר רשומה');

    const wrongPassword = await request('POST', '/api/v1/auth/login', {
      body: { email: owner.email, password: 'definitely-not-the-password' },
    });

    expect(wrongPassword.status).toBe(StatusCodes.UNAUTHORIZED);
    expect(wrongPassword.json.message).toBe('אימייל או סיסמה שגויים');
  });

  it('resolves the session through /auth/me', async () => {
    const response = await request('GET', '/api/v1/auth/me');
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.json.email).toBe(owner.email);
  });

  it('authenticates a socket with the session cookie and rejects anonymous ones', async () => {
    socket = await connectSocket({ cookie: ownerCookie });
    expect(socket.connected).toBe(true);

    // The same session also works as an explicit handshake token.
    const tokenSocket = await connectSocket({ token: ownerCookie.replace('session=', '') });
    expect(tokenSocket.connected).toBe(true);
    tokenSocket.close();

    await expectSocketDropped('');
  });

  it('creates a task, persists every field and emits task:created', async () => {
    const event = waitForEvent('task:created');

    const response = await request('POST', '/api/v1/tasks', {
      body: {
        title: 'קניות לשבוע',
        description: 'חלב, לחם, ירקות',
        priority: 'HIGH',
        category: 'בית',
        dueAt: new Date(Date.now() + 86_400_000).toISOString(),
      },
    });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(response.json.data).toMatchObject({
      title: 'קניות לשבוע',
      priority: 'HIGH',
      category: 'בית',
      status: 'OPEN',
    });
    expect(response.json.data.dueAt).toBeTruthy();

    const payload = await event;
    expect(payload?.title).toBe('קניות לשבוע');

    const list = await request('GET', '/api/v1/tasks');
    expect(list.json.data).toHaveLength(1);
  });

  it('rejects an invalid assignee id', async () => {
    const response = await request('POST', '/api/v1/tasks', {
      body: { title: 'משימה', assigneeUserId: 'not-an-object-id' },
    });
    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it('completes a task, stamps completedAt and emits task:updated', async () => {
    const created = await request('POST', '/api/v1/tasks', { body: { title: 'מטלה' } });
    const taskId = created.json.data.id;

    const event = waitForEvent('task:updated');
    const response = await request('PATCH', `/api/v1/tasks/${taskId}`, {
      body: { status: 'COMPLETED' },
    });

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.json.data.status).toBe('COMPLETED');
    expect(response.json.data.completedAt).toBeTruthy();
    expect(await event).toBeTruthy();

    // Re-opening clears the completion timestamp again.
    const reopened = await request('PATCH', `/api/v1/tasks/${taskId}`, { body: { status: 'OPEN' } });
    expect(reopened.json.data.completedAt).toBeFalsy();

    const removed = await request('DELETE', `/api/v1/tasks/${taskId}`);
    expect(removed.json.success).toBe(true);

    const missing = await request('PATCH', `/api/v1/tasks/${taskId}`, { body: { title: 'x' } });
    expect(missing.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('creates a calendar event and rejects an inverted range', async () => {
    const event = waitForEvent('event:created');

    const response = await request('POST', '/api/v1/calendar', {
      body: {
        title: 'ארוחת ערב',
        startsAt: new Date(Date.now() + 3_600_000).toISOString(),
        endsAt: new Date(Date.now() + 7_200_000).toISOString(),
        location: 'בית',
      },
    });

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(await event).toBeTruthy();

    const inverted = await request('POST', '/api/v1/calendar', {
      body: {
        title: 'טווח הפוך',
        startsAt: new Date(Date.now() + 7_200_000).toISOString(),
        endsAt: new Date(Date.now() + 3_600_000).toISOString(),
      },
    });
    expect(inverted.status).toBe(StatusCodes.BAD_REQUEST);

    const range = await request(
      'GET',
      `/api/v1/calendar?start=${encodeURIComponent(
        new Date(Date.now() - 86_400_000).toISOString(),
      )}&end=${encodeURIComponent(new Date(Date.now() + 86_400_000).toISOString())}`,
    );
    expect(range.status).toBe(StatusCodes.OK);
    expect(range.json.data.length).toBeGreaterThanOrEqual(1);
  });

  it('manages budgets and expenses with realtime events', async () => {
    const budgetEvent = waitForEvent('budget:created');
    const budget = await request('POST', '/api/v1/budget', { body: { name: 'מזון', amount: 2500 } });

    expect(budget.status).toBe(StatusCodes.CREATED);
    expect(budget.json.data).toMatchObject({ currency: 'ILS', period: 'MONTHLY' });
    expect(await budgetEvent).toBeTruthy();

    const budgetId = budget.json.data.id;
    const updated = await request('PATCH', `/api/v1/budget/${budgetId}`, { body: { amount: 3000 } });
    expect(updated.json.data.amount).toBe(3000);

    const expenseEvent = waitForEvent('expense:created');
    const expense = await request('POST', '/api/v1/budget/expenses', {
      body: { amount: 120.5, category: 'מזון', occurredAt: new Date().toISOString() },
    });

    expect(expense.status).toBe(StatusCodes.CREATED);
    expect(expense.json.data.amount).toBe(120.5);
    expect(await expenseEvent).toBeTruthy();

    const expenses = await request('GET', '/api/v1/budget/expenses');
    expect(expenses.json.data).toHaveLength(1);

    const removed = await request('DELETE', `/api/v1/budget/expenses/${expense.json.data.id}`);
    expect(removed.json.success).toBe(true);

    const removedBudget = await request('DELETE', `/api/v1/budget/${budgetId}`);
    expect(removedBudget.json.success).toBe(true);

    const badId = await request('DELETE', '/api/v1/budget/not-an-id');
    expect(badId.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('stores baby logs and auto-creates the baby profile', async () => {
    const logEvent = waitForEvent('baby-log:created');

    const log = await request('POST', '/api/v1/baby/logs', {
      body: {
        type: 'FEEDING',
        occurredAt: new Date().toISOString(),
        details: { amountMl: 120 },
        note: 'האכלה מלאה',
      },
    });

    expect(log.status).toBe(StatusCodes.CREATED);
    expect(log.json.data.type).toBe('FEEDING');
    expect(await logEvent).toBeTruthy();

    const logs = await request('GET', '/api/v1/baby/logs');
    expect(logs.json.data).toHaveLength(1);

    const profiles = await request('GET', '/api/v1/baby/profiles');
    expect(profiles.json.data).toHaveLength(1);
    expect(profiles.json.data[0].color).toBeTruthy();

    const saved = await request('PATCH', `/api/v1/baby/profiles/${profiles.json.data[0].id}`, {
      body: { displayName: 'יונתן', dateOfBirth: '2025-01-01' },
    });
    expect(saved.json.data.displayName).toBe('יונתן');
  });

  it('keeps twins apart, on the timeline and in the database', async () => {
    const profileEvent = waitForEvent('baby-profile:created');

    const rejected = await request('POST', '/api/v1/baby/profiles', {
      body: { displayName: 'בן', color: 'purple' },
    });
    expect(rejected.status).toBe(StatusCodes.BAD_REQUEST);

    const twin = await request('POST', '/api/v1/baby/profiles', {
      body: { displayName: 'אורי', dateOfBirth: '2025-01-01' },
    });
    expect(twin.status).toBe(StatusCodes.CREATED);
    expect(await profileEvent).toBeTruthy();
    const twinId = twin.json.data.id;

    const logged = await request('POST', '/api/v1/baby/logs', {
      body: { type: 'SLEEP', babyProfileId: twinId, occurredAt: new Date().toISOString() },
    });
    expect(logged.status).toBe(StatusCodes.CREATED);
    expect(logged.json.data.babyProfileId).toBe(twinId);

    // Two babies, two colours — the point of the colour is telling them apart.
    const profiles = await request('GET', '/api/v1/baby/profiles');
    expect(profiles.json.data).toHaveLength(2);
    expect(profiles.json.data[0].color).not.toBe(profiles.json.data[1].color);

    const twinLogs = await request('GET', `/api/v1/baby/logs?babyProfileId=${twinId}`);
    expect(twinLogs.json.data).toHaveLength(1);
    expect(twinLogs.json.data[0].type).toBe('SLEEP');

    const firstLogs = await request(
      'GET',
      `/api/v1/baby/logs?babyProfileId=${profiles.json.data[0].id}`,
    );
    expect(firstLogs.json.data).toHaveLength(1);
    expect(firstLogs.json.data[0].type).toBe('FEEDING');

    // With two babies to choose from, a log that names neither is refused
    // rather than filed under whichever one came first.
    const ambiguous = await request('POST', '/api/v1/baby/logs', {
      body: { type: 'NOTE', occurredAt: new Date().toISOString() },
    });
    expect(ambiguous.status).toBe(StatusCodes.BAD_REQUEST);

    // Deleting a twin takes their entries along and leaves the other alone.
    const removalEvent = waitForEvent('baby-profile:deleted');
    const removed = await request('DELETE', `/api/v1/baby/profiles/${twinId}`);
    expect(removed.status).toBe(StatusCodes.OK);
    expect(removed.json.deletedLogs).toBe(1);
    expect(await removalEvent).toBeTruthy();

    const remaining = await request('GET', '/api/v1/baby/profiles');
    expect(remaining.json.data).toHaveLength(1);

    const allLogs = await request('GET', '/api/v1/baby/logs');
    expect(allLogs.json.data).toHaveLength(1);
    expect(allLogs.json.data[0].type).toBe('FEEDING');

    const gone = await request('DELETE', `/api/v1/baby/profiles/${twinId}`);
    expect(gone.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('uploads, downloads and deletes a document', async () => {
    const form = new FormData();
    form.append('title', 'חוזה שכירות');
    form.append('category', 'חוזים');
    form.append('file', new Blob([Buffer.from('%PDF-1.4 e2e')], { type: 'application/pdf' }), 'contract.pdf');

    const uploaded = await request('POST', '/api/v1/documents', { form });
    expect(uploaded.status).toBe(StatusCodes.CREATED);
    expect(uploaded.json.data.downloadUrl).toBe(
      `/api/v1/documents/${uploaded.json.data.id}/download`,
    );
    expect(uploaded.json.data.originalName).toBe('contract.pdf');
    expect(uploaded.json.data.storageKey).toBeUndefined();

    const download = await fetch(`${baseUrl}${uploaded.json.data.downloadUrl}`, {
      headers: { cookie: ownerCookie },
    });
    expect(download.status).toBe(StatusCodes.OK);
    expect(await download.text()).toContain('%PDF-1.4 e2e');

    const list = await request('GET', '/api/v1/documents');
    expect(list.json.data).toHaveLength(1);

    const unsupported = new FormData();
    unsupported.append('title', 'סקריפט');
    unsupported.append('category', 'אחר');
    unsupported.append('file', new Blob(['#!/bin/sh'], { type: 'application/x-sh' }), 'evil.sh');
    const rejected = await request('POST', '/api/v1/documents', { form: unsupported });
    expect(rejected.status).toBe(StatusCodes.BAD_REQUEST);

    const removed = await request('DELETE', `/api/v1/documents/${uploaded.json.data.id}`);
    expect(removed.json.success).toBe(true);
  });

  it('reads and updates the profile without ever leaking password material', async () => {
    const profile = await request('GET', '/api/v1/settings/profile');
    expect(profile.status).toBe(StatusCodes.OK);
    expect(profile.json.data.email).toBe(owner.email);
    expect(profile.text).not.toContain('passwordHash');

    const updated = await request('PATCH', '/api/v1/settings/profile', {
      body: { displayName: 'בעלת הבית', timezone: 'Europe/London' },
    });
    expect(updated.json.data.displayName).toBe('בעלת הבית');
    expect(updated.json.data.timezone).toBe('Europe/London');
  });

  it('persists notification preferences one key at a time', async () => {
    const response = await request('PATCH', '/api/v1/settings/preferences', {
      body: { notificationPreferences: { taskAssigned: false, email: true } },
    });

    expect(response.json.data.notificationPreferences).toMatchObject({
      taskAssigned: false,
      email: true,
      taskDueSoon: true,
    });

    // The nested DTO is whitelisted: an unknown key is dropped, never persisted.
    const unknown = await request('PATCH', '/api/v1/settings/preferences', {
      body: { notificationPreferences: { unknownKey: true } },
    });
    expect(unknown.status).toBe(StatusCodes.OK);

    const profile = await request('GET', '/api/v1/settings/profile');
    expect(profile.json.data.notificationPreferences.unknownKey).toBeUndefined();
    expect(profile.json.data.notificationPreferences.taskAssigned).toBe(false);
  });

  it('rejects a wrong or unchanged password, then changes it', async () => {
    const wrong = await request('POST', '/api/v1/settings/password', {
      body: { currentPassword: 'definitely-wrong', newPassword: 'brand-new-pass-1' },
    });
    expect(wrong.status).toBe(StatusCodes.UNAUTHORIZED);

    const unchanged = await request('POST', '/api/v1/settings/password', {
      body: { currentPassword: owner.password, newPassword: owner.password },
    });
    expect(unchanged.status).toBe(StatusCodes.BAD_REQUEST);

    const changed = await request('POST', '/api/v1/settings/password', {
      body: { currentPassword: owner.password, newPassword: 'brand-new-pass-1' },
    });
    expect(changed.status).toBeLessThan(300);

    owner.password = 'brand-new-pass-1';
  });

  it('exposes the current family and its members without raw ids', async () => {
    const current = await request('GET', '/api/v1/families/current');
    expect(current.status).toBe(StatusCodes.OK);
    expect(current.json.data.memberCount).toBe(1);
    expect(current.json.data).not.toHaveProperty('_id');

    const members = await request('GET', '/api/v1/families/members');
    expect(members.json.data).toHaveLength(1);
    expect(members.json.data[0]).toMatchObject({ role: 'OWNER', isYou: true });
    expect(members.text).not.toContain('"_id"');
  });

  it('creates, lists and revokes an invitation', async () => {
    const created = await request<{ data: { inviteUrl: string; expiresAt: string } }>(
      'POST',
      '/api/v1/families/invitations',
      { body: { email: guest.email, role: 'MEMBER' } }
    );

    expect(created.status).toBe(StatusCodes.CREATED);
    expect(created.json.data.inviteUrl).toContain('/app/settings?invite=');
    expect(created.json.data.expiresAt).toBeTruthy();

    // The raw token is only ever returned once: the API stores its hash, so the
    // list view (used by the settings page) never exposes an invite link again.
    guestInviteUrl = created.json.data.inviteUrl;

    const invitations = await request('GET', '/api/v1/families/invitations');
    expect(invitations.json.data[0].status).toBe('PENDING');
    expect(invitations.json.data[0].inviteUrl).toBeUndefined();

    const revocable = await request('POST', '/api/v1/families/invitations', {
      body: { email: `revoke${stamp}@e2e.test`, role: 'MEMBER' },
    });
    const revoked = await request('DELETE', `/api/v1/families/invitations/${revocable.json.data.id}`);
    expect(revoked.json.success).toBe(true);
  });

  it('lets the invited member join and switches the session family', async () => {
    // Second account, created after the invitation was issued.
    const registered = await request('POST', '/api/v1/auth/register', {
      body: { ...guest, displayName: 'האורח', preferredLocale: 'he' },
    });
    expect(registered.status).toBe(StatusCodes.CREATED);
    guestCookie = registered.session;

    const ownFamily = await request('GET', '/api/v1/families/current', { cookie: guestCookie });
    const ownerFamily = await request('GET', '/api/v1/families/current');

    const invitations = await request<{ data: Array<{ email: string }> }>(
      'GET',
      '/api/v1/families/invitations'
    );
    expect(invitations.json.data.some((item) => item.email === guest.email)).toBe(true);

    const token = guestInviteUrl.split('invite=')[1];
    expect(token).toBeTruthy();

    const accepted = await request('POST', '/api/v1/families/invitations/accept', {
      cookie: guestCookie,
      body: { token },
    });
    expect(accepted.status).toBeLessThan(300);
    expect(accepted.json.familyId).toBe(ownerFamily.json.data.id);

    const switched = await request('GET', '/api/v1/families/current', { cookie: guestCookie });
    expect(switched.json.data.id).toBe(ownerFamily.json.data.id);
    expect(switched.json.data.id).not.toBe(ownFamily.json.data.id);

    const members = await request('GET', '/api/v1/families/members');
    expect(members.json.data).toHaveLength(2);

    // Re-using the same token must not work.
    const reused = await request('POST', '/api/v1/families/invitations/accept', {
      cookie: guestCookie,
      body: { token },
    });
    expect(reused.status).toBe(StatusCodes.NOT_FOUND);
  });

  it('notifies the assignee when a task is assigned to them', async () => {
    const members = await request<{ data: Array<{ id: string; isYou: boolean }> }>(
      'GET',
      '/api/v1/families/members'
    );
    const guestMember = members.json.data.find((member) => !member.isYou);
    if (!guestMember) throw new Error('the invited member is missing from the family');

    const guestSocket = await connectSocket({ cookie: guestCookie });
    const pushed = new Promise<Json | null>((resolve) => {
      const timer = setTimeout(() => resolve(null), 5000);
      guestSocket.once('notification:created', (payload: Json) => {
        clearTimeout(timer);
        resolve(payload);
      });
    });

    const created = await request('POST', '/api/v1/tasks', {
      body: { title: 'תורנות כלים', assigneeUserId: guestMember.id },
    });
    expect(created.status).toBe(StatusCodes.CREATED);

    const notification = await pushed;
    expect(notification?.type).toBe('TASK_ASSIGNED');
    expect(notification?.recipientUserId).toBe(guestMember.id);
    guestSocket.close();

    const unread = await request('GET', '/api/v1/notifications/unread-count', {
      cookie: guestCookie,
    });
    expect(unread.json.count).toBe(1);

    const list = await request('GET', '/api/v1/notifications', { cookie: guestCookie });
    expect(list.json.data).toHaveLength(1);
    expect(list.json.data[0].readAt).toBeNull();

    // Single read, then bulk read.
    const marked = await request('PATCH', `/api/v1/notifications/${list.json.data[0].id}/read`, {
      cookie: guestCookie,
    });
    expect(marked.json.data.readAt).toBeTruthy();

    await request('POST', '/api/v1/tasks', {
      body: { title: 'עוד תורנות', assigneeUserId: guestMember.id },
    });

    const readAll = await request('POST', '/api/v1/notifications/read-all', {
      cookie: guestCookie,
    });
    expect(readAll.json.success).toBe(true);

    const after = await request('GET', '/api/v1/notifications/unread-count', {
      cookie: guestCookie,
    });
    expect(after.json.count).toBe(0);
  });

  it('serves the aggregated dashboard', async () => {
    const response = await request('GET', '/api/v1/dashboard');

    expect(response.status).toBe(StatusCodes.OK);
    expect(response.json).toHaveProperty('tasks');
    expect(response.json).toHaveProperty('events');
    expect(response.json).toHaveProperty('budget');
    expect(response.json).toHaveProperty('babyLogs');
    expect(response.json.babyLogs).toHaveProperty('recent');
    // The dashboard names the babies, so the card can group by them.
    expect(response.json.babyLogs.profiles).toHaveLength(1);
    expect(response.json).toHaveProperty('notifications');
  });

  it('rejects unauthenticated writes and reads', async () => {
    const write = await request('POST', '/api/v1/tasks', { cookie: '', body: { title: 'אנונימי' } });
    expect(write.status).toBe(StatusCodes.UNAUTHORIZED);

    const readAll = await request('POST', '/api/v1/notifications/read-all', { cookie: '' });
    expect(readAll.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  it('logs out and invalidates the session', async () => {
    const logout = await request('POST', '/api/v1/auth/logout');
    expect(logout.json.success).toBe(true);

    // The session is gone, so `/auth/me` now answers 401 like every other
    // authenticated endpoint.
    const me = await request('GET', '/api/v1/auth/me', { cookie: ownerCookie });
    expect(me.status).toBe(StatusCodes.UNAUTHORIZED);

    // The revoked token is no longer accepted by the socket handshake either.
    await expectSocketDropped(ownerCookie);
  });
});
