require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./views/authRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());

// API mount
app.use('/api/auth', authRoutes);

// basic root
app.get('/', (req, res) => res.json({ success: true, message: 'RideSharing API' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
