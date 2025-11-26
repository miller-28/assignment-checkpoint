// Order Service - Business Logic
import { Order, OrderStatus, validateOrder, validateStatusTransition } from '../entities/Order';
import { IOrderRepository } from '../repositories/IOrderRepository';

export class OrderService {
  constructor(private orderRepository: IOrderRepository) {}

  async markAsShipped(orderId: string, trackingNumber: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (!validateStatusTransition(order.status, 'Shipped')) {
      throw new Error(`Cannot transition from ${order.status} to Shipped`);
    }

    await this.orderRepository.updateStatus(orderId, 'Shipped', trackingNumber);
  }

  async markAsDelivered(orderId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (!validateStatusTransition(order.status, 'Delivered')) {
      throw new Error(`Cannot transition from ${order.status} to Delivered`);
    }

    await this.orderRepository.updateStatus(orderId, 'Delivered');
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    return await this.orderRepository.findById(orderId);
  }

  async listOrders(status?: OrderStatus): Promise<Order[]> {
    return await this.orderRepository.findAll(status ? { status } : undefined);
  }
}
