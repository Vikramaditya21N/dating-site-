import { io } from 'socket.io-client';
import { API_BASE_URL } from './Config';

// Ensure the connection uses the centralized live URL
export const socket = io(API_BASE_URL, {
  autoConnect: false,
  // Adding transports ensures better compatibility with Render's free tier
  transports: ['websocket', 'polling'], 
  withCredentials: true
});