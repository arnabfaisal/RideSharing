require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const tripRoutes = require('./routes/tripRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/r1', bookingRoutes);
app.use('/api/trips', tripRoutes);

app.get('/', (req, res) =>
  res.json({ success: true, message: 'RideSharing API' })
);

// create HTTP server and attach Socket.IO
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*', methods: ['GET','POST'] } });

// simple socket handling: clients can join group rooms
io.on('connection', (socket) => {
  socket.on('joinGroup', ({ groupId } = {}) => {
    if (groupId) socket.join(`group_${groupId}`);
  });
  socket.on('leaveGroup', ({ groupId } = {}) => {
    if (groupId) socket.leave(`group_${groupId}`);
  });
  socket.on('joinBooking', ({ bookingId } = {}) => {
    if (bookingId) socket.join(`booking_${bookingId}`);
  });
  socket.on('leaveBooking', ({ bookingId } = {}) => {
    if (bookingId) socket.leave(`booking_${bookingId}`);
  });
});

// expose io via app so controllers can emit
app.set('io', io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
