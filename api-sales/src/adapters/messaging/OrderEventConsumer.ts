// RabbitMQ Consumer for order status events
import * as amqp from 'amqplib';
import { config } from '../../infrastructure/config';
import { OrderService } from '../../domain/services/OrderService';
import { OrderStatus } from '../../domain/entities/Order';

export class OrderEventConsumer {
  private connection: any = null;
  private channel: any = null;

  constructor(private orderService: OrderService) {}

  async start(): Promise<void> {
    if (!config.rabbitmqUrl) {
      throw new Error('RABBITMQ_URL not configured');
    }
    this.connection = await amqp.connect(config.rabbitmqUrl);
    this.channel = await this.connection.createChannel();

    // Declare queues
    await this.channel.assertQueue('orders.shipped', { durable: true });
    await this.channel.assertQueue('orders.delivered', { durable: true });

    // Consume shipped events
    await this.channel.consume('orders.shipped', async (msg: any) => {
      if (msg) {
        await this.handleMessage(msg, 'Shipped');
      }
    });

    // Consume delivered events
    await this.channel.consume('orders.delivered', async (msg: any) => {
      if (msg) {
        await this.handleMessage(msg, 'Delivered');
      }
    });

    console.log('RabbitMQ consumer started');
  }

  private async handleMessage(msg: any, status: OrderStatus): Promise<void> {
    try {
      const event = JSON.parse(msg.content.toString());
      await this.orderService.updateOrderStatus(event.order_id, status);
      this.channel.ack(msg);
      console.log(`Order ${event.order_id} updated to ${status}`);
    } catch (error) {
      console.error('Error processing message:', error);
      this.channel.nack(msg, false, true); // Requeue
    }
  }

  async stop(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
