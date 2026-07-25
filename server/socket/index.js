const { Server } = require('socket.io');
const jwtUtil = require('../utils/jwt.util');
const logger = require('../config/logger');

let ioInstance = null;

const initSocketIO = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket Auth Middleware
  ioInstance.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = jwtUtil.verifyToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      logger.error(`Socket authentication failed: ${err.message}`);
      next(new Error('Authentication failed'));
    }
  });

  ioInstance.on('connection', (socket) => {
    logger.info(`Socket client connected: ${socket.id} (User: ${socket.user.email})`);

    // Join Booking Room
    socket.on('join-room', ({ bookingId }) => {
      const roomName = `booking-room-${bookingId}`;
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined ${roomName}`);
    });

    // Leave Room
    socket.on('leave-room', ({ bookingId }) => {
      const roomName = `booking-room-${bookingId}`;
      socket.leave(roomName);
      logger.info(`Socket ${socket.id} left ${roomName}`);
    });

    // Typing Indicators
    socket.on('typing-start', ({ bookingId }) => {
      socket.to(`booking-room-${bookingId}`).emit('typing-start', {
        userId: socket.user.id,
        userName: socket.user.email
      });
    });

    socket.on('typing-stop', ({ bookingId }) => {
      socket.to(`booking-room-${bookingId}`).emit('typing-stop', {
        userId: socket.user.id
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized');
  }
  return ioInstance;
};

module.exports = {
  initSocketIO,
  getIO
};
