export interface Order {
  order_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  status: 'Pending' | 'Shipped' | 'Delivered';
  tracking_number?: string;
  created_at: string;
  shipped_at?: string;
  delivered_at?: string;
  idempotency_key?: string;
}

export interface ShipOrderRequest {
  tracking_number: string;
}

export interface OrderResponse {
  order_id: string;
  status: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
}
