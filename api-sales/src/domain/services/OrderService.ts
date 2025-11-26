// Order service with business logic
import { Order, OrderStatus, validateOrder } from '../entities/Order';
import { IOrderRepository } from '../repositories/IOrderRepository';
import { v4 as uuidv4 } from 'uuid';

export class OrderService {
  constructor(private readonly repo: IOrderRepository) {}

  async createOrder(data: Partial<Order>): Promise<Order> {
    const errors = validateOrder(data);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }
    const order: Order = {
      order_id: uuidv4(),
      user_id: data.user_id!,
      product_id: data.product_id!,
      quantity: data.quantity!,
      status: 'PendingShipment',
      created_at: new Date(),
      idempotency_key: data.idempotency_key,
    };
    return this.repo.create(order);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    return this.repo.updateStatus(orderId, status);
  }
}
