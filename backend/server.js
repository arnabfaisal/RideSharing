require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDB = require('./config/db');

// arnab routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// ######### end of arnab routes #########


const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

// Arnab api mounts
app.use('/api/auth', authRoutes);
app.use('/api/r1', bookingRoutes);

// basic root
app.get('/', (req, res) => res.json({ success: true, message: 'RideSharing API' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
