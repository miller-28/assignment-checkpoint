// RabbitMQ Consumer for orders.created queue
// NOTE: Not used anymore - Orders are created directly in shared database by Sales API
import * as amqp from 'amqplib';
import { config } from '../../infrastructure/config';
import { OrderService } from '../../domain/services/OrderService';

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

    // Declare queue
    await this.channel.assertQueue('orders.created', { durable: true });
    
    // Set prefetch to process one message at a time
    this.channel.prefetch(1);

    // Consume messages
    await this.channel.consume('orders.created', async (msg: any) => {
      if (msg) {
        await this.handleMessage(msg);
      }
    });

    console.log('RabbitMQ consumer started - listening for orders.created');
  }

  private async handleMessage(msg: any): Promise<void> {
    try {
      const orderData = JSON.parse(msg.content.toString());
      console.log(`Received order: ${orderData.order_id}`);
      
      // Note: Not used anymore - orders exist directly in shared database
      // No need to create separate records
      
      this.channel.ack(msg);
      console.log(`Acknowledged order ${orderData.order_id}`);
    } catch (error) {
      console.error('Error processing order message:', error);
      // Requeue the message
      this.channel.nack(msg, false, true);
    }
  }

  async stop(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
