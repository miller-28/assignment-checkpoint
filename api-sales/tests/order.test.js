// Simple integration tests for Order API
const request = require('supertest');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

describe('Order API Integration Tests', () => {
  let createdOrderId;

  test('Health endpoint should return healthy status', async () => {
    const response = await request(BASE_URL)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('database', true);
  });

  test('Metrics endpoint should return service info', async () => {
    const response = await request(BASE_URL)
      .get('/metrics')
      .expect(200);

    expect(response.body).toHaveProperty('service', 'sales-api');
    expect(response.body).toHaveProperty('uptime');
  });

  test('POST /api/v1/orders should create order with available product', async () => {
    const orderData = {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      product_id: '550e8400-e29b-41d4-a716-446655440001', // Laptop Pro 15 - qty 50
      quantity: 2
    };

    const response = await request(BASE_URL)
      .post('/api/v1/orders')
      .send(orderData)
      .set('Content-Type', 'application/json')
      .expect(201);

    expect(response.body).toHaveProperty('order_id');
    expect(response.body.user_id).toBe(orderData.user_id);
    expect(response.body.product_id).toBe(orderData.product_id);
    expect(response.body.quantity).toBe(orderData.quantity);
    expect(response.body.status).toBe('PendingShipment');

    createdOrderId = response.body.order_id;
  });

  test('GET /api/v1/orders/:id should retrieve created order', async () => {
    if (!createdOrderId) {
      throw new Error('No order created in previous test');
    }

    const response = await request(BASE_URL)
      .get(`/api/v1/orders/${createdOrderId}`)
      .expect(200);

    expect(response.body.order_id).toBe(createdOrderId);
    expect(response.body.status).toBe('PendingShipment');
  });

  test('POST /api/v1/orders should fail with invalid user_id format', async () => {
    const orderData = {
      user_id: 'invalid-uuid',
      product_id: '550e8400-e29b-41d4-a716-446655440001',
      quantity: 1
    };

    const response = await request(BASE_URL)
      .post('/api/v1/orders')
      .send(orderData)
      .set('Content-Type', 'application/json')
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('POST /api/v1/orders should fail with missing required fields', async () => {
    const orderData = {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      quantity: 1
      // missing product_id
    };

    const response = await request(BASE_URL)
      .post('/api/v1/orders')
      .send(orderData)
      .set('Content-Type', 'application/json')
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('POST /api/v1/orders should fail with invalid quantity', async () => {
    const orderData = {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      product_id: '550e8400-e29b-41d4-a716-446655440001',
      quantity: 0
    };

    const response = await request(BASE_URL)
      .post('/api/v1/orders')
      .send(orderData)
      .set('Content-Type', 'application/json')
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  test('GET /api/v1/orders/:id should return 404 for non-existent order', async () => {
    const fakeOrderId = '00000000-0000-0000-0000-000000000000';

    const response = await request(BASE_URL)
      .get(`/api/v1/orders/${fakeOrderId}`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });
});
