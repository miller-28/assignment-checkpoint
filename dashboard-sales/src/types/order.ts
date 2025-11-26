export interface Order {
  order_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: 'PendingShipment' | 'Shipped' | 'Delivered';
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  idempotency_key?: string;
}

export interface CreateOrderRequest {
  user_id: string;
  product_id: string;
  quantity: number;
  idempotency_key: string;
}

export interface CreateOrderResponse {
  order_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: string;
  created_at: string;
}
