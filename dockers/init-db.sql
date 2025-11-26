-- Create single database for the entire platform
CREATE DATABASE ecommerce_db;

-- Connect to ecommerce_db and create schema
\c ecommerce_db;

-- Products table for inventory management
CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    sku VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for products
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_quantity ON products(quantity);

-- Insert sample products for testing
INSERT INTO products (product_id, name, description, price, quantity, sku) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Laptop Pro 15', 'High-performance laptop with 16GB RAM', 1299.99, 50, 'LAP-PRO-15'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Wireless Mouse', 'Ergonomic wireless mouse with USB receiver', 29.99, 200, 'MOU-WRL-01'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Mechanical Keyboard', 'RGB mechanical keyboard with Cherry MX switches', 159.99, 75, 'KEY-MCH-RGB'),
    ('550e8400-e29b-41d4-a716-446655440004', 'USB-C Hub', '7-in-1 USB-C hub with HDMI and Ethernet', 49.99, 150, 'HUB-USBC-7'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Webcam 4K', '4K webcam with auto-focus and noise cancellation', 89.99, 0, 'CAM-4K-PRO');

-- Orders table - single source of truth for all orders
CREATE TABLE IF NOT EXISTS orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(50) NOT NULL,
    tracking_number VARCHAR(100),
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
CREATE INDEX idx_orders_tracking ON orders(tracking_number);
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

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
