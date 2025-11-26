# System Design Document: Order Processing Integration

## 1. Architecture Overview
**Pattern:** Hexagonal Architecture (Ports & Adapters) with REST APIs  
**Framework:** Fastify (Node.js/TypeScript)  
**Communication:** Asynchronous messaging (RabbitMQ) + Event Streaming (Kafka)

---

## 2. System Components

### Application Services
- **Sales API** - REST API for order creation and management. Validates orders, checks availability, persists data, publishes events
- **Delivery API** - REST API for shipment processing. Consumes order events, manages delivery lifecycle, publishes status updates

### Infrastructure Components
- **AWS ALB (Application Load Balancer)** - Distributes traffic across multiple API instances, SSL termination, health checks
- **RabbitMQ** - Message broker for reliable inter-service communication with retry/DLQ mechanisms
  - `orders.created` queue - Sales → Delivery (new orders)
  - `orders.shipped` queue - Delivery → Sales (shipment notifications)
  - `orders.delivered` queue - Delivery → Sales (delivery confirmations)
  - Dead Letter Queues (DLQ) for each queue to handle failed messages
- **Kafka** - Event streaming platform for order lifecycle audit trail and analytics
- **PostgreSQL** - Primary transactional database for both Sales and Delivery systems
- **Redis** - Distributed session storage and caching layer
- **OAuth2 Provider** - Authentication and authorization (JWT tokens)
- **Prometheus + Grafana** - Metrics collection and visualization dashboards
- **ELK Stack** (Elasticsearch, Logstash, Kibana) - Centralized logging and log analysis

### External Dependencies (Mocked)
- **Product Availability Service** - Validates product stock before order confirmation

---

## 4. Order Lifecycle Flow

```
1. Customer → Sales API: POST /orders
   ↓
2. Sales API: Validate input & check OAuth2 token
   ↓
3. Sales API → Product Service: Check availability (mocked)
   ↓
4. Sales API → PostgreSQL: Insert order (status: "Pending Shipment")
   ↓
5. Sales API → RabbitMQ: Publish to orders.created queue
   ↓
6. Sales API → Kafka: Publish OrderCreated event
   ↓
7. Sales API → Client: Return 201 with order ID
   ↓
8. Delivery API: Consume orders.created from RabbitMQ
   ↓
9. Delivery API: Process shipment → Update status to "Shipped"
   ↓
10. Delivery API → RabbitMQ: Publish to orders.shipped queue
    ↓
11. Delivery API → Kafka: Publish OrderShipped event
    ↓
12. Sales API: Consume orders.shipped → Update order status
    ↓
13. Delivery API: Mark delivered → Publish to orders.delivered
    ↓
14. Sales API: Consume orders.delivered → Final status update
    ↓
15. Kafka: Complete order lifecycle audit trail available

Note: Failed messages retry 3x then move to DLQ for manual intervention
```

---

## 5. Non-Functional Requirements Adherence

### Mandatory Requirements

**Reliability**
- **RabbitMQ with retry logic**: Failed messages retry 3 times with exponential backoff before moving to DLQ
- **Message acknowledgment**: Messages only acknowledged after successful processing
- **Idempotent handlers**: Each event handler checks for duplicate order IDs to prevent double-processing
- **Circuit breakers**: Fastify plugins wrap external calls to fail fast and prevent cascade failures
- **Health checks**: ALB monitors API health endpoints and routes traffic only to healthy instances

**Scalability**
- **Horizontal scaling**: APIs run as stateless containers (ECS/EKS) behind ALB with auto-scaling based on CPU/memory
- **Database connection pooling**: PostgreSQL configured with connection limits and pooling (pg-pool)
- **Redis for sessions**: Distributed session storage eliminates sticky sessions requirement
- **Message queue buffering**: RabbitMQ decouples services, allowing independent scaling based on queue depth
- **Read replicas**: PostgreSQL read replicas for GET endpoints to reduce primary DB load

### Nice-to-Have Requirements

**Idempotency**
- Order creation uses client-provided `idempotency_key` to prevent duplicate orders
- Status update handlers check current status before applying changes
- Kafka event IDs tracked in database to skip already-processed events

**Security**
- OAuth2 with JWT tokens for API authentication
- Redis stores encrypted session data with TTL expiration
- API rate limiting using Fastify rate-limit plugin
- All communication over HTTPS/TLS
- Secret management via AWS Secrets Manager

**Observability**
- **Structured logging**: All services log in JSON format to stdout, aggregated in ELK
- **Metrics**: Prometheus scrapes `/metrics` endpoint exposing request rates, latency, error rates
- **Dashboards**: Grafana visualizes key metrics (order throughput, queue depth, API latency, error rates)
- **Distributed tracing**: Correlation IDs propagate through all service calls and logs
- **Alerts**: Grafana alerts on high error rates, queue depth, API downtime

---

## 6. Technology Stack Summary

| Component | Technology | Justification |
|-----------|-----------|---------------|
| API Framework | Fastify | High performance, built-in validation, TypeScript support |
| Architecture | Hexagonal | Testable, maintainable, framework-agnostic domain logic |
| Message Broker | RabbitMQ | Reliable delivery, retry/DLQ, mature ecosystem |
| Event Stream | Kafka | Durable event log, audit trail, analytics |
| Database | PostgreSQL | ACID compliance, robust for transactional workloads |
| Cache/Session | Redis | Fast in-memory storage, distributed sessions |
| Load Balancer | AWS ALB | Managed service, auto-scaling, health checks |
| Auth | OAuth2/JWT | Industry standard, stateless, scalable |
| Observability | Prometheus + Grafana + ELK | Comprehensive metrics, logs, and visualization |