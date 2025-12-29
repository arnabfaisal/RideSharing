import { io as Client } from 'socket.io-client';

// change the URL if your backend runs elsewhere
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const socket = Client(BACKEND_URL, { autoConnect: true });

export default socket;

export function joinGroup(groupId) {
  if (!groupId) return;
  socket.emit('joinGroup', { groupId });
}

export function leaveGroup(groupId) {
  if (!groupId) return;
  socket.emit('leaveGroup', { groupId });
}

export function joinBooking(bookingId) {
  if (!bookingId) return;
  socket.emit('joinBooking', { bookingId });
}

export function leaveBooking(bookingId) {
  if (!bookingId) return;
  socket.emit('leaveBooking', { bookingId });
}
