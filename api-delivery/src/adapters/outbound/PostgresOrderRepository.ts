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

  async findById(orderId: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE order_id = $1';
    const result = await this.pool.query(query, [orderId]);
    
    if (result.rows.length === 0) return null;
    return this.mapRowToOrder(result.rows[0]);
  }

  async findAll(filters?: { status?: OrderStatus }): Promise<Order[]> {
    let query = 'SELECT * FROM orders';
    const values: any[] = [];
    
    if (filters?.status) {
      query += ' WHERE status = $1';
      values.push(filters.status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await this.pool.query(query, values);
    return result.rows.map(row => this.mapRowToOrder(row));
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    tracking?: string
  ): Promise<void> {
    let query = 'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP';
    const values: any[] = [status];
    
    if (status === 'Shipped' && tracking) {
      query += `, shipped_at = CURRENT_TIMESTAMP, tracking_number = $2 WHERE order_id = $3`;
      values.push(tracking, orderId);
    } else if (status === 'Shipped') {
      query += `, shipped_at = CURRENT_TIMESTAMP WHERE order_id = $2`;
      values.push(orderId);
    } else if (status === 'Delivered') {
      query += `, delivered_at = CURRENT_TIMESTAMP WHERE order_id = $2`;
      values.push(orderId);
    } else {
      query += ` WHERE order_id = $2`;
      values.push(orderId);
    }
    
    await this.pool.query(query, values);
  }

  private mapRowToOrder(row: any): Order {
    return {
      order_id: row.order_id,
      user_id: row.user_id,
      product_id: row.product_id,
      quantity: row.quantity,
      status: row.status,
      tracking_number: row.tracking_number,
      created_at: row.created_at,
      shipped_at: row.shipped_at,
      delivered_at: row.delivered_at,
    };
  }
}
