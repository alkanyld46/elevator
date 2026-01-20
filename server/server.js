// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
connectDB();

// CORS configuration - supports both local dev and production
const allowedOrigins = [
    'http://localhost:3000',
    'https://elevatorfrontend.onrender.com'
];

// Add any origins from environment variable
if (process.env.CORS_ORIGINS) {
    process.env.CORS_ORIGINS.split(',').forEach(origin => {
        if (!allowedOrigins.includes(origin.trim())) {
            allowedOrigins.push(origin.trim());
        }
    });
}

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Health check endpoint
app.get('/', (req, res) => {
    res.send('OK')
})

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/elevators', require('./routes/elevatorRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
