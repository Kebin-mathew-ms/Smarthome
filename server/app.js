require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const { validateEnv } = require('./config/env.config');
const inputSanitizer = require('./middlewares/sanitize.middleware');
const errorHandler = require('./middlewares/error.middleware');
const apiRoutes = require('./routes');
const logger = require('./config/logger');

// Validate environment variables on startup
validateEnv();

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// HTTP Request Logger
app.use(morgan('combined', { stream: logger.stream }));

// Body Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Input Sanitizer against XSS
app.use(inputSanitizer);

// Static Files Serving for Uploads
const uploadPath = process.env.UPLOAD_PATH || 'uploads';
app.use('/uploads', express.static(path.join(__dirname, uploadPath)));

// API Routes
app.use('/api', apiRoutes);

// Root Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Home Care Enterprise SaaS API is running',
    version: '1.0.0'
  });
});

// 404 Handler
app.use((req, res, next) => {
  const error = new Error(`Resource not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
