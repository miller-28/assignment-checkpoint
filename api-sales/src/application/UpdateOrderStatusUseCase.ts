// Update Order Status Use Case
import { OrderStatus } from '../domain/entities/Order';
import { OrderService } from '../domain/services/OrderService';
import { KafkaProducer } from '../adapters/outbound/KafkaProducer';

export class UpdateOrderStatusUseCase {
  constructor(
    private orderService: OrderService,
    private kafkaProducer: KafkaProducer
  ) {}

  async execute(orderId: string, status: OrderStatus): Promise<void> {
    await this.orderService.updateOrderStatus(orderId, status);
    await this.kafkaProducer.publishEvent('OrderStatusUpdated', { orderId, status });
  }
}
