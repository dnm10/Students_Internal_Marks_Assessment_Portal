/**
 * server.js — Entry point
 * Starts HTTP server and initialises all services
 */
require('dotenv').config();
require('express-async-errors');
const { getParameter } = require('./ssm');
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initFirebase } = require('./config/firebase');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Load secrets from SSM
    const secrets = await loadSecrets();

    // 2. Connect to MySQL using SSM secrets
    await connectDB({
      host: secrets.dbHost,
      user: secrets.dbUser,
      password: secrets.dbPassword,
      database: secrets.dbName
    });

    logger.info('✅ MySQL connected');

    // 2. Initialise Firebase Admin
    initFirebase();
    logger.info('✅ Firebase Admin initialised');

    // 3. Start HTTP server
    const server = http.createServer(app);
    server.listen(PORT, "0.0.0.0", () => {
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
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

async function loadSecrets() {
  const dbPassword = await getParameter("/student-portal/db-password");
  const dbHost = await getParameter("/student-portal/db-host");
  const dbUser = await getParameter("/student-portal/db-user");
  const dbName = await getParameter("/student-portal/db-name");
  const jwtSecret = await getParameter("/student-portal/jwt-secret");

  return {
    dbPassword,
    dbHost,
    dbUser,
    dbName,
    jwtSecret
  };
}

startServer();