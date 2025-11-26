// Deliver Order Use Case
import { OrderService } from '../domain/services/OrderService';
import { RabbitMQPublisher } from '../adapters/outbound/RabbitMQPublisher';
import { KafkaProducer } from '../adapters/outbound/KafkaProducer';

export class DeliverOrderUseCase {
  constructor(
    private orderService: OrderService,
    private rabbitmqPublisher: RabbitMQPublisher,
    private kafkaProducer: KafkaProducer
  ) {}

  async execute(orderId: string): Promise<void> {
    // Mark as delivered
    await this.orderService.markAsDelivered(orderId);
    
    // Get updated order
    const order = await this.orderService.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found after update');
    }
    
    // Publish events
    await this.rabbitmqPublisher.publishOrderDelivered(order);
    await this.kafkaProducer.publishEvent('OrderDelivered', order);
  }
}
