import axiosClient from './axiosClient';

export interface ProductParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export const getProducts = (params?: ProductParams) => {
  return axiosClient.get('/products', { params });
};

export const getProduct = (id: string) => {
  return axiosClient.get(`/products/${id}`);
};

export const createProduct = (data: any) => {
  return axiosClient.post('/products', data);
};

export const updateProduct = (id: string, data: any) => {
  return axiosClient.put(`/products/${id}`, data);
};

export const deleteProduct = (id: string) => {
  return axiosClient.delete(`/products/${id}`);
};