import axiosClient from './axiosClient';

export const getDashboardStats = (params?: { channel?: string }) => {
  return axiosClient.get('/dashboard/stats', { params });
};