// Entry point
import { createServer } from './infrastructure/server';
import { config } from './infrastructure/config';

async function main() {
  try {
    const app = await createServer();
    
    await app.listen({
      port: config.port,
      host: '0.0.0.0',
    });
    
    console.log(`Order Management API running on port ${config.port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
