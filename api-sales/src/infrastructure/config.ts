// Environment config for Sales API
export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
  rabbitmqUrl: process.env.RABBITMQ_URL,
  kafkaBrokers: process.env.KAFKA_BROKERS?.split(','),
  jwtSecret: process.env.JWT_SECRET,
};
