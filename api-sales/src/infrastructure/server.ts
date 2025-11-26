// Fastify server setup
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PostgresOrderRepository } from '../adapters/outbound/PostgresOrderRepository';
import { ProductServiceClient } from '../adapters/outbound/ProductServiceClient';
import { RabbitMQPublisher } from '../adapters/outbound/RabbitMQPublisher';
import { KafkaProducer } from '../adapters/outbound/KafkaProducer';
import { OrderService } from '../domain/services/OrderService';
import { CreateOrderUseCase } from '../application/CreateOrderUseCase';
import { UpdateOrderStatusUseCase } from '../application/UpdateOrderStatusUseCase';
import { OrderController } from '../adapters/inbound/OrderController';
import { HealthController } from '../adapters/inbound/HealthController';
import { OrderEventConsumer } from '../adapters/messaging/OrderEventConsumer';

export async function startServer() {
  const app = Fastify({ logger: true });
  await app.register(cors);

  // Initialize dependencies
  const orderRepository = new PostgresOrderRepository();
  const productService = new ProductServiceClient();
  const rabbitmqPublisher = new RabbitMQPublisher();
  const kafkaProducer = new KafkaProducer();
  
  // Connect to message brokers
  await rabbitmqPublisher.connect();
  await kafkaProducer.connect();

  // Services and use cases
  const orderService = new OrderService(orderRepository);
  const createOrderUseCase = new CreateOrderUseCase(
    orderService,
    productService,
    rabbitmqPublisher,
    kafkaProducer
  );
  const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
    orderService,
    kafkaProducer
  );

  // Controllers
  const orderController = new OrderController(createOrderUseCase, orderRepository);
  const healthController = new HealthController();

  // Register routes
  orderController.registerRoutes(app);
  healthController.registerRoutes(app);

  // Start consumer for status updates
  const consumer = new OrderEventConsumer(orderService);
  await consumer.start();

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`Sales API running on port ${port}`);
}
