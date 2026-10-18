import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { hashToken, sessionStore, SessionData } from '../auth/session.store';

/** Parses a `Cookie` request header without pulling in a dependency. */
const parseCookieHeader = (header: string | undefined): Record<string, string> => {
  if (!header) return {};

  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const separator = part.indexOf('=');
    if (separator === -1) return acc;

    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
};

/**
 * Socket.io gateway for live family updates.
 *
 * Authentication reuses the HTTP session: the handshake `session` cookie (or an
 * explicit `auth.token`, handy for tests and non-browser clients) is hashed and
 * looked up in the same session store the HTTP middleware uses. Only then is
 * the socket joined to `family:<familyId>`, which is the only room events are
 * broadcast to — a client can never subscribe to another family.
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  async handleConnection(client: Socket) {
    const session = await this.resolveSession(client);

    if (!session) {
      this.logger.warn(`Rejected unauthenticated socket ${client.id}`);
      client.emit('unauthorized', { message: 'נדרשת התחברות' });
      client.disconnect(true);
      return;
    }

    client.data.userId = session.userId;
    if (session.familyId) {
      client.data.familyId = session.familyId;
      client.join(this.roomName(session.familyId));
    }

    this.logger.log(
      `Client ${client.id} connected (family: ${session.familyId ?? 'none'})`,
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  /**
   * Lets a connected client re-sync its room, which matters after switching the
   * active family (e.g. accepting an invitation mid-session).
   */
  @SubscribeMessage('realtime:subscribe')
  async handleSubscribe(@ConnectedSocket() client: Socket, @MessageBody() body: unknown) {
    const session = await this.resolveSession(client);
    if (!session) {
      client.disconnect(true);
      return { ok: false };
    }

    const requested =
      body && typeof body === 'object' && 'familyId' in body
        ? String((body as { familyId?: unknown }).familyId ?? '')
        : '';

    const familyId = session.familyId ?? requested;
    if (!familyId) return { ok: false };

    const room = this.roomName(familyId);
    for (const joined of client.rooms) {
      if (joined.startsWith('family:') && joined !== room) client.leave(joined);
    }
    client.join(room);
    client.data.familyId = familyId;

    return { ok: true, familyId };
  }

  private async resolveSession(client: Socket): Promise<SessionData | null> {
    const authToken =
      typeof client.handshake.auth?.token === 'string'
        ? client.handshake.auth.token
        : undefined;

    const cookieToken = parseCookieHeader(client.handshake.headers.cookie).session;
    const token = authToken ?? cookieToken;
    if (!token) return null;

    const session = await sessionStore.get(hashToken(token));
    if (!session || session.expiresAt < Date.now()) return null;

    return session;
  }

  private roomName(familyId: string) {
    return `family:${familyId}`;
  }

  /** Broadcasts to every member of a family. Safe to call before boot. */
  emitToFamily(familyId: string | undefined, event: string, data: unknown) {
    if (!familyId || !this.server) return;
    this.server.to(this.roomName(familyId)).emit(event, data);
  }

  emitTaskCreated(familyId: string, task: unknown) {
    this.emitToFamily(familyId, 'task:created', task);
  }

  emitTaskUpdated(familyId: string, task: unknown) {
    this.emitToFamily(familyId, 'task:updated', task);
  }

  emitTaskDeleted(familyId: string, taskId: string) {
    this.emitToFamily(familyId, 'task:deleted', { id: taskId });
  }

  emitEventCreated(familyId: string, event: unknown) {
    this.emitToFamily(familyId, 'event:created', event);
  }

  emitEventUpdated(familyId: string, event: unknown) {
    this.emitToFamily(familyId, 'event:updated', event);
  }

  emitEventDeleted(familyId: string, eventId: string) {
    this.emitToFamily(familyId, 'event:deleted', { id: eventId });
  }

  emitExpenseCreated(familyId: string, expense: unknown) {
    this.emitToFamily(familyId, 'expense:created', expense);
  }

  emitExpenseUpdated(familyId: string, expense: unknown) {
    this.emitToFamily(familyId, 'expense:updated', expense);
  }

  emitExpenseDeleted(familyId: string, expenseId: string) {
    this.emitToFamily(familyId, 'expense:deleted', { id: expenseId });
  }

  emitBudgetCreated(familyId: string, budget: unknown) {
    this.emitToFamily(familyId, 'budget:created', budget);
  }

  emitBudgetUpdated(familyId: string, budget: unknown) {
    this.emitToFamily(familyId, 'budget:updated', budget);
  }

  emitBabyLogCreated(familyId: string, log: unknown) {
    this.emitToFamily(familyId, 'baby-log:created', log);
  }

  emitBabyLogUpdated(familyId: string, log: unknown) {
    this.emitToFamily(familyId, 'baby-log:updated', log);
  }

  emitBabyLogDeleted(familyId: string, logId: string) {
    this.emitToFamily(familyId, 'baby-log:deleted', { id: logId });
  }

  emitNotificationCreated(familyId: string, notification: unknown) {
    this.emitToFamily(familyId, 'notification:created', notification);
  }

  emitNotificationRead(familyId: string, payload: { id?: string; all?: boolean }) {
    this.emitToFamily(familyId, 'notification:read', payload);
  }
}
