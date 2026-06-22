import axiosClient from './axiosClient';

export interface CustomerParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const getCustomers = (params?: CustomerParams) => {
  return axiosClient.get('/customers', { params });
};

export const getCustomer = (id: string) => {
  return axiosClient.get(`/customers/${id}`);
};

export const createCustomer = (data: any) => {
  return axiosClient.post('/customers', data);
};

export const updateCustomer = (id: string, data: any) => {
  return axiosClient.put(`/customers/${id}`, data);
};

export const deleteCustomer = (id: string) => {
  return axiosClient.delete(`/customers/${id}`);
};