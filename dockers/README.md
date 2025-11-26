# Docker Compose Setup - Order Processing Platform

This directory contains Docker Compose configuration to run the entire Order Processing Platform stack locally.

---

## Services Included

### Infrastructure
- **PostgreSQL** - Database for Sales and Delivery systems (port 5432)
- **Redis** - Cache and session storage (port 6379)
- **RabbitMQ** - Message broker with management UI (ports 5672, 15672)
- **Kafka** - Event streaming platform (ports 9092, 29092)
- **Zookeeper** - Required for Kafka (port 2181)

### Applications
- **Sales API** - Order creation and management (port 3000)
- **Delivery API** - Shipment processing (port 3001)
- **Sales Dashboard** - Vue.js UI for Sales team (port 8080)
- **Delivery Dashboard** - Vue.js UI for Delivery team (port 8081)

---

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 8GB+ RAM available
- Ports 3000, 3001, 5432, 5672, 6379, 8080, 8081, 9092, 15672, 29092 free

---

## Quick Start

### 1. Start All Services

```bash
cd dockers
docker-compose up -d
```

### 2. Check Service Health

```bash
docker-compose ps
```

All services should show `healthy` or `running` status.

### 3. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-sales
docker-compose logs -f api-delivery
docker-compose logs -f rabbitmq
docker-compose logs -f kafka
```

### 4. Stop All Services

```bash
docker-compose down
```

### 5. Stop and Remove Volumes (Clean Slate)

```bash
docker-compose down -v
```

---

## Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Sales Dashboard | http://localhost:8080 | Any username/password (mock) |
| Delivery Dashboard | http://localhost:8081 | Any username/password (mock) |
| Sales API | http://localhost:3000/api/v1 | JWT required |
| Delivery API | http://localhost:3001/api/v1 | JWT required |
| RabbitMQ Management | http://localhost:15672 | admin / admin |
| PostgreSQL | localhost:5432 | postgres / postgres |
| Redis | localhost:6379 | No password |
| Kafka | localhost:29092 (external), kafka:9092 (internal) | - |

---

## Database Access

### Connect to PostgreSQL

```bash
# Using docker exec
docker exec -it postgres-orders psql -U postgres

# From host (if psql installed)
psql -h localhost -p 5432 -U postgres -d sales_db
psql -h localhost -p 5432 -U postgres -d delivery_db
```

### Database Names
- `sales_db` - Sales system database
- `delivery_db` - Delivery system database

### View Tables

```sql
-- Sales database
\c sales_db
\dt

-- Delivery database
\c delivery_db
\dt
```

---

## RabbitMQ Management

Access: http://localhost:15672
- Username: `admin`
- Password: `admin`

### Queues
- `orders.created` - New orders from Sales to Delivery
- `orders.shipped` - Shipment notifications from Delivery to Sales
- `orders.delivered` - Delivery confirmations from Delivery to Sales
- `*.dlq` - Dead letter queues for failed messages

---

## Kafka Topics

### View Topics

```bash
docker exec -it kafka-broker kafka-topics --bootstrap-server localhost:9092 --list
```

### Main Topic
- `order-events` - Order lifecycle events audit trail

### Consume Events

```bash
docker exec -it kafka-broker kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order-events \
  --from-beginning
```

---

## Testing the Platform

### 1. Open Dashboards

- Sales Dashboard: http://localhost:8080
- Delivery Dashboard: http://localhost:8081

### 2. Create an Order (Sales Dashboard)

1. Login with any credentials
2. Fill in order form:
   - Product ID: `prod-123`
   - Quantity: `2`
   - User ID: `user-456`
3. Click "Create Order"
4. Note the Order ID returned

### 3. Process Delivery (Delivery Dashboard)

1. Login with any credentials
2. Find the order in "Pending Shipments"
3. Click "Mark as Shipped"
4. Find it in "In Transit"
5. Click "Mark as Delivered"
6. Find it in "Completed"

### 4. Verify in Sales Dashboard

Refresh the Sales Dashboard to see status updates: Pending Shipment → Shipped → Delivered

---

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs

# Restart specific service
docker-compose restart api-sales

# Rebuild and restart
docker-compose up -d --build api-sales
```

### Database Connection Issues

```bash
# Check Postgres health
docker exec postgres-orders pg_isready -U postgres

# Recreate database
docker-compose down -v
docker-compose up -d postgres
```

### RabbitMQ Connection Issues

```bash
# Check RabbitMQ status
docker exec rabbitmq-broker rabbitmq-diagnostics status

# Restart RabbitMQ
docker-compose restart rabbitmq
```

### Kafka Issues

```bash
# Check Kafka status
docker exec kafka-broker kafka-broker-api-versions --bootstrap-server localhost:9092

# Restart Kafka and Zookeeper
docker-compose restart zookeeper kafka
```

### Port Conflicts

If ports are already in use, modify `docker-compose.yml`:

```yaml
services:
  api-sales:
    ports:
      - "3010:3000"  # Change host port
```

---

## Development Mode

### Run Infrastructure Only

```bash
# Start only databases and messaging
docker-compose up -d postgres redis rabbitmq zookeeper kafka

# Run APIs locally
cd ../api-sales
npm run dev

cd ../api-delivery
npm run dev
```

### Rebuild After Code Changes

```bash
docker-compose up -d --build api-sales api-delivery
docker-compose up -d --build dashboard-sales dashboard-delivery
```

---

## Environment Variables

Edit `docker-compose.yml` to customize:

### Sales API
- `PORT` - API port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Secret for JWT tokens
- `LOG_LEVEL` - Logging level (debug, info, warn, error)

### Delivery API
- `PORT` - API port (default: 3001)
- `ENABLE_AUTO_PROGRESSION` - Auto-progress orders (true/false)
- `AUTO_SHIP_DELAY_MS` - Delay before auto-ship (ms)
- `AUTO_DELIVER_DELAY_MS` - Delay before auto-deliver (ms)

---

## Resource Usage

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 8GB
- Disk: 10GB

**Recommended:**
- CPU: 4 cores
- RAM: 16GB
- Disk: 20GB

---

## Health Checks

All services include health checks:

```bash
# View health status
docker-compose ps

# Detailed health check
docker inspect --format='{{json .State.Health}}' api-sales | jq
```

---

## Volumes

Data is persisted in Docker volumes:

- `postgres_data` - Database data
- `redis_data` - Cache data
- `rabbitmq_data` - Message broker data
- `kafka_data` - Event stream data
- `zookeeper_data` - Kafka coordination data

### Backup Volumes

```bash
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

### Restore Volumes

```bash
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /
```

---

## Network

All services run on a custom bridge network: `order-processing-network`

Services can communicate using container names:
- `postgres:5432`
- `redis:6379`
- `rabbitmq:5672`
- `kafka:9092`
- `api-sales:3000`
- `api-delivery:3001`

---

## Production Considerations

⚠️ **This setup is for development/testing only!**

For production:
1. Use secrets management (not environment variables)
2. Enable SSL/TLS for all services
3. Use proper authentication (not mock)
4. Configure resource limits
5. Set up backups
6. Use managed services (RDS, ElastiCache, MSK)
7. Implement monitoring and alerting
8. Use orchestration (Kubernetes, ECS)

---

## Clean Up

```bash
# Stop all services
docker-compose down

# Remove volumes (data loss!)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Complete cleanup
docker-compose down -v --rmi all --remove-orphans
```
