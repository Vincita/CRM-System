import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/dashboardApi';

export const useDashboardStats = (channel?: string | null) => {
  return useQuery({
    queryKey: ['dashboardStats', channel], // Thêm channel vào queryKey để cache riêng
    queryFn: () => {
      // Nếu có channel, truyền vào params
      const params = channel ? { channel } : {};
      return getDashboardStats(params).then(res => res.data);
    },
    staleTime: 2 * 60 * 1000,
  });
};