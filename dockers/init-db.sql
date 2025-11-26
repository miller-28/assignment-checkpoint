-- Create databases for Sales and Delivery systems
CREATE DATABASE sales_db;
CREATE DATABASE delivery_db;

-- Connect to sales_db and create schema
\c sales_db;

-- Orders table for Sales system
CREATE TABLE IF NOT EXISTS orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(50) NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_idempotency ON orders(idempotency_key);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Processed events table for idempotency
CREATE TABLE IF NOT EXISTS processed_events (
    event_id VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    order_id UUID NOT NULL,
    processed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_processed_events_order_id ON processed_events(order_id);
CREATE INDEX idx_processed_events_type ON processed_events(event_type);

-- Connect to delivery_db and create schema
\c delivery_db;

-- Deliveries table for Delivery system
CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL,
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(50) NOT NULL,
    tracking_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for deliveries
CREATE INDEX idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_tracking ON deliveries(tracking_number);
CREATE INDEX idx_deliveries_created_at ON deliveries(created_at DESC);

-- Processed events table for idempotency
CREATE TABLE IF NOT EXISTS processed_events (
    event_id VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    order_id UUID NOT NULL,
    processed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_processed_events_order_id ON processed_events(order_id);
CREATE INDEX idx_processed_events_type ON processed_events(event_type);

-- Grant permissions
\c sales_db;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

\c delivery_db;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
