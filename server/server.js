// server/server.js

// Load environment variables based on NODE_ENV
const path = require('path');
const envFile = process.env.NODE_ENV === 'production' 
    ? '.env' 
    : '.env.development';

require('dotenv').config({ path: path.join(__dirname, envFile) });

// Fallback to .env if specific env file doesn't exist
if (!process.env.MONGO_URI) {
    require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// Log current environment
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Loading config from: ${envFile}`);

connectDB();

// Security: Add Helmet for HTTP security headers
app.use(helmet());

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
            console.warn('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Rate limiting for auth endpoints (prevent brute force attacks)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { msg: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// General rate limiter for API
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per minute
    message: { msg: 'Too many requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Health check endpoint (before rate limiting)
app.get('/', (req, res) => {
    res.send('OK')
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body parser with size limit (prevents large payload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/elevators', require('./routes/elevatorRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ msg: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
