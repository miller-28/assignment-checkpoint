// Environment Configuration
export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ecommerce_db',
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  kafkaBrokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  apiVersion: process.env.API_VERSION || 'v1',
  logLevel: process.env.LOG_LEVEL || 'info',
};
