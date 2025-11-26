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
