// RabbitMQ Consumer for orders.created queue
import * as amqp from 'amqplib';
import { config } from '../../infrastructure/config';
import { DeliveryService } from '../../domain/services/DeliveryService';

export class OrderEventConsumer {
  private connection: any = null;
  private channel: any = null;

  constructor(private deliveryService: DeliveryService) {}

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
      
      // Create delivery from order
      await this.deliveryService.createDelivery({
        order_id: orderData.order_id,
        user_id: orderData.user_id,
        product_id: orderData.product_id,
        quantity: orderData.quantity,
      });
      
      this.channel.ack(msg);
      console.log(`Delivery created for order ${orderData.order_id}`);
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
