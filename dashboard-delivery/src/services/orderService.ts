import api from './api';
import type { Order, ShipOrderRequest, OrderResponse } from '../types/order';

export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/orders');
  return response.data;
};

export const getOrderById = async (orderId: string): Promise<Order> => {
  const response = await api.get<Order>(`/orders/${orderId}`);
  return response.data;
};

export const markAsShipped = async (orderId: string): Promise<OrderResponse> => {
  const requestData: ShipOrderRequest = {
    tracking_number: `TRACK-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
  };
  
  const response = await api.post<OrderResponse>(`/orders/${orderId}/ship`, requestData);
  return response.data;
};

export const markAsDelivered = async (orderId: string): Promise<OrderResponse> => {
  const response = await api.post<OrderResponse>(`/orders/${orderId}/deliver`);
  return response.data;
};
