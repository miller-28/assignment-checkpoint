// Fastify Server Setup
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';

// Domain
import { OrderService } from '../domain/services/OrderService';
import { TrackingService } from '../domain/services/TrackingService';

// Repositories
import { PostgresOrderRepository } from '../adapters/outbound/PostgresOrderRepository';

// Messaging
import { RabbitMQPublisher } from '../adapters/outbound/RabbitMQPublisher';
import { KafkaProducer } from '../adapters/outbound/KafkaProducer';
import { OrderEventConsumer } from '../adapters/messaging/OrderEventConsumer';

// Controllers
import { OrderController } from '../adapters/inbound/OrderController';
import { HealthController } from '../adapters/inbound/HealthController';

// Use Cases
import { ShipOrderUseCase } from '../application/ShipOrderUseCase';
import { DeliverOrderUseCase } from '../application/DeliverOrderUseCase';

export async function createServer() {
  const app = Fastify({
    logger: {
      level: config.logLevel,
    },
  });

  // Register CORS
  await app.register(cors, {
    origin: true,
  });

  // Initialize dependencies
  const orderRepository = new PostgresOrderRepository();
  const orderService = new OrderService(orderRepository);
  const trackingService = new TrackingService();
  
  const rabbitmqPublisher = new RabbitMQPublisher();
  const kafkaProducer = new KafkaProducer();
  
  // Connect messaging
  await rabbitmqPublisher.connect();
  await kafkaProducer.connect();
  
  // Use cases
  const shipOrderUseCase = new ShipOrderUseCase(
    orderService,
    trackingService,
    rabbitmqPublisher,
    kafkaProducer
  );
  
  const deliverOrderUseCase = new DeliverOrderUseCase(
    orderService,
    rabbitmqPublisher,
    kafkaProducer
  );
  
  // Controllers
  const orderController = new OrderController(orderService, shipOrderUseCase, deliverOrderUseCase);
  const healthController = new HealthController();
  
  // Register routes
  orderController.registerRoutes(app);
  healthController.registerRoutes(app);
  
  // Note: RabbitMQ consumer not needed - Sales API creates orders directly in DB
  // const orderConsumer = new OrderEventConsumer(orderService);
  // await orderConsumer.start();
  
  // Graceful shutdown
  const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    // await orderConsumer.stop(); // Not using consumer anymore
    await rabbitmqPublisher.close();
    await kafkaProducer.disconnect();
    await app.close();
    process.exit(0);
  };
  
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  return app;
}
