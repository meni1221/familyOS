import { useEffect, useState } from 'react';
import { queryClient } from '../lib/queryClient';
import {
  attachRealtimeInvalidations,
  createRealtimeSocket,
} from '../lib/realtime';
import { useAuth } from './useAuth';

/**
 * Owns the realtime socket lifecycle for the whole app.
 *
 * The socket is only opened while the user is authenticated; on logout (or
 * unmount) every listener is removed and the connection is closed.
 */
export const useRealtimeConnection = (): { connected: boolean } => {
  const { isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setConnected(false);
      return;
    }

    const socket = createRealtimeSocket();
    const detach = attachRealtimeInvalidations(socket, queryClient);

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleConnectError = (error: Error) => {
      // Never crash the UI on a failed handshake — just surface it in the console.
      console.warn('[realtime] connect_error:', error.message);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      detach();
      socket.disconnect();
      setConnected(false);
    };
  }, [isAuthenticated]);

  return { connected };
};
