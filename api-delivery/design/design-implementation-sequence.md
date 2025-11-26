# Delivery API - Implementation Sequence

## Overview
Step-by-step implementation plan for Delivery API focusing on assignment requirements.

---

## Implementation Phases

### Phase 1: Project Setup & Infrastructure
**Priority: Critical**

1. **Initialize Project**
   ```bash
   mkdir api-delivery && cd api-delivery
   npm init -y
   ```

2. **Install Core Dependencies** (Same as Sales API)
   ```bash
   npm install fastify @fastify/cors pino pg uuid
   npm install -D typescript @types/node @types/pg tsx nodemon
   npm install -D jest @types/jest ts-jest eslint prettier
   npm install amqplib kafkajs ioredis
   npm install -D @types/amqplib
   ```

3. **Setup TypeScript & Structure**
   - Copy tsconfig.json from Sales API
   - Create basic folder structure
   - Setup npm scripts

---

### Phase 2: Core Domain Layer
**Priority: Critical**

1. **Create Delivery Entity** (`src/domain/entities/Delivery.ts`)
   - Properties: delivery_id, order_id, status, tracking_number, timestamps
   - Status enum: Processing, Shipped, Delivered
   - Status transition validation

2. **Create Delivery Repository Interface** (`src/domain/repositories/IDeliveryRepository.ts`)
   - `create(delivery): Promise<Delivery>`
   - `findById(id): Promise<Delivery | null>`
   - `findByOrderId(orderId): Promise<Delivery | null>`
   - `updateStatus(id, status, tracking?): Promise<void>`

3. **Create Delivery Service** (`src/domain/services/DeliveryService.ts`)
   - `createDelivery(orderData): Promise<Delivery>`
   - `markAsShipped(deliveryId, tracking): Promise<void>`
   - `markAsDelivered(deliveryId): Promise<void>`
   - Validate status transitions

**Testing:**
- Unit test Delivery entity
- Unit test status transitions

---

### Phase 3: Database Layer
**Priority: Critical**

1. **Create PostgreSQL Repository** (`src/adapters/outbound/PostgresDeliveryRepository.ts`)
   - Implement IDeliveryRepository
   - SQL queries for CRUD operations

2. **Create Database Migration** (`src/infrastructure/database/migrations/001_create_deliveries.sql`)
   - deliveries table schema
   - processed_events table
   - indexes

3. **Database Connection** (Same pattern as Sales API)

**Testing:**
- Integration tests with test database

---

### Phase 4: Mock Components
**Priority: High**

1. **Mock Auth Middleware** (Copy from Sales API)
   - Simple pass-through authentication

