# Sales API - Implementation Sequence

## Overview
Step-by-step implementation plan for Sales API focusing on assignment requirements.

---

## Implementation Phases

### Phase 1: Project Setup & Infrastructure
**Priority: Critical**

1. **Initialize Project**
   ```bash
   mkdir api-sales && cd api-sales
   npm init -y
   ```

2. **Install Core Dependencies**
   ```bash
   npm install fastify @fastify/cors pino pg uuid
   npm install -D typescript @types/node @types/pg tsx nodemon
   ```

3. **Install Testing & Linting**
   ```bash
   npm install -D jest @types/jest ts-jest eslint prettier
   ```

4. **Install Messaging & Events**
   ```bash
   npm install amqplib kafkajs ioredis
   npm install -D @types/amqplib
   ```

5. **Setup TypeScript Config**
   - Create `tsconfig.json`
   - Configure strict mode, ES2022 target

6. **Create Basic Structure**
   ```
   src/
   ├── index.ts           # Entry point
   ├── infrastructure/
   │   ├── server.ts      # Fastify setup
   │   └── config.ts      # Environment config
   └── __mocks__/         # Mock dependencies
   ```

7. **Setup Scripts in package.json**
   ```json
   {
     "scripts": {
       "dev": "tsx watch src/index.ts",
       "build": "tsc",
       "start": "node dist/index.js",
       "test": "jest",
       "lint": "eslint src --ext .ts"
     }
   }
   ```

---

### Phase 2: Core Domain Layer
**Priority: Critical - Assignment Focus**

1. **Create Order Entity** (`src/domain/entities/Order.ts`)
   - Properties: order_id, user_id, product_id, quantity, status, timestamps
   - Status enum: PendingShipment, Shipped, Delivered
   - Simple validation methods

2. **Create Order Repository Interface** (`src/domain/repositories/IOrderRepository.ts`)
   - `create(order): Promise<Order>`
   - `findById(id): Promise<Order | null>`
   - `updateStatus(id, status): Promise<void>`

3. **Create Order Service** (`src/domain/services/OrderService.ts`)
   - `createOrder(data): Promise<Order>`
   - `updateOrderStatus(orderId, status): Promise<void>`
   - Business logic for order creation

**Testing:**
- Unit test Order entity validation
- Mock repository for service tests

---

### Phase 3: Database Layer
**Priority: Critical**

1. **Create PostgreSQL Repository** (`src/adapters/outbound/PostgresOrderRepository.ts`)
   - Implement IOrderRepository interface
   - Use pg library with connection pooling
   - SQL queries for create, findById, updateStatus

2. **Create Database Migration** (`src/infrastructure/database/migrations/001_create_orders.sql`)
   - orders table schema
   - processed_events table for idempotency
   - indexes

3. **Database Connection** (`src/infrastructure/database/connection.ts`)
   - Connection pool setup
   - Health check function

**Testing:**
- Integration tests with test database
- Mock pg client for unit tests

---

### Phase 4: Mock External Services
**Priority: High - Quick Implementation**

1. **Mock Product Service** (`src/adapters/outbound/ProductServiceClient.ts`)
   ```typescript
   async checkAvailability(productId: string): Promise<boolean> {
     // Always return true for demo
     return true;
   }
   ```

2. **Mock Auth Middleware** (`src/infrastructure/plugins/auth.ts`)
   ```typescript
   // Simple JWT validation - always pass for demo
   async function authMiddleware(request, reply) {
     request.user = { userId: 'mock-user-123' };
   }
   ```

**No testing needed** - Mocks are simple stubs

---

### Phase 5: HTTP Controllers
**Priority: Critical - Assignment Focus**

1. **Create Order Controller** (`src/adapters/inbound/OrderController.ts`)
   - `POST /api/v1/orders` - Create order
   - `GET /api/v1/orders/:id` - Get order details
   - Request validation using Fastify schemas
   - Error handling

