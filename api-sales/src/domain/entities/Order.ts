// Order entity definition
export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered';

export interface Order {
  order_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: OrderStatus;
  created_at: Date;
  shipped_at?: Date;
  delivered_at?: Date;
  idempotency_key?: string;
}

export function validateOrder(data: Partial<Order>): string[] {
  const errors: string[] = [];
  if (!data.user_id) errors.push('user_id is required');
  if (!data.product_id) errors.push('product_id is required');
  if (!data.quantity || data.quantity < 1) errors.push('quantity must be >= 1');
  return errors;
}
