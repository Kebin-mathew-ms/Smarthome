const logger = require('../config/logger');

const failedAttemptsMap = new Map();
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes lockout

const bruteForceProtection = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `login_${ip}`;

  const record = failedAttemptsMap.get(key);

  if (record) {
    if (record.attempts >= MAX_ATTEMPTS) {
      const timePassed = Date.now() - record.lastAttempt;
      if (timePassed < LOCK_TIME_MS) {
        const remainingMins = Math.ceil((LOCK_TIME_MS - timePassed) / 60000);
        logger.warn(`Brute force attempt blocked for IP ${ip}`);
        return res.status(429).json({
          success: false,
          message: `Too many failed login attempts. Account temporarily locked. Try again in ${remainingMins} minutes.`
        });
      } else {
        // Reset after lock period expires
        failedAttemptsMap.delete(key);
      }
    }
  }
  next();
};

const recordFailedLogin = (ip) => {
  const key = `login_${ip}`;
  const record = failedAttemptsMap.get(key) || { attempts: 0, lastAttempt: Date.now() };
  record.attempts += 1;
  record.lastAttempt = Date.now();
  failedAttemptsMap.set(key, record);
};

const recordSuccessfulLogin = (ip) => {
  const key = `login_${ip}`;
  failedAttemptsMap.delete(key);
};

module.exports = {
  bruteForceProtection,
  recordFailedLogin,
  recordSuccessfulLogin
};
