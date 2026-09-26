const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fixora_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'fixora_fallback_jwt_secret_dev_mode',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  SOCKET_PORT: parseInt(process.env.SOCKET_PORT, 10) || 5000
};
module.exports = env;