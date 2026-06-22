import axios from 'axios';

// Lấy baseURL từ biến môi trường (tạo file .env ở root nếu chưa có)
const baseURL = import.meta.env.VITE_API_URL || 'https://crm-demo-be.vercel.app/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: tự động gắn token nếu có (dành cho xác thực sau)
axiosClient.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        // bỏ qua nếu không parse được
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosClient;