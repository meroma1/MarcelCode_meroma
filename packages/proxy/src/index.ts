import { createApp } from './app';
import { env, logger, disconnectPrisma, disconnectRedis } from './config';

// Verify API key is loaded at startup
const apiKeyPrefix = env.ANTHROPIC_API_KEY?.substring(0, 20) || 'MISSING';
const apiKeyLength = env.ANTHROPIC_API_KEY?.length || 0;
const isValidKey = env.ANTHROPIC_API_KEY 
  && env.ANTHROPIC_API_KEY !== 'sk-ant-your-api-key-here' 
  && env.ANTHROPIC_API_KEY.length >= 20
  && env.ANTHROPIC_API_KEY.startsWith('sk-ant-api03-');

logger.info({ 
  apiKeyPrefix: apiKeyPrefix + '...',
  apiKeyLength,
  isValidKey,
}, 'API Key status at startup');

if (!isValidKey) {
  logger.error('ANTHROPIC_API_KEY is missing or invalid. Chat functionality will not work.');
}

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Marcel'IA Proxy running on port ${env.PORT} [${env.NODE_ENV}]`);
});

async function shutdown() {
  logger.info('Shutting down gracefully...');
  server.close(async () => {
    await disconnectPrisma();
    await disconnectRedis();
    logger.info('Server stopped');
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
