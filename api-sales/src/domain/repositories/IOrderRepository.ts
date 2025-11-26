// Order repository interface
import { Order, OrderStatus } from '../entities/Order';

export interface IOrderRepository {
  create(order: Order): Promise<Order>;
  findById(orderId: string): Promise<Order | null>;
  findAll(): Promise<Order[]>;
  updateStatus(orderId: string, status: OrderStatus): Promise<void>;
  delete(orderId: string): Promise<void>;
  deleteAll(): Promise<void>;
}
