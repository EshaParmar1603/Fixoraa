
const { PrismaClient } = require('@prisma/client');
const env = require('./env');
const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});
prisma.$connect()
  .then(() => {
    console.log('Connected to PostgreSQL via Prisma');
  })
  .catch((err) => {
    console.error('Failed to connect to PostgreSQL database:', err.message);
  });
module.exports = prisma;