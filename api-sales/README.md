# Sales API

RESTful API for order processing in the Sales system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run in development:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Create Order
```
POST /api/v1/orders
Content-Type: application/json

{
  "user_id": "user-123",
  "product_id": "product-456",
  "quantity": 2,
  "idempotency_key": "optional-unique-key"
}
```

### Get Order
```
GET /api/v1/orders/:id
```

### Health Check
```
GET /health
```

### Metrics
```
GET /metrics
```

## Architecture

This service follows Hexagonal (Ports & Adapters) architecture:

- **Domain**: Core business logic (entities, repositories, services)
- **Application**: Use cases orchestrating domain logic
- **Adapters**: 
  - Inbound: HTTP controllers
  - Outbound: Database, RabbitMQ, Kafka clients
  - Messaging: Event consumers

## Testing

```bash
npm test
```

## Docker

The service is configured to run via docker-compose. See `/dockers` directory in the project root.
