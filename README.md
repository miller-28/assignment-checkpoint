# Order Processing Integration - Assignment

## Overview

This project implements an **Order Processing Integration** system for a large-scale e-commerce platform, integrating **Sales** and **Delivery** systems to support a complete order lifecycle with reliable inter-service communication.

The implementation follows **Hexagonal Architecture (Ports & Adapters)** pattern with REST APIs built using **Fastify (TypeScript)**, asynchronous messaging via **RabbitMQ**, event streaming with **Kafka**, and comprehensive observability.

---

## Documentation

### 🏗️ System Design

- [**Design System Document**](design-system.md) - Complete architecture overview, components, flows, and technology stack
- [**Sales API Design**](api-sales/design/design-general.md) - Implementation design for Sales API
- [**Delivery API Design**](api-delivery/design/design-general.md) - Implementation design for Delivery API

### 📊 UML Diagrams

- [**Component Diagram**](docs/diagrams/component-diagram.png) - High-level architecture with all components
- [**Order Creation Sequence**](docs/diagrams/sequence-order-creation.png) - Complete order creation flow
- [**Order Shipment & Delivery Sequence**](docs/diagrams/sequence-order-shipment.png) - Shipment and delivery lifecycle
- [**Error Handling & Retry Sequence**](docs/diagrams/sequence-error-handling.png) - Reliability mechanisms

---

## 🚀 Quick Start - Running the Platform

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- 8GB+ RAM available
- Ports free: 3000, 3001, 5432, 5672, 6379, 8080, 8081, 9092, 15672, 29092

### Start All Services

```powershell
# Navigate to docker directory
cd dockers

# Start entire platform (infrastructure + APIs + dashboards)
docker-compose up -d

# Check services are running
docker-compose ps

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f assignment-api-sales
docker-compose logs -f assignment-api-delivery
```

### Access the Platform

Once all services are healthy (may take 1-2 minutes):

| Service | URL | Credentials |
|---------|-----|-------------|
| **Sales Dashboard** | http://localhost:8080 | Any username/password (mock auth) |
| **Delivery Dashboard** | http://localhost:8081 | Any username/password (mock auth) |
| **Sales API** | http://localhost:3000/api/v1 | JWT required |
| **Delivery API** | http://localhost:3001/api/v1 | JWT required |
| **RabbitMQ Management** | http://localhost:15672 | admin / admin |

### Test the Complete Flow

1. **Open Sales Dashboard** (http://localhost:8080)
   - Login with any credentials
   - Create a new order:
     - Product ID: `prod-123`
     - Quantity: `2`
     - User ID: `user-456`
   - Note the generated Order ID
   - Observe status: "Pending Shipment"

2. **Open Delivery Dashboard** (http://localhost:8081)
   - Login with any credentials
   - Find your order in "Pending Shipments"
   - Click "🚚 Mark as Shipped"
   - Order moves to "In Transit"
   - Click "✅ Mark as Delivered"
   - Order moves to "Completed"

3. **Verify in Sales Dashboard**
   - Refresh the Sales Dashboard
   - Your order status should update: Pending → Shipped → Delivered

4. **Monitor RabbitMQ** (http://localhost:15672)
   - View messages flowing through queues:
     - `orders.created`
     - `orders.shipped`
     - `orders.delivered`

### Stop the Platform

```powershell
# Stop all services (preserves data)
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### Troubleshooting

**Services not starting:**
```powershell
# Check logs
docker-compose logs

# Restart specific service
docker-compose restart assignment-api-sales

# Rebuild and restart
docker-compose up -d --build assignment-api-sales
```

**Port conflicts:**
Edit `docker-compose.yml` to change host ports if needed.

**Database connection issues:**
```powershell
# Check PostgreSQL health
docker exec assignment-postgres pg_isready -U postgres

# Restart database
docker-compose restart assignment-postgres
```

**Complete reset:**
```powershell
# Remove everything and start fresh
docker-compose down -v
docker-compose up -d
```

### Development Mode (Infrastructure Only)

To run only databases/messaging and develop APIs locally:

```powershell
# Start infrastructure only
docker-compose -f docker-compose.infra.yml up -d

# Run APIs locally
cd ../api-sales
npm install
npm run dev

cd ../api-delivery
npm install
npm run dev
```

For complete Docker setup documentation, see [dockers/README.md](dockers/README.md)

---
