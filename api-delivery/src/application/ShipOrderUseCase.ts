// Ship Order Use Case
import { OrderService } from '../domain/services/OrderService';
import { TrackingService } from '../domain/services/TrackingService';
import { RabbitMQPublisher } from '../adapters/outbound/RabbitMQPublisher';
import { KafkaProducer } from '../adapters/outbound/KafkaProducer';

export class ShipOrderUseCase {
  constructor(
    private orderService: OrderService,
    private trackingService: TrackingService,
    private rabbitmqPublisher: RabbitMQPublisher,
    private kafkaProducer: KafkaProducer
  ) {}

  async execute(orderId: string): Promise<void> {
    // Generate tracking number
    const trackingNumber = this.trackingService.generateTrackingNumber();
    
    // Mark as shipped
    await this.orderService.markAsShipped(orderId, trackingNumber);
    
    // Get updated order
    const order = await this.orderService.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found after update');
    }
    
    // Publish events
    await this.rabbitmqPublisher.publishOrderShipped(order);
    await this.kafkaProducer.publishEvent('OrderShipped', order);
  }
}
