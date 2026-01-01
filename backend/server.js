require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const tripRoutes = require('./routes/tripRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// JSON parse error handler: log payload and respond 400 for invalid JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Invalid JSON received:', err.body || err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
  }
  next(err);
});

app.use('/api/auth', authRoutes);
app.use('/api/r1', bookingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/appeals', require('./routes/appealRoutes'));

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


