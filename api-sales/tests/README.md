# API Sales - Integration Tests

Simple Jest-based integration tests for the Sales API.

## Test Structure

```
tests/
├── jest.config.js              # Jest configuration
├── order.test.js               # Order API endpoint tests
└── product-availability.test.js # Product availability tests
```

## Running Tests

### Prerequisites
- API server must be running (default: http://localhost:3000)
- Database must be initialized with sample products

### Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

### Order API Tests (order.test.js)
- ✅ Health endpoint returns healthy status
- ✅ Metrics endpoint returns service info
- ✅ Create order with valid data
- ✅ Retrieve order by ID
- ✅ Validation: Invalid user_id format
- ✅ Validation: Missing required fields
- ✅ Validation: Invalid quantity (0 or negative)
- ✅ 404 handling for non-existent orders

### Product Availability Tests (product-availability.test.js)
- ✅ Create order with available product (Laptop - qty 50)
- ✅ Create order with available product (Mouse - qty 200)
- ❌ Reject order when quantity exceeds available stock
- ❌ Reject order for unavailable product (qty 0)

## Test Data

Sample products in database:
- `550e8400-e29b-41d4-a716-446655440001` - Laptop Pro 15 (qty: 50)
- `550e8400-e29b-41d4-a716-446655440002` - Wireless Mouse (qty: 200)
- `550e8400-e29b-41d4-a716-446655440003` - Mechanical Keyboard (qty: 75)
- `550e8400-e29b-41d4-a716-446655440004` - USB-C Hub (qty: 150)
- `550e8400-e29b-41d4-a716-446655440005` - Webcam 4K (qty: 0) ❌

## Environment Variables

```bash
# Optional: Override API URL
export API_URL=http://localhost:3000
npm test
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run Integration Tests
  run: |
    docker-compose up -d
    npm test
  env:
    API_URL: http://localhost:3000
```

## Notes

- Tests use `supertest` for HTTP assertions
- Tests are integration tests (require running server)
- Each test is independent and doesn't affect others
- Tests validate both success and error scenarios
