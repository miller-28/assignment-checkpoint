# UML Diagrams - Order Processing Integration

This directory contains PlantUML diagrams documenting the system architecture and flows for the Order Processing Integration platform.

## Diagrams

### 1. Component Diagram
**File:** `component-diagram.puml`

Shows the high-level architecture including:
- Sales and Delivery APIs (Fastify with Hexagonal Architecture)
- AWS ALB (Load Balancer)
- RabbitMQ message queues with DLQ
- Kafka event streaming
- PostgreSQL databases
- Redis for sessions/caching
- OAuth2 authentication
- Observability stack (Prometheus, Grafana, ELK)

### 2. Order Creation Sequence
**File:** `sequence-order-creation.puml`

Illustrates the complete flow for creating a new order:
1. Customer request with JWT authentication
2. Input validation
3. Product availability check
4. Database transaction
5. Publishing to RabbitMQ and Kafka
6. Delivery system consumption

### 3. Order Shipment & Delivery Sequence
**File:** `sequence-order-shipment.puml`

Shows the order lifecycle after creation:
1. Delivery processing and status update to "Shipped"
2. Publishing shipment events to RabbitMQ and Kafka
3. Sales API consuming and updating order status
4. Final delivery confirmation
5. Complete audit trail in Kafka

### 4. Error Handling & Retry Sequence
**File:** `sequence-error-handling.puml`

Demonstrates reliability mechanisms:
1. Message retry logic with exponential backoff (3 attempts)
2. Dead Letter Queue (DLQ) for failed messages
3. Circuit breaker pattern for external services
4. Idempotency checks to prevent duplicate processing
5. Monitoring alerts for failures

## How to View/Generate Diagrams

### Option 1: VS Code Extension
1. Install "PlantUML" extension in VS Code
2. Open any `.puml` file
3. Press `Alt+D` to preview or `Ctrl+Shift+P` → "PlantUML: Export Current Diagram"

### Option 2: Online Viewer
Visit [PlantUML Online Editor](https://www.plantuml.com/plantuml/uml/) and paste the content.

### Option 3: Command Line (with Java & Graphviz installed)
```bash
# Install PlantUML
# Download plantuml.jar from https://plantuml.com/download

# Generate PNG
java -jar plantuml.jar component-diagram.puml

# Generate SVG
java -jar plantuml.jar -tsvg component-diagram.puml

# Generate all diagrams
java -jar plantuml.jar docs/uml/*.puml
```

### Option 4: Docker
```bash
# Generate all diagrams as PNG
docker run --rm -v ${PWD}/docs/uml:/data plantuml/plantuml:latest -tpng /data/*.puml

# Generate as SVG
docker run --rm -v ${PWD}/docs/uml:/data plantuml/plantuml:latest -tsvg /data/*.puml
```

## Diagram Outputs

Generated diagram files (PNG/SVG) can be included in the design document PDF for submission.

## Related Documentation

- Main design document: `../../design-system.md`
- Product requirements: `../../Product Requirements Document - Order Processing Integration.md`
- Assignment details: `../../Homework Assignment.md`

## Notes

- All diagrams follow the architecture specified in `design-system.md`
- Sequences demonstrate both happy path and error scenarios
- Component diagram shows all infrastructure and application components
- Diagrams align with PRD functional and non-functional requirements
