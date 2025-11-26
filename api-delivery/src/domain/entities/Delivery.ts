// Delivery entity definition
export type DeliveryStatus = 'Processing' | 'Shipped' | 'Delivered';

export interface Delivery {
  delivery_id: string;
  order_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: DeliveryStatus;
  tracking_number?: string;
  created_at: Date;
  shipped_at?: Date;
  delivered_at?: Date;
}

export function validateDelivery(data: Partial<Delivery>): string[] {
  const errors: string[] = [];
  if (!data.order_id) errors.push('order_id is required');
  if (!data.user_id) errors.push('user_id is required');
  if (!data.product_id) errors.push('product_id is required');
  if (!data.quantity || data.quantity < 1) errors.push('quantity must be >= 1');
  return errors;
}

export function validateStatusTransition(currentStatus: DeliveryStatus, newStatus: DeliveryStatus): boolean {
  const validTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
    'Processing': ['Shipped'],
    'Shipped': ['Delivered'],
    'Delivered': []
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
}
