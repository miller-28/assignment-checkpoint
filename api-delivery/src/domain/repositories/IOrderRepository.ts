// Order Repository Interface
import { Order, OrderStatus } from '../entities/Order';

export interface IOrderRepository {
  findById(orderId: string): Promise<Order | null>;
  findAll(filters?: { status?: OrderStatus }): Promise<Order[]>;
  updateStatus(orderId: string, status: OrderStatus, tracking?: string): Promise<void>;
}
