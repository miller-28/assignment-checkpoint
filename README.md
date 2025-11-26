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
- [**Sales Dashboard Design**](dashboard-sales/design/design-general.md) - Implementation design for Sales Dashboard
- [**Delivery Dashboard Design**](dashboard-delivery/design/design-general.md) - Implementation design for Delivery Dashboard

### 📊 UML Diagrams

- [**Component Diagram**](docs/diagrams/component-diagram.png) - High-level architecture with all components
- [**Order Creation Sequence**](docs/diagrams/sequence-order-creation.png) - Complete order creation flow
- [**Order Shipment & Delivery Sequence**](docs/diagrams/sequence-order-shipment.png) - Shipment and delivery lifecycle
- [**Error Handling & Retry Sequence**](docs/diagrams/sequence-error-handling.png) - Reliability mechanisms

---

## 🚀 Quick Start - Running the Platform

### Prerequisites
- Docker & Docker Compose installed
- **Stop any local services** (PostgreSQL, Redis, RabbitMQ, Kafka) using default ports to avoid conflicts

### Start the Platform

```powershell
cd dockers
docker-compose up -d
```

Wait 1-2 minutes for all services to become healthy.

### Access the Dashboards

| Dashboard | URL | Login |
|-----------|-----|-------|
| **Sales** | http://localhost:8080 | `tester` / `tester` |
| **Delivery** | http://localhost:8081 | `tester` / `tester` |

### APIs & Tools

| Service | URL |
|---------|-----|
| Sales API | http://localhost:3000/api/v1 |
| Delivery API | http://localhost:3001/api/v1 |
| RabbitMQ UI | http://localhost:15672 (`admin`/`admin`) |

### Test the Flow

1. **Sales Dashboard** → Create order → See "Pending Shipment"
2. **Delivery Dashboard** → Ship → Deliver
3. **Sales Dashboard** → Verify status updates

### Stop the Platform

```powershell
docker-compose down     # Stop (keeps data)
docker-compose down -v  # Stop + delete data
```

---
