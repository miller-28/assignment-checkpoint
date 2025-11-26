// Delivery Repository Interface
import { Delivery, DeliveryStatus } from '../entities/Delivery';

export interface IDeliveryRepository {
  create(delivery: Delivery): Promise<Delivery>;
  findById(deliveryId: string): Promise<Delivery | null>;
  findByOrderId(orderId: string): Promise<Delivery | null>;
  findAll(filters?: { status?: DeliveryStatus }): Promise<Delivery[]>;
  updateStatus(deliveryId: string, status: DeliveryStatus, tracking?: string): Promise<void>;
}
