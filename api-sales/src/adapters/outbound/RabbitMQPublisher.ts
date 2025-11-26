// RabbitMQ Publisher
import * as amqp from 'amqplib';
import { config } from '../../infrastructure/config';
import { Order } from '../../domain/entities/Order';

export class RabbitMQPublisher {
  private connection: any = null;
  private channel: any = null;

  async connect(): Promise<void> {
    if (!config.rabbitmqUrl) {
      throw new Error('RABBITMQ_URL not configured');
    }
    this.connection = await amqp.connect(config.rabbitmqUrl);
    this.channel = await this.connection.createChannel();
    
    // Declare queues
    await this.channel.assertQueue('orders.created', { durable: true });
    await this.channel.assertQueue('orders.created.dlq', { durable: true });
  }

  async publishOrderCreated(order: Order): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }
    const message = JSON.stringify({
      order_id: order.order_id,
      user_id: order.user_id,
      product_id: order.product_id,
      quantity: order.quantity,
      status: order.status,
      created_at: order.created_at,
    });
    this.channel.sendToQueue('orders.created', Buffer.from(message), {
      persistent: true,
    });
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
