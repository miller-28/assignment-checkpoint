// PostgreSQL Delivery Repository Implementation
import { Pool } from 'pg';
import { Delivery, DeliveryStatus } from '../../domain/entities/Delivery';
import { IDeliveryRepository } from '../../domain/repositories/IDeliveryRepository';
import { getPool } from '../../infrastructure/database/connection';

export class PostgresDeliveryRepository implements IDeliveryRepository {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async create(delivery: Delivery): Promise<Delivery> {
    const query = `
      INSERT INTO deliveries (
        delivery_id, order_id, user_id, product_id, quantity, 
        status, tracking_number, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      delivery.delivery_id,
      delivery.order_id,
      delivery.user_id,
      delivery.product_id,
      delivery.quantity,
      delivery.status,
      delivery.tracking_number || null,
      delivery.created_at,
    ];
    
    const result = await this.pool.query(query, values);
    return this.mapRowToDelivery(result.rows[0]);
  }

  async findById(deliveryId: string): Promise<Delivery | null> {
    const query = 'SELECT * FROM deliveries WHERE delivery_id = $1';
    const result = await this.pool.query(query, [deliveryId]);
    
    if (result.rows.length === 0) return null;
    return this.mapRowToDelivery(result.rows[0]);
  }

  async findByOrderId(orderId: string): Promise<Delivery | null> {
    const query = 'SELECT * FROM deliveries WHERE order_id = $1';
    const result = await this.pool.query(query, [orderId]);
    
    if (result.rows.length === 0) return null;
    return this.mapRowToDelivery(result.rows[0]);
  }

  async findAll(filters?: { status?: DeliveryStatus }): Promise<Delivery[]> {
    let query = 'SELECT * FROM deliveries';
    const values: any[] = [];
    
    if (filters?.status) {
      query += ' WHERE status = $1';
      values.push(filters.status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await this.pool.query(query, values);
    return result.rows.map(row => this.mapRowToDelivery(row));
  }

  async updateStatus(
    deliveryId: string,
    status: DeliveryStatus,
    tracking?: string
  ): Promise<void> {
    let query = 'UPDATE deliveries SET status = $1, updated_at = CURRENT_TIMESTAMP';
    const values: any[] = [status];
    
    if (status === 'Shipped' && tracking) {
      query += `, shipped_at = CURRENT_TIMESTAMP, tracking_number = $2 WHERE delivery_id = $3`;
      values.push(tracking, deliveryId);
    } else if (status === 'Shipped') {
      query += `, shipped_at = CURRENT_TIMESTAMP WHERE delivery_id = $2`;
      values.push(deliveryId);
    } else if (status === 'Delivered') {
      query += `, delivered_at = CURRENT_TIMESTAMP WHERE delivery_id = $2`;
      values.push(deliveryId);
    } else {
      query += ` WHERE delivery_id = $2`;
      values.push(deliveryId);
    }
    
    await this.pool.query(query, values);
  }

  private mapRowToDelivery(row: any): Delivery {
    return {
      delivery_id: row.delivery_id,
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
