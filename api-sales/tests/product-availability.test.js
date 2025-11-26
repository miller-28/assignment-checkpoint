// Product availability tests
const request = require('supertest');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

describe('Product Availability Tests', () => {
  test('Should create order with available product (Laptop - qty 50)', async () => {
    const orderData = {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      product_id: '550e8400-e29b-41d4-a716-446655440001',
      quantity: 5
    };

    const response = await request(BASE_URL)
      .post('/api/v1/orders')
      .send(orderData)
      .set('Content-Type', 'application/json')
      .expect(201);

    expect(response.body.status).toBe('PendingShipment');
  });

  test('Should create order with available product (Mouse - qty 200)', async () => {
    const orderData = {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      product_id: '550e8400-e29b-41d4-a716-446655440002',
      quantity: 10
    };

    const response = await request(BASE_URL)
      .post('/api/v1/orders')
      .send(orderData)
      .set('Content-Type', 'application/json')
      .expect(201);

    expect(response.body.status).toBe('PendingShipment');
  });

  test('Should fail when requesting more than available quantity', async () => {
    const orderData = {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      product_id: '550e8400-e29b-41d4-a716-446655440003', // Keyboard - qty 75
      quantity: 100 // More than available
    };

    const response = await request(BASE_URL)
      .post('/api/v1/orders')
      .send(orderData)
      .set('Content-Type', 'application/json')
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/not available|insufficient/i);
  });

  test('Should fail with unavailable product (Webcam - qty 0)', async () => {
    const orderData = {
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      product_id: '550e8400-e29b-41d4-a716-446655440005', // Webcam 4K - qty 0
      quantity: 1
    };

    const response = await request(BASE_URL)
      .post('/api/v1/orders')
      .send(orderData)
      .set('Content-Type', 'application/json')
      .expect(400);

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/not available|insufficient/i);
  });
});
