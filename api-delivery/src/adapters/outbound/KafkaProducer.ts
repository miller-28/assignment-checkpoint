// Kafka Producer for delivery events
import { Kafka, Producer } from 'kafkajs';
import { config } from '../../infrastructure/config';
import { Delivery } from '../../domain/entities/Delivery';

export class KafkaProducer {
  private kafka: Kafka;
  private producer: Producer;
  private connected: boolean = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'delivery-api',
      brokers: config.kafkaBrokers,
    });
    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
      console.log('Kafka producer connected');
    }
  }

  async publishEvent(eventType: string, delivery: Delivery): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    const message = {
      event_type: eventType,
      delivery_id: delivery.delivery_id,
      order_id: delivery.order_id,
      status: delivery.status,
      tracking_number: delivery.tracking_number,
      timestamp: new Date().toISOString(),
    };

    await this.producer.send({
      topic: 'order-events',
      messages: [{
        key: delivery.order_id,
        value: JSON.stringify(message),
      }],
    });

    console.log(`Published ${eventType} event to Kafka for order ${delivery.order_id}`);
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;
    }
  }
}
