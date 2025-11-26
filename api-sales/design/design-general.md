# Sales API - Implementation Design

## Overview
REST API for order creation and management. Implements hexagonal architecture with Fastify framework.

---

## Technology Stack
- **Framework:** Fastify (TypeScript)
- **Database:** PostgreSQL (with pg library)
- **Message Broker:** RabbitMQ (amqplib)
- **Event Streaming:** Kafka (kafkajs)
- **Cache/Session:** Redis (ioredis)
- **Auth:** OAuth2 JWT validation (fastify-jwt)
- **Validation:** JSON Schema (Fastify built-in)
- **Logging:** Pino (Fastify built-in)
- **Metrics:** prom-client (Prometheus)

---

## Project Structure

```
api-sales/
├── src/
│   ├── domain/                      # Core business logic (framework-agnostic)
│   │   ├── entities/
│   │   │   ├── Order.ts            # Order entity with validation rules
│   │   │   └── OrderStatus.ts      # Enum: PendingShipment, Shipped, Delivered
│   │   ├── repositories/           # Port interfaces
│   │   │   └── IOrderRepository.ts
│   │   └── services/
│   │       └── OrderService.ts     # Business logic: create, update status
│   ├── application/                # Use cases
│   │   ├── CreateOrderUseCase.ts   # Orchestrates order creation flow
│   │   └── UpdateOrderStatusUseCase.ts
│   ├── adapters/
│   │   ├── inbound/                # HTTP controllers
│   │   │   ├── OrderController.ts  # POST /orders, GET /orders/:id
│   │   │   └── HealthController.ts # GET /health, GET /metrics
│   │   ├── outbound/
│   │   │   ├── PostgresOrderRepository.ts
│   │   │   ├── RabbitMQPublisher.ts
│   │   │   ├── KafkaProducer.ts
│   │   │   └── ProductServiceClient.ts  # Mock
│   │   └── messaging/
│   │       └── OrderEventConsumer.ts    # Consumes shipped/delivered events
│   ├── infrastructure/
│   │   ├── config/
│   │   │   └── config.ts           # Environment variables
│   │   ├── database/
│   │   │   ├── connection.ts
│   │   │   └── migrations/         # SQL migration files
│   │   ├── messaging/
│   │   │   ├── rabbitmq.ts         # Connection setup
│   │   │   └── kafka.ts
│   │   ├── plugins/
│   │   │   ├── auth.ts             # JWT validation plugin
│   │   │   ├── cors.ts
│   │   │   └── prometheus.ts       # Metrics endpoint
│   │   └── server.ts               # Fastify app setup
│   └── index.ts                    # Entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
└── tsconfig.json
```

---

## Core Responsibilities

### 1. Order Creation (POST /orders)
**Flow:**
1. Validate JWT token (OAuth2)
2. Validate request body (schema validation)
3. Check product availability via ProductServiceClient (mocked)
4. Create order in PostgreSQL (status: "Pending Shipment")
5. Publish `OrderCreated` event to RabbitMQ (`orders.created` queue)
6. Publish `OrderCreated` event to Kafka (audit trail)
7. Return 201 with order ID

**Request:**
```json
{
  "idempotency_key": "uuid",
  "user_id": "uuid",
  "product_id": "uuid",
  "quantity": 2
}
```

**Response:**
```json
{
  "order_id": "uuid",
  "status": "Pending Shipment",
  "created_at": "ISO8601"
}
```

### 2. Get Order (GET /orders/:id)
Return order details with current status.

### 3. Event Consumption
**Consume from RabbitMQ:**
- `orders.shipped` queue → Update order status to "Shipped"
- `orders.delivered` queue → Update order status to "Delivered"

**Idempotency:** Check `processed_events` table before applying updates.

---

## Database Schema

```sql
-- orders table
CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_idempotency ON orders(idempotency_key);

-- processed_events table (for idempotency)
CREATE TABLE processed_events (
    event_id VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    order_id UUID NOT NULL,
    processed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_processed_events_order_id ON processed_events(order_id);
```

---

## RabbitMQ Configuration

**Publish to:**
- `orders.created` exchange (topic) → routing key: `order.created`

**Consume from:**
- `orders.shipped` queue (with DLQ: `orders.shipped.dlq`)
- `orders.delivered` queue (with DLQ: `orders.delivered.dlq`)

**Retry policy:** 3 attempts with exponential backoff (5s, 25s, 125s), then DLQ.

---

## Kafka Configuration

**Produce to:**
- Topic: `order-events`
- Events: `OrderCreated`, `OrderStatusChanged`

**Message format:**
```json
{
  "event_id": "uuid",
  "event_type": "OrderCreated",
  "order_id": "uuid",
  "timestamp": "ISO8601",
  "data": { ... }
}
```

---

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/v1/orders | Create new order | JWT |
| GET | /api/v1/orders/:id | Get order details | JWT |
| GET | /health | Health check | No |
| GET | /metrics | Prometheus metrics | No |

---

## Environment Variables

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/sales_db
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
KAFKA_BROKERS=localhost:9092
JWT_SECRET=your-secret-key
PRODUCT_SERVICE_URL=http://mock-service (mocked)
LOG_LEVEL=info
```

---

## Error Handling

**HTTP Error Responses:**
```json
{
  "errors": [
    {
      "error_code": "VALIDATION_ERROR",
      "error_description": "Product ID is required",
      "error_severity": "error"
    }
  ]
}
```

**Status Codes:**
- 201: Order created
- 400: Validation error
- 401: Unauthorized
- 404: Order not found
- 409: Product unavailable / Duplicate idempotency key
- 500: Internal server error

---

## Observability

**Logging:** Structured JSON logs with correlation IDs
**Metrics:** Request rate, latency, error rate, queue depth
**Health Check:** Database, RabbitMQ, Kafka connectivity

---

## Testing Strategy

- **Unit tests:** Domain logic (OrderService)
- **Integration tests:** Repository, message publishing
- **E2E tests:** Full order creation flow via REST API
- **Test cleanup:** Delete test data after each test