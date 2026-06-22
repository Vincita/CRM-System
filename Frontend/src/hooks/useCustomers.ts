import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../api/customerApi';

// Hook lấy danh sách khách hàng (có phân trang và tìm kiếm)
export const useCustomers = (params?: any) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => getCustomers(params).then(res => res.data),
    staleTime: 5 * 60 * 1000, // 5 phút
  });
};

// Hook lấy chi tiết một khách hàng
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomer(id).then(res => res.data),
    enabled: !!id, // chỉ chạy khi có id
  });
};

// Hook tạo mới khách hàng
export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      // Invalidate danh sách để refresh
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

// Hook cập nhật khách hàng
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCustomer(id, data),
    onSuccess: (_, variables) => {
      // Invalidate cả danh sách và chi tiết
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] });
    },
  });
};

// Hook xóa khách hàng
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};