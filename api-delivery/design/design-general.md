# Delivery API - Implementation Design

## Overview
REST API for shipment processing and delivery management. Implements hexagonal architecture with Fastify framework.

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
api-delivery/
├── src/
│   ├── domain/                      # Core business logic (framework-agnostic)
│   │   ├── entities/
│   │   │   ├── Delivery.ts         # Delivery entity
│   │   │   └── DeliveryStatus.ts   # Enum: Processing, Shipped, Delivered
│   │   ├── repositories/
│   │   │   └── IDeliveryRepository.ts
│   │   └── services/
│   │       └── DeliveryService.ts  # Business logic: process, ship, deliver
│   ├── application/                # Use cases
│   │   ├── ProcessDeliveryUseCase.ts
│   │   ├── ShipOrderUseCase.ts
│   │   └── DeliverOrderUseCase.ts
│   ├── adapters/
│   │   ├── inbound/                # HTTP controllers
│   │   │   ├── DeliveryController.ts  # GET /deliveries/:id, POST /deliveries/:id/ship
│   │   │   └── HealthController.ts    # GET /health, GET /metrics
│   │   ├── outbound/
│   │   │   ├── PostgresDeliveryRepository.ts
│   │   │   ├── RabbitMQPublisher.ts
│   │   │   └── KafkaProducer.ts
│   │   └── messaging/
│   │       └── OrderEventConsumer.ts  # Consumes orders.created
│   ├── infrastructure/
│   │   ├── config/
│   │   │   └── config.ts           # Environment variables
│   │   ├── database/
│   │   │   ├── connection.ts
│   │   │   └── migrations/
│   │   ├── messaging/
│   │   │   ├── rabbitmq.ts
│   │   │   └── kafka.ts
│   │   ├── plugins/
│   │   │   ├── auth.ts
│   │   │   ├── cors.ts
│   │   │   └── prometheus.ts
│   │   └── server.ts
│   └── index.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── package.json
└── tsconfig.json
```

---

## Core Responsibilities

### 1. Consume Order Created Events
**Flow:**
1. Consume from RabbitMQ `orders.created` queue
2. Create delivery record in PostgreSQL (status: "Processing")
3. ACK message after successful processing
4. Log event to Kafka

**Message format:**
```json
{
  "order_id": "uuid",
  "user_id": "uuid",
  "product_id": "uuid",
  "quantity": 2
}
```

### 2. Ship Order (POST /deliveries/:id/ship)
**Flow:**
1. Validate JWT token
2. Update delivery status to "Shipped"
3. Publish `OrderShipped` event to RabbitMQ (`orders.shipped` queue)
4. Publish `OrderShipped` event to Kafka
5. Return 200

**Response:**
```json
{
  "delivery_id": "uuid",
  "order_id": "uuid",
  "status": "Shipped",
  "shipped_at": "ISO8601",
  "tracking_number": "TRACK123"
}
```

### 3. Deliver Order (POST /deliveries/:id/deliver)
**Flow:**
1. Validate JWT token
2. Update delivery status to "Delivered"
3. Publish `OrderDelivered` event to RabbitMQ (`orders.delivered` queue)
4. Publish `OrderDelivered` event to Kafka
5. Return 200

**Response:**
```json
{
  "delivery_id": "uuid",
  "order_id": "uuid",
  "status": "Delivered",
  "delivered_at": "ISO8601"
}
```

### 4. Get Delivery (GET /deliveries/:id)
Return delivery details with current status.

---

## Database Schema

```sql
-- deliveries table
CREATE TABLE deliveries (
    delivery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_tracking ON deliveries(tracking_number);

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

**Consume from:**
- `orders.created` queue (with DLQ: `orders.created.dlq`)

**Publish to:**
- `orders.shipped` exchange (topic) → routing key: `order.shipped`
- `orders.delivered` exchange (topic) → routing key: `order.delivered`

**Retry policy:** 3 attempts with exponential backoff (5s, 25s, 125s), then DLQ.

---

## Kafka Configuration

**Produce to:**
- Topic: `order-events`
- Events: `OrderShipped`, `OrderDelivered`

**Message format:**
```json
{
  "event_id": "uuid",
  "event_type": "OrderShipped",
  "order_id": "uuid",
  "delivery_id": "uuid",
  "timestamp": "ISO8601",
  "data": {
    "tracking_number": "TRACK123"
  }
}
```

---

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/v1/deliveries/:id | Get delivery details | JWT |
| POST | /api/v1/deliveries/:id/ship | Mark order as shipped | JWT |
| POST | /api/v1/deliveries/:id/deliver | Mark order as delivered | JWT |
| GET | /health | Health check | No |
| GET | /metrics | Prometheus metrics | No |

---

## Environment Variables

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/delivery_db
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
KAFKA_BROKERS=localhost:9092
JWT_SECRET=your-secret-key
LOG_LEVEL=info
```

---

## Error Handling

**HTTP Error Responses:**
```json
{
  "errors": [
    {
      "error_code": "NOT_FOUND",
      "error_description": "Delivery not found",
      "error_severity": "error"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 400: Validation error
- 401: Unauthorized
- 404: Delivery not found
- 409: Invalid status transition
- 500: Internal server error

---

## Business Logic

### Status Transitions
- **Processing → Shipped:** When warehouse confirms shipment
- **Shipped → Delivered:** When delivery is confirmed

### Idempotency
- Check `processed_events` table before processing `orders.created` messages
- Prevent duplicate delivery records for same order_id (unique constraint)

---

## Observability

**Logging:** Structured JSON logs with correlation IDs
**Metrics:** Request rate, latency, error rate, queue depth, delivery processing time
**Health Check:** Database, RabbitMQ, Kafka connectivity

---

## Testing Strategy

- **Unit tests:** Domain logic (DeliveryService)
- **Integration tests:** Repository, message publishing/consuming
- **E2E tests:** Full delivery lifecycle via events and REST API
- **Test cleanup:** Delete test data after each test

---

## Simulation / Mock Behavior

For testing purposes, the Delivery API can auto-progress orders:
- After order is created (Processing), wait X seconds → auto-ship
- After shipped, wait Y seconds → auto-deliver

This can be controlled via environment variables:
```env
AUTO_SHIP_DELAY_MS=10000
AUTO_DELIVER_DELAY_MS=20000
ENABLE_AUTO_PROGRESSION=true
```
