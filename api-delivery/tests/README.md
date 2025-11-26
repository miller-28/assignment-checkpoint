# API Delivery - Integration Tests

Simple Jest-based integration tests for the Delivery API.

## Test Structure

```
tests/
├── jest.config.js              # Jest configuration
├── delivery.test.js            # Basic delivery API endpoint tests
├── order-consumption.test.js   # RabbitMQ order consumption tests
└── lifecycle.test.js           # Delivery lifecycle (ship/deliver) tests
```

## Running Tests

### Prerequisites
- API server must be running (default: http://localhost:3001)
- Database must be initialized with deliveries schema
- RabbitMQ must be running for consumption tests

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

### Delivery API Tests (delivery.test.js)
- ✅ Health endpoint returns healthy status
- ✅ Metrics endpoint returns service info
- ✅ List all deliveries
- ✅ Filter deliveries by status
- ✅ Get delivery by ID
- ✅ 404 handling for non-existent deliveries
- ✅ Ship endpoint validation
- ✅ Deliver endpoint validation

### Order Consumption Tests (order-consumption.test.js)
- ✅ Consume order from orders.created queue
- ✅ Create delivery record automatically
- ✅ Idempotency - handle duplicate messages
- ✅ Set initial status to "Processing"

### Lifecycle Tests (lifecycle.test.js)
- ✅ Ship delivery (Processing → Shipped)
- ✅ Deliver delivery (Shipped → Delivered)
- ✅ Generate tracking number on ship
- ✅ Invalid status transition handling
- ✅ Retrieve updated delivery details

## Test Data

The tests interact with:
- RabbitMQ queue: `orders.created`
- Published queues: `orders.shipped`, `orders.delivered`
- Database: `delivery_db.deliveries` table

## Environment Variables

```bash
# Optional: Override API URL
export API_URL=http://localhost:3001

# Optional: Override RabbitMQ URL
export RABBITMQ_URL=amqp://localhost:5672

npm test
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Integration Tests
  run: |
    docker-compose up -d
    sleep 5  # Wait for services
    npm test
  env:
    API_URL: http://localhost:3001
    RABBITMQ_URL: amqp://rabbitmq:5672
```

## Notes

- Tests use `supertest` for HTTP assertions
- Tests use `amqplib` to publish test messages
- Tests wait for async message processing (2s delays)
- Each test suite is independent
- Some tests skip gracefully if RabbitMQ unavailable
