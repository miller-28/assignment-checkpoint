// Ship Order Use Case
import { DeliveryService } from '../domain/services/DeliveryService';
import { TrackingService } from '../domain/services/TrackingService';
import { RabbitMQPublisher } from '../adapters/outbound/RabbitMQPublisher';
import { KafkaProducer } from '../adapters/outbound/KafkaProducer';

export class ShipOrderUseCase {
  constructor(
    private deliveryService: DeliveryService,
    private trackingService: TrackingService,
    private rabbitmqPublisher: RabbitMQPublisher,
    private kafkaProducer: KafkaProducer
  ) {}

  async execute(deliveryId: string): Promise<void> {
    // Generate tracking number
    const trackingNumber = this.trackingService.generateTrackingNumber();
    
    // Mark as shipped
    await this.deliveryService.markAsShipped(deliveryId, trackingNumber);
    
    // Get updated delivery
    const delivery = await this.deliveryService.getDeliveryById(deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found after update');
    }
    
    // Publish events
    await this.rabbitmqPublisher.publishOrderShipped(delivery);
    await this.kafkaProducer.publishEvent('OrderShipped', delivery);
  }
}
