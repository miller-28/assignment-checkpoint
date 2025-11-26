// Delivery Service - Business Logic
import { Delivery, DeliveryStatus, validateDelivery, validateStatusTransition } from '../entities/Delivery';
import { IDeliveryRepository } from '../repositories/IDeliveryRepository';
import { v4 as uuidv4 } from 'uuid';

export class DeliveryService {
  constructor(private deliveryRepository: IDeliveryRepository) {}

  async createDelivery(orderData: {
    order_id: string;
    user_id: string;
    product_id: string;
    quantity: number;
  }): Promise<Delivery> {
    // Validate input
    const errors = validateDelivery(orderData);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Check if delivery already exists for this order (idempotency)
    const existingDelivery = await this.deliveryRepository.findByOrderId(orderData.order_id);
    if (existingDelivery) {
      return existingDelivery;
    }

    // Create new delivery
    const delivery: Delivery = {
      delivery_id: uuidv4(),
      order_id: orderData.order_id,
      user_id: orderData.user_id,
      product_id: orderData.product_id,
      quantity: orderData.quantity,
      status: 'Processing',
      created_at: new Date(),
    };

    return await this.deliveryRepository.create(delivery);
  }

  async markAsShipped(deliveryId: string, trackingNumber: string): Promise<void> {
    const delivery = await this.deliveryRepository.findById(deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }

    if (!validateStatusTransition(delivery.status, 'Shipped')) {
      throw new Error(`Cannot transition from ${delivery.status} to Shipped`);
    }

    await this.deliveryRepository.updateStatus(deliveryId, 'Shipped', trackingNumber);
  }

  async markAsDelivered(deliveryId: string): Promise<void> {
    const delivery = await this.deliveryRepository.findById(deliveryId);
    if (!delivery) {
      throw new Error('Delivery not found');
    }

    if (!validateStatusTransition(delivery.status, 'Delivered')) {
      throw new Error(`Cannot transition from ${delivery.status} to Delivered`);
    }

    await this.deliveryRepository.updateStatus(deliveryId, 'Delivered');
  }

  async getDeliveryById(deliveryId: string): Promise<Delivery | null> {
    return await this.deliveryRepository.findById(deliveryId);
  }

  async listDeliveries(status?: DeliveryStatus): Promise<Delivery[]> {
    return await this.deliveryRepository.findAll(status ? { status } : undefined);
  }
}
