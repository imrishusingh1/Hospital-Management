import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

let socket = null;

export const getSocket = () => socket;

export const initSocket = (token) => {
  if (socket && socket.connected) return socket;
  socket = io(BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
