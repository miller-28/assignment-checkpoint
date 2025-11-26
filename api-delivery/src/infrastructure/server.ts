// Fastify Server Setup
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';

// Domain
import { DeliveryService } from '../domain/services/DeliveryService';
import { TrackingService } from '../domain/services/TrackingService';

// Repositories
import { PostgresDeliveryRepository } from '../adapters/outbound/PostgresDeliveryRepository';

// Messaging
import { RabbitMQPublisher } from '../adapters/outbound/RabbitMQPublisher';
import { KafkaProducer } from '../adapters/outbound/KafkaProducer';
import { OrderEventConsumer } from '../adapters/messaging/OrderEventConsumer';

// Controllers
import { DeliveryController } from '../adapters/inbound/DeliveryController';
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
  const deliveryRepository = new PostgresDeliveryRepository();
  const deliveryService = new DeliveryService(deliveryRepository);
  const trackingService = new TrackingService();
  
  const rabbitmqPublisher = new RabbitMQPublisher();
  const kafkaProducer = new KafkaProducer();
  
  // Connect messaging
  await rabbitmqPublisher.connect();
  await kafkaProducer.connect();
  
  // Use cases
  const shipOrderUseCase = new ShipOrderUseCase(
    deliveryService,
    trackingService,
    rabbitmqPublisher,
    kafkaProducer
  );
  
  const deliverOrderUseCase = new DeliverOrderUseCase(
    deliveryService,
    rabbitmqPublisher,
    kafkaProducer
  );
  
  // Controllers
  const deliveryController = new DeliveryController(deliveryService, shipOrderUseCase, deliverOrderUseCase);
  const healthController = new HealthController();
  
  // Register routes
  deliveryController.registerRoutes(app);
  healthController.registerRoutes(app);
  
  // Start RabbitMQ consumer
  const orderConsumer = new OrderEventConsumer(deliveryService);
  await orderConsumer.start();
  
  // Graceful shutdown
  const gracefulShutdown = async () => {
    console.log('Shutting down gracefully...');
    await orderConsumer.stop();
    await rabbitmqPublisher.close();
    await kafkaProducer.disconnect();
    await app.close();
    process.exit(0);
  };
  
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  return app;
}
