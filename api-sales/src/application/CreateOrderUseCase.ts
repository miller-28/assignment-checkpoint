// Create Order Use Case
import { Order } from '../domain/entities/Order';
import { IOrderRepository } from '../domain/repositories/IOrderRepository';
import { OrderService } from '../domain/services/OrderService';
import { ProductServiceClient } from '../adapters/outbound/ProductServiceClient';
import { RabbitMQPublisher } from '../adapters/outbound/RabbitMQPublisher';
import { KafkaProducer } from '../adapters/outbound/KafkaProducer';

export class CreateOrderUseCase {
  constructor(
    private orderService: OrderService,
    private productService: ProductServiceClient,
    private rabbitmqPublisher: RabbitMQPublisher,
    private kafkaProducer: KafkaProducer
  ) {}

  async execute(data: Partial<Order>): Promise<Order> {
    // Check product availability
    const isAvailable = await this.productService.checkAvailability(
      data.product_id!, 
      data.quantity || 1
    );
    if (!isAvailable) {
      throw new Error('Product not available or insufficient quantity');
    }

    // Create order
    const order = await this.orderService.createOrder(data);

    // Publish events
    await this.rabbitmqPublisher.publishOrderCreated(order);
    await this.kafkaProducer.publishEvent('OrderCreated', order);

    return order;
  }
}
