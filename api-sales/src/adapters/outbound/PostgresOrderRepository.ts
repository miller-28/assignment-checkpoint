// PostgreSQL Order Repository Implementation
import { Pool } from 'pg';
import { Order, OrderStatus } from '../../domain/entities/Order';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository';
import { getPool } from '../../infrastructure/database/connection';

export class PostgresOrderRepository implements IOrderRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async create(order: Order): Promise<Order> {
    const query = `
      INSERT INTO orders (order_id, user_id, product_id, quantity, status, created_at, idempotency_key)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      order.order_id,
      order.user_id,
      order.product_id,
      order.quantity,
      order.status,
      order.created_at,
      order.idempotency_key,
    ];
    const result = await this.pool.query(query, values);
    return this.mapRowToOrder(result.rows[0]);
  }

  async findById(orderId: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE order_id = $1';
    const result = await this.pool.query(query, [orderId]);
    if (result.rows.length === 0) return null;
    return this.mapRowToOrder(result.rows[0]);
  }

  async findAll(): Promise<Order[]> {
    const query = 'SELECT * FROM orders ORDER BY created_at DESC';
    const result = await this.pool.query(query);
    return result.rows.map(row => this.mapRowToOrder(row));
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<void> {
    const timestampField = status === 'Shipped' ? 'shipped_at' : status === 'Delivered' ? 'delivered_at' : null;
    let query = `UPDATE orders SET status = $1`;
    const values: any[] = [status, orderId];
    
    if (timestampField) {
      query += `, ${timestampField} = CURRENT_TIMESTAMP`;
    }
    query += ` WHERE order_id = $2`;
    
    await this.pool.query(query, values);
  }

  async deleteById(orderId: string): Promise<void> {
    const query = 'DELETE FROM orders WHERE order_id = $1';
    await this.pool.query(query, [orderId]);
  }

  async delete(orderId: string): Promise<void> {
    const query = 'DELETE FROM orders WHERE order_id = $1';
    await this.pool.query(query, [orderId]);
  }

  async deleteAll(): Promise<void> {
    const query = 'DELETE FROM orders';
    await this.pool.query(query);
  }

  private mapRowToOrder(row: any): Order {
    return {
      order_id: row.order_id,
      user_id: row.user_id,
      product_id: row.product_id,
      quantity: row.quantity,
      status: row.status,
      created_at: row.created_at,
      shipped_at: row.shipped_at,
      delivered_at: row.delivered_at,
      idempotency_key: row.idempotency_key,
    };
  }
}
