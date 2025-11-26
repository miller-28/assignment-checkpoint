// Kafka Producer
import { Kafka, Producer } from 'kafkajs';
import { config } from '../../infrastructure/config';

export class KafkaProducer {
  private kafka: Kafka;
  private producer: Producer;
  private connected = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'sales-api',
      brokers: config.kafkaBrokers || ['localhost:9092'],
    });
    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    if (!this.connected) {
      await this.producer.connect();
      this.connected = true;
    }
  }

  async publishEvent(eventType: string, data: any): Promise<void> {
    if (!this.connected) {
      await this.connect();
    }
    await this.producer.send({
      topic: 'order-events',
      messages: [
        {
          key: data.order_id,
          value: JSON.stringify({
            event_type: eventType,
            timestamp: new Date().toISOString(),
            data,
          }),
        },
      ],
    });
  }

  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.producer.disconnect();
      this.connected = false;
    }
  }
}
