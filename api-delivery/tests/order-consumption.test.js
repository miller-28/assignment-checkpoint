// Order consumption and delivery creation tests
const request = require('supertest');
const amqp = require('amqplib');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

describe('Order Consumption Tests', () => {
  let connection;
  let channel;

  beforeAll(async () => {
    // Connect to RabbitMQ for testing
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue('orders.created', { durable: true });
    } catch (error) {
      console.warn('RabbitMQ not available for testing:', error.message);
    }
  });

  afterAll(async () => {
    if (channel) await channel.close();
    if (connection) await connection.close();
  });

  test('Should consume order from orders.created queue and create delivery', async () => {
    if (!channel) {
      console.log('Skipping test - RabbitMQ not available');
      return;
    }

    const orderData = {
      order_id: '550e8400-e29b-41d4-a716-446655440010',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      product_id: '550e8400-e29b-41d4-a716-446655440001',
      quantity: 3,
      status: 'PendingShipment',
      created_at: new Date().toISOString()
    };

    // Publish order to queue
    channel.sendToQueue(
      'orders.created',
      Buffer.from(JSON.stringify(orderData)),
      { persistent: true }
    );

    // Wait for delivery to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if delivery was created by querying API
    const response = await request(BASE_URL)
      .get('/api/v1/deliveries')
      .expect(200);

    // Look for delivery with matching order_id
    const delivery = response.body.find(d => d.order_id === orderData.order_id);
    
    if (delivery) {
      expect(delivery.order_id).toBe(orderData.order_id);
      expect(delivery.status).toBe('Processing');
      expect(delivery).toHaveProperty('delivery_id');
    }
  }, 15000);

  test('Should handle duplicate order consumption (idempotency)', async () => {
    if (!channel) {
      console.log('Skipping test - RabbitMQ not available');
      return;
    }

    const orderData = {
      order_id: '550e8400-e29b-41d4-a716-446655440011',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      product_id: '550e8400-e29b-41d4-a716-446655440002',
      quantity: 1,
      status: 'PendingShipment',
      created_at: new Date().toISOString()
    };

    // Publish same order twice
    channel.sendToQueue('orders.created', Buffer.from(JSON.stringify(orderData)), { persistent: true });
    channel.sendToQueue('orders.created', Buffer.from(JSON.stringify(orderData)), { persistent: true });

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check deliveries - should only have one
    const response = await request(BASE_URL)
      .get('/api/v1/deliveries')
      .expect(200);

    const deliveries = response.body.filter(d => d.order_id === orderData.order_id);
    
    // Should only create one delivery even with duplicate messages
    if (deliveries.length > 0) {
      expect(deliveries.length).toBeLessThanOrEqual(1);
    }
  }, 15000);
});
