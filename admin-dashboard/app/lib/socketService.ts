import { io, Socket } from 'socket.io-client';
import { WS_URL, STORAGE_KEYS } from './constants';

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (socket?.connected) {
    return socket;
  }

  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  socket = io(WS_URL, {
    auth: {
      token,
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

