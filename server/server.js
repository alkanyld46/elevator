// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Mount routes (you’ll create these next)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/elevators', require('./routes/elevatorRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
