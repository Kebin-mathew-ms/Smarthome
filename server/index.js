require('dotenv').config();

const http = require('http');
const app = require('./app');
const logger = require('./config/logger');
const { initSocketIO } = require('./socket');

const { runMigrations } = require('./database/migrate');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO Engine
initSocketIO(server);

server.listen(PORT, async () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`Socket.IO real-time engine initialized`);

  // Auto-run pending database migrations on startup
  try {
    await runMigrations();
    logger.info('Auto-migration check completed on startup.');
  } catch (migErr) {
    logger.error(`Auto-migration check failed: ${migErr.message}`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection Error: ${err.message}`);
  // Keep server running in development
});

