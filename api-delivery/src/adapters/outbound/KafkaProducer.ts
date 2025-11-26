// Kafka Producer for order events
import { Kafka, Producer } from 'kafkajs';
import { config } from '../../infrastructure/config';
import { Order } from '../../domain/entities/Order';

export class KafkaProducer {
  private kafka: Kafka;
  private producer: Producer;
  private connected: boolean = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'order-api',
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

  async publishEvent(eventType: string, order: Order): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }

    const message = {
      event_type: eventType,
      order_id: order.order_id,
      status: order.status,
      tracking_number: order.tracking_number,
      timestamp: new Date().toISOString(),
    };

    await this.producer.send({
      topic: 'order-events',
      messages: [{
        key: order.order_id,
        value: JSON.stringify(message),
      }],
    });

    console.log(`Published ${eventType} event to Kafka for order ${order.order_id}`);
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;
    }
  }
}
