'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const issuesRouter = require('./routes/issues');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting: general API reads (100 req / 15 min per IP)
const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Rate limiting: write operations (30 req / 15 min per IP)
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes – apply write limiter to mutating endpoints
app.post('/api/issues', writeLimiter);
app.patch('/api/issues/:id/status', writeLimiter);
app.use('/api/issues', readLimiter, issuesRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Smart City Issue Reporter' });
});

// Rate limiting: static file fallback (200 req / 15 min per IP)
const staticLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});

// Fallback: serve the frontend for any unknown route
app.get('/{*path}', staticLimiter, (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
