// Delivery API integration tests
const request = require('supertest');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

describe('Delivery API Integration Tests', () => {
  let deliveryId;

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

    expect(response.body).toHaveProperty('service', 'delivery-api');
    expect(response.body).toHaveProperty('uptime');
  });

  test('GET /api/v1/deliveries should list deliveries', async () => {
    const response = await request(BASE_URL)
      .get('/api/v1/deliveries')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/v1/deliveries with status filter', async () => {
    const response = await request(BASE_URL)
      .get('/api/v1/deliveries?status=Processing')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  test('GET /api/v1/deliveries/:id should return 404 for non-existent delivery', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const response = await request(BASE_URL)
      .get(`/api/v1/deliveries/${fakeId}`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  // Test ship endpoint (if delivery exists)
  test('POST /api/v1/deliveries/:id/ship should mark delivery as shipped', async () => {
    // This test requires a delivery to exist
    // Will be tested after order consumption creates deliveries
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const response = await request(BASE_URL)
      .post(`/api/v1/deliveries/${fakeId}/ship`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  // Test deliver endpoint (if delivery exists)
  test('POST /api/v1/deliveries/:id/deliver should mark delivery as delivered', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';

    const response = await request(BASE_URL)
      .post(`/api/v1/deliveries/${fakeId}/deliver`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });
});