2. **Create Health Controller** (`src/adapters/inbound/HealthController.ts`)
   - `GET /health` - Service health
   - `GET /metrics` - Basic metrics (order count)

3. **Setup Routes** (`src/infrastructure/server.ts`)
   - Register controllers
   - CORS configuration
   - Error handlers

**Testing:**
- E2E tests using Fastify inject
- Test order creation flow
- Test validation errors

---

### Phase 6: Messaging Layer
**Priority: Critical - Assignment Requirement**

1. **RabbitMQ Publisher** (`src/adapters/outbound/RabbitMQPublisher.ts`)
   - Connect to RabbitMQ
   - `publishOrderCreated(order)`
   - Queue: `orders.created`
   - Error handling with retry

2. **RabbitMQ Consumer** (`src/adapters/messaging/OrderEventConsumer.ts`)
   - Consume from `orders.shipped` queue
   - Consume from `orders.delivered` queue
   - Update order status
   - ACK/NACK handling

3. **Kafka Producer** (`src/adapters/outbound/KafkaProducer.ts`)
   - Connect to Kafka
   - `publishEvent(eventType, data)`
   - Topic: `order-events`

**Testing:**
- Mock RabbitMQ/Kafka clients
- Test message publishing
- Test event consumption

---

### Phase 7: Use Cases / Application Layer
**Priority: High - Clean Architecture**

1. **Create Order Use Case** (`src/application/CreateOrderUseCase.ts`)
   - Orchestrate: validate → check availability → create order → publish events
   - Handle idempotency key
   - Transaction management

2. **Update Order Status Use Case** (`src/application/UpdateOrderStatusUseCase.ts`)
   - Validate status transition
   - Update database
   - Emit events

**Testing:**
- Mock all dependencies
- Test happy path
- Test error scenarios

---

### Phase 8: Configuration & Environment
**Priority: Critical**

1. **Environment Config** (`src/infrastructure/config/config.ts`)
   ```typescript
   export const config = {
     port: process.env.PORT || 3000,
     databaseUrl: process.env.DATABASE_URL,
     rabbitmqUrl: process.env.RABBITMQ_URL,
     kafkaBrokers: process.env.KAFKA_BROKERS?.split(','),
     jwtSecret: process.env.JWT_SECRET,
   };
   ```

2. **Create `.env.example`**

**No testing needed** - Configuration only

---

### Phase 9: Integration & Testing
**Priority: High**

1. **End-to-End Test**
   - Start all dependencies (docker-compose infra)
   - Test complete order flow
   - Verify database state
   - Verify messages published

2. **Test Cleanup**
   - Delete test orders after tests
   - Reset database between tests

---


## Testing Strategy
- **Unit Tests:** Domain entities, services (mocked repositories)
- **Integration Tests:** Database operations, message publishing
- **E2E Tests:** Complete order creation flow via API
- **Coverage Target:** 70%+ on critical paths

## Simplifications for Speed
✅ Mock product availability service (always returns true)
✅ Mock authentication (bypass JWT validation)
✅ Simple error responses (no complex error handling)
✅ Basic logging (no ELK integration)
✅ No Prometheus metrics (just health check)
✅ No Redis session management (not critical for demo)
✅ Simple idempotency check (database only)

## What Matters for Assignment
🎯 **Order creation endpoint** - Functional and tested
🎯 **Order status updates** - Via RabbitMQ events
🎯 **Database persistence** - PostgreSQL with proper schema
🎯 **Message publishing** - RabbitMQ + Kafka integration
🎯 **Event consumption** - Handle shipped/delivered events
🎯 **Clean code** - Hexagonal architecture visible
🎯 **Tests** - Key flows covered

## Order of Implementation
1. ✅ Setup project structure
2. ✅ Core domain (Order entity, service)
3. ✅ Database layer (repository, migrations)
4. ✅ HTTP layer (controllers, routes)
5. ✅ Messaging (RabbitMQ, Kafka)
6. ✅ Use cases (orchestration)
7. ✅ Tests (unit, integration, e2e)
