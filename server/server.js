/**
 * server.js — Entry point
 * Starts HTTP server and initialises all services
 */
require('dotenv').config();
require('express-async-errors');

const http    = require('http');
const app     = require('./app');
const { connectDB }       = require('./config/db');
const { initFirebase }    = require('./config/firebase');
const logger  = require('./utils/logger');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Connect to MySQL
    await connectDB();
    logger.info('✅ MySQL connected');

    // 2. Initialise Firebase Admin
    initFirebase();
    logger.info('✅ Firebase Admin initialised');

    // 3. Start HTTP server
    const server = http.createServer(app);
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
