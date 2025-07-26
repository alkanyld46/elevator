// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());

// ← INSERT THIS HEALTH‑CHECK:
app.get('/', (req, res) => {
    res.send('OK')
})

// Allow only your frontend’s origin (replace with your actual URL):
app.use(
    cors({
        origin: 'https://elevatorfrontend.onrender.com',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
)

// Enable CORS pre‑flight for all routes
app.options(/.*/, cors())

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes (you’ll create these next)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/elevators', require('./routes/elevatorRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
