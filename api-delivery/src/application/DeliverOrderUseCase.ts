// Deliver Order Use Case
import { DeliveryService } from '../domain/services/DeliveryService';
import { RabbitMQPublisher } from '../adapters/outbound/RabbitMQPublisher';
import { KafkaProducer } from '../adapters/outbound/KafkaProducer';

export class DeliverOrderUseCase {
  constructor(
    private deliveryService: DeliveryService,
    private rabbitmqPublisher: RabbitMQPublisher,
    private kafkaProducer: KafkaProducer
  ) {}

  async execute(deliveryId: string): Promise<void> {
    // Mark as delivered
    await this.deliveryService.markAsDelivered(deliveryId);
    
    // Get updated delivery
    const delivery = await this.deliveryService.getDeliveryById(deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found after update');
    }
    
    // Publish events
    await this.rabbitmqPublisher.publishOrderDelivered(delivery);
    await this.kafkaProducer.publishEvent('OrderDelivered', delivery);
  }
}
