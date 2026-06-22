import './App.css';
import './pages/dashboard/dashboard.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';
import MainLayout from './components/layout/MainLayout/MainLayout';
import SimpleLayout from './components/layout/SimpleLayout/SimpleLayout';

import Dashboard from './pages/dashboard/dashboard';
import { CustomersPage as Customers } from './pages/customers/customers';
import Products from './pages/products/products';
import Inventory from './pages/inventory/inventory';
import Login from './pages/login/login';
import PowerBI from './pages/powerbi/powerbi';
import CreateOrder from './pages/orders/createorder';
import OrdersList from './pages/orders/orderlist';
import OrderDetail from './pages/orders/orderdetail';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          <Route element={<PrivateRoute />}>
            {/* Trang chủ và Dashboard giữ MainLayout (có header) */}
            <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />

            {/* Các trang dùng SimpleLayout (không header toàn cục) */}
            <Route path="/customers" element={<SimpleLayout><Customers /></SimpleLayout>} />
            <Route path="/products" element={<SimpleLayout><Products /></SimpleLayout>} />
            <Route path="/orders" element={<SimpleLayout><OrdersList /></SimpleLayout>} />
            <Route path="/orders/create" element={<SimpleLayout><CreateOrder /></SimpleLayout>} />
            <Route path="/orders/:id" element={<SimpleLayout><OrderDetail /></SimpleLayout>} />

            {/* Các trang khác vẫn giữ MainLayout (có header) */}
            <Route path="/inventory" element={<MainLayout><Inventory /></MainLayout>} />
            <Route path="/powerbi" element={<SimpleLayout><PowerBI /></SimpleLayout>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;