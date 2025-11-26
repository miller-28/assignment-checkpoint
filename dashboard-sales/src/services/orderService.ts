import api from './api';
import type { Order, CreateOrderRequest, CreateOrderResponse } from '../types/order';

export const createOrder = async (data: Omit<CreateOrderRequest, 'idempotency_key'>): Promise<CreateOrderResponse> => {
  const requestData: CreateOrderRequest = {
    ...data,
    idempotency_key: crypto.randomUUID(),
  };
  
  const response = await api.post<CreateOrderResponse>('/orders', requestData);
  return response.data;
};

export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/orders');
  return response.data;
};

export const getOrderById = async (orderId: string): Promise<Order> => {
  const response = await api.get<Order>(`/orders/${orderId}`);
  return response.data;
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  await api.delete(`/orders/${orderId}`);
};

export const deleteAllOrders = async (): Promise<void> => {
  await api.delete('/orders');
};
