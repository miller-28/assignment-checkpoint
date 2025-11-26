# Infrastructure Only

Run only infrastructure services (databases, messaging) for local development.

## Services
- PostgreSQL (port 5432)
- Redis (port 6379)
- RabbitMQ (ports 5672, 15672)
- Kafka (ports 9092, 29092)
- Zookeeper (port 2181)

## Usage

```bash
docker-compose -f docker-compose.infra.yml up -d
docker-compose -f docker-compose.infra.yml down
```

## Use Case
Develop APIs locally while using Docker for infrastructure:

```bash
cd dockers
docker-compose -f docker-compose.infra.yml up -d

cd ../api-sales
npm run dev
```
