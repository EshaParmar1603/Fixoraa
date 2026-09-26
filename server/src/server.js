const http = require('http');
const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');
const { initSocketIO } = require('./sockets/socketHandler');
const server = http.createServer(app);
// Initialize Socket.IO with HTTP server
initSocketIO(server, env.CLIENT_URL);
// Start HTTP & WebSocket Server
server.listen(env.PORT, () => {
  console.log(`=========================================`);
  console.log(`  Fixora API Server & Socket.IO Running   `);
  console.log(`  Environment : ${env.NODE_ENV}           `);
  console.log(`  HTTP Port   : ${env.PORT}               `);
  console.log(`  Health Check: http://localhost:${env.PORT}/api/health`);
  console.log(`=========================================`);
});
// Graceful Shutdown
const handleGracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP & Socket.IO servers closed.');
    await prisma.$disconnect();
    console.log('PostgreSQL database disconnected.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forceful shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));