// Product Service Client - Database Implementation
import { Pool } from 'pg';
import { getPool } from '../../infrastructure/database/connection';

export class ProductServiceClient {
  private pool: Pool;

  constructor() {
    this.pool = getPool();
  }

  async checkAvailability(productId: string, requestedQuantity: number = 1): Promise<boolean> {
    try {
      const query = `
        SELECT quantity 
        FROM products 
        WHERE product_id = $1 AND quantity >= $2
      `;
      const result = await this.pool.query(query, [productId, requestedQuantity]);
      const isAvailable = result.rows.length > 0;
      console.log(`Product availability check: product_id=${productId}, quantity=${requestedQuantity}, available=${isAvailable}`);
      return isAvailable;
    } catch (error) {
      console.error('Error checking product availability:', error);
      throw new Error('Failed to check product availability');
    }
  }

  async getProductDetails(productId: string): Promise<any | null> {
    try {
      const query = 'SELECT * FROM products WHERE product_id = $1';
      const result = await this.pool.query(query, [productId]);
      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error fetching product details:', error);
      return null;
    }
  }
}
