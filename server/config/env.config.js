const logger = require('./logger');

const requiredEnvVars = [
  'PORT',
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET'
];

const validateEnv = () => {
  const missing = [];
  requiredEnvVars.forEach(key => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    logger.warn(`Missing required environment variables: ${missing.join(', ')}. Using production defaults where applicable.`);
  } else {
    logger.info(`Environment variables validated successfully.`);
  }
};

module.exports = {
  validateEnv
};
