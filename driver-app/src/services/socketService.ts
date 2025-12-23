import { io, Socket } from 'socket.io-client';
import { STORAGE_KEYS, WS_BASE_URL } from '../constants';
import secureStorage from '../utils/secureStorage';

let socket: Socket | null = null;

export const initializeSocket = async (): Promise<Socket> => {
  if (socket?.connected) {
    return socket;
  }

  const token = await secureStorage.getToken();

  socket = io(WS_BASE_URL, {
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

