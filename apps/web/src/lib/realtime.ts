import { io, type Socket } from 'socket.io-client';
import type { QueryClient } from '@tanstack/react-query';

export type RealtimeEvent =
  | 'task:created'
  | 'task:updated'
  | 'task:deleted'
  | 'event:created'
  | 'event:updated'
  | 'event:deleted'
  | 'expense:created'
  | 'expense:updated'
  | 'expense:deleted'
  | 'budget:created'
  | 'budget:updated'
  | 'baby-log:created'
  | 'baby-log:updated'
  | 'baby-log:deleted'
  | 'notification:created'
  | 'notification:read';

/** Single source of truth for every server → client realtime event name. */
export const REALTIME_EVENTS: RealtimeEvent[] = [
  'task:created',
  'task:updated',
  'task:deleted',
  'event:created',
  'event:updated',
  'event:deleted',
  'expense:created',
  'expense:updated',
  'expense:deleted',
  'budget:created',
  'budget:updated',
  'baby-log:created',
  'baby-log:updated',
  'baby-log:deleted',
  'notification:created',
  'notification:read',
];

/** react-query keys invalidated when each event arrives. */
export const REALTIME_INVALIDATIONS: Record<RealtimeEvent, string[][]> = {
  'task:created': [['tasks'], ['dashboard']],
  'task:updated': [['tasks'], ['dashboard']],
  'task:deleted': [['tasks'], ['dashboard']],
  'event:created': [['calendar'], ['dashboard']],
  'event:updated': [['calendar'], ['dashboard']],
  'event:deleted': [['calendar'], ['dashboard']],
  'expense:created': [['budget'], ['budget', 'expenses'], ['dashboard']],
  'expense:updated': [['budget'], ['budget', 'expenses'], ['dashboard']],
  'expense:deleted': [['budget'], ['budget', 'expenses'], ['dashboard']],
  'budget:created': [['budget'], ['dashboard']],
  'budget:updated': [['budget'], ['dashboard']],
  'baby-log:created': [['baby', 'logs'], ['dashboard']],
  'baby-log:updated': [['baby', 'logs'], ['dashboard']],
  'baby-log:deleted': [['baby', 'logs'], ['dashboard']],
  'notification:created': [
    ['notifications'],
    ['notifications', 'unread'],
    ['dashboard'],
  ],
  'notification:read': [
    ['notifications'],
    ['notifications', 'unread'],
    ['dashboard'],
  ],
};

/**
 * Create a socket bound to the same origin. Auth rides on the session cookie
 * (`withCredentials`), so no token handling is required on the client.
 */
export const createRealtimeSocket = (): Socket => {
  return io({
    path: '/socket.io',
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
  });
};

/**
 * Subscribe every realtime event and invalidate the matching react-query keys.
 * Returns a cleanup that removes exactly the listeners it added.
 */
export const attachRealtimeInvalidations = (
  socket: Socket,
  client: QueryClient
): (() => void) => {
  const subscriptions: Array<{ event: RealtimeEvent; handler: () => void }> = [];

  for (const event of REALTIME_EVENTS) {
    const handler = () => {
      for (const key of REALTIME_INVALIDATIONS[event]) {
        void client.invalidateQueries({ queryKey: key });
      }
    };
    socket.on(event, handler);
    subscriptions.push({ event, handler });
  }

  return () => {
    for (const { event, handler } of subscriptions) {
      socket.off(event, handler);
    }
  };
};
