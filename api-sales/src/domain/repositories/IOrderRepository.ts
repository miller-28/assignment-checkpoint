// Order repository interface
import { Order, OrderStatus } from '../entities/Order';

export interface IOrderRepository {
  create(order: Order): Promise<Order>;
  findById(orderId: string): Promise<Order | null>;
  updateStatus(orderId: string, status: OrderStatus): Promise<void>;
}
