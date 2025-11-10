require('dotenv').config();
const express = require('express');
const ExpressWs = require('express-ws');
const twilio = require('twilio');
const { handleIncomingCall, handleMediaStream } = require('./services/twilioHandler');
const statusRoutes = require('./routes/status');
const logger = require('./utils/logger');

const app = express();
const expressWs = ExpressWs(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio webhook signature verification (security)
const twilioAuthMiddleware = (req, res, next) => {
  const twilioSignature = req.headers['x-twilio-signature'];
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  
  // Skip validation in development or if explicitly disabled
  if (process.env.NODE_ENV === 'development' && !process.env.VALIDATE_TWILIO_SIGNATURE) {
    return next();
  }
  
  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    twilioSignature,
    url,
    req.body
  );
  
  if (!isValid) {
    logger.warn('Invalid Twilio signature detected');
    return res.status(403).send('Forbidden');
  }
  
  next();
};

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Status and monitoring routes
app.use('/api', statusRoutes);

// Twilio Voice Webhook - Initial call handling
app.post('/voice/incoming', twilioAuthMiddleware, handleIncomingCall);

// WebSocket endpoint for Twilio Media Streams
app.ws('/voice/stream', (ws, req) => {
  logger.info('New WebSocket connection established');
  handleMediaStream(ws, req);
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all interfaces for Railway

const server = app.listen(PORT, HOST, () => {
  logger.info(`🚀 AI Voice Agent server running on ${HOST}:${PORT}`);
  logger.info(`📞 Webhook URL: ${req => req.protocol}://${req => req.get('host')}/voice/incoming`);
  logger.info(`🔌 WebSocket URL: ws://${req => req.get('host')}/voice/stream`);
  logger.info(`🤖 AI Service: ${process.env.AI_SERVICE || 'gemini'}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'production'}`);
}).on('error', (err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