2. **Mock Tracking Number Generator** (`src/domain/services/TrackingService.ts`)
   ```typescript
   generateTrackingNumber(): string {
     return `TRACK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
   }
   ```

**No testing needed** - Simple utilities

---

### Phase 5: HTTP Controllers
**Priority: Critical**

1. **Create Delivery Controller** (`src/adapters/inbound/DeliveryController.ts`)
   - `GET /api/v1/deliveries` - List deliveries (with status filter)
   - `GET /api/v1/deliveries/:id` - Get delivery details
   - `POST /api/v1/deliveries/:id/ship` - Mark as shipped
   - `POST /api/v1/deliveries/:id/deliver` - Mark as delivered

2. **Create Health Controller** (`src/adapters/inbound/HealthController.ts`)
   - `GET /health`
   - `GET /metrics`

3. **Setup Routes** (`src/infrastructure/server.ts`)

**Testing:**
- E2E tests for ship/deliver endpoints
- Test status filtering

---

### Phase 6: Messaging Layer
**Priority: Critical - Core Assignment Requirement**

1. **RabbitMQ Consumer** (`src/adapters/messaging/OrderEventConsumer.ts`)
   - **PRIMARY FUNCTION**: Consume from `orders.created` queue
   - Create delivery record when order received
   - ACK/NACK handling
   - Idempotency check

2. **RabbitMQ Publisher** (`src/adapters/outbound/RabbitMQPublisher.ts`)
   - `publishOrderShipped(orderData)`
   - `publishOrderDelivered(orderData)`
   - Queues: `orders.shipped`, `orders.delivered`

3. **Kafka Producer** (`src/adapters/outbound/KafkaProducer.ts`)
   - Publish OrderShipped, OrderDelivered events
   - Topic: `order-events`

**Testing:**
- Mock RabbitMQ for publishing tests
- Test event consumption and delivery creation

---

### Phase 7: Use Cases / Application Layer
**Priority: High**

1. **Process Order Use Case** (`src/application/ProcessOrderUseCase.ts`)
   - Create delivery from order event
   - Set status to "Processing"
   - Handle duplicates (idempotency)

2. **Ship Order Use Case** (`src/application/ShipOrderUseCase.ts`)
   - Generate tracking number
   - Update status to "Shipped"
   - Publish events to RabbitMQ and Kafka

3. **Deliver Order Use Case** (`src/application/DeliverOrderUseCase.ts`)
   - Update status to "Delivered"
   - Publish events to RabbitMQ and Kafka

**Testing:**
- Mock all dependencies
- Test each use case independently

---

### Phase 8: Auto-Progression Feature (Optional)
**Priority: Low - Nice to Have**

1. **Auto Progression Service** (`src/domain/services/AutoProgressionService.ts`)
   ```typescript
   // If ENABLE_AUTO_PROGRESSION=true
   // After order created → wait AUTO_SHIP_DELAY_MS → auto ship
   // After shipped → wait AUTO_DELIVER_DELAY_MS → auto deliver
   ```

**Testing:**
- Test with environment flags
- Mock timers for fast tests

---

### Phase 9: Configuration
**Priority: Critical**

1. **Environment Config** (`src/infrastructure/config/config.ts`)
    ```typescript
    export const config = {
       port: process.env.PORT || 3001,
       databaseUrl: process.env.DATABASE_URL,
       rabbitmqUrl: process.env.RABBITMQ_URL,
       kafkaBrokers: process.env.KAFKA_BROKERS?.split(','),
       enableAutoProgression: process.env.ENABLE_AUTO_PROGRESSION === 'true',
       autoShipDelayMs: parseInt(process.env.AUTO_SHIP_DELAY_MS || '10000'),
       autoDeliverDelayMs: parseInt(process.env.AUTO_DELIVER_DELAY_MS || '20000'),
    };
    ```

---
**Priority: High**

1. **End-to-End Test**
   - Publish order to `orders.created` queue
   - Verify delivery created in database
   - Call ship endpoint → verify events published
   - Call deliver endpoint → verify events published

2. **Test Complete Flow with Sales API**
   - Sales creates order → Delivery receives → Ship → Sales updated

---


## Testing Strategy
- **Unit Tests:** Domain entities, services, status transitions
- **Integration Tests:** Database operations, message consumption/publishing
- **E2E Tests:** Complete delivery lifecycle (create → ship → deliver)
- **Coverage Target:** 70%+ on critical paths

## Simplifications for Speed
✅ Mock authentication (no real JWT validation)
✅ Simple tracking number generation (timestamp-based)
✅ No complex warehouse integration
✅ Basic logging (no ELK stack)
✅ No Prometheus metrics
✅ Simple idempotency (database check only)
✅ Optional auto-progression feature

## What Matters for Assignment
🎯 **Consume orders.created** - Primary function
🎯 **Ship/Deliver endpoints** - Functional and tested
🎯 **Status transitions** - Proper validation
🎯 **Event publishing** - RabbitMQ + Kafka
🎯 **Database persistence** - PostgreSQL
🎯 **Clean architecture** - Hexagonal pattern
🎯 **Integration with Sales** - Complete lifecycle

## Order of Implementation
1. ✅ Setup project structure (copy from Sales API)
2. ✅ Core domain (Delivery entity, service)
3. ✅ Database layer
4. ✅ HTTP layer (ship/deliver endpoints)
5. ✅ **Messaging consumer** (orders.created) - MOST IMPORTANT
6. ✅ Messaging publisher (shipped/delivered)
7. ✅ Use cases
8. ✅ Tests

## Key Differences from Sales API
- **Consumes** orders instead of creating them
- **Publishes** status updates instead of receiving them
- Additional endpoints for ship/deliver actions
- Tracking number generation
- Optional auto-progression feature
