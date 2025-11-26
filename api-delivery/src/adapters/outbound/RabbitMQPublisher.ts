// RabbitMQ Publisher for order status updates
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
    await this.channel.assertQueue('orders.shipped', { durable: true });
    await this.channel.assertQueue('orders.delivered', { durable: true });
  }

  async publishOrderShipped(order: Order): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }
    const message = JSON.stringify({
      order_id: order.order_id,
      status: 'Shipped',
      tracking_number: order.tracking_number,
      shipped_at: order.shipped_at,
    });
    this.channel.sendToQueue('orders.shipped', Buffer.from(message), {
      persistent: true,
    });
    console.log(`Published OrderShipped event for order ${order.order_id}`);
  }

  async publishOrderDelivered(order: Order): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }
    const message = JSON.stringify({
      order_id: order.order_id,
      status: 'Delivered',
      delivered_at: order.delivered_at,
    });
    this.channel.sendToQueue('orders.delivered', Buffer.from(message), {
      persistent: true,
    });
    console.log(`Published OrderDelivered event for order ${order.order_id}`);
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
