import axiosClient from './axiosClient';

export interface OrderParams {
  page?: number;
  limit?: number;
  customer_id?: string;
  from?: string; // ngày bắt đầu (ISO)
  to?: string;   // ngày kết thúc (ISO)
}

export const getOrders = (params?: OrderParams) => {
  return axiosClient.get('/orders', { params });
};

export const getOrder = (id: string) => {
  return axiosClient.get(`/orders/${id}`);
};

export const createOrder = (data: any) => {
  return axiosClient.post('/orders', data);
};

export const updateOrderStatus = (id: string, status: string) => {
  return axiosClient.patch(`/orders/${id}/status`, { status });
};