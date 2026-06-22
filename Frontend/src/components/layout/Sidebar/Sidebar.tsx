import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: '📊 Dashboard', icon: '📊' },
    { path: '/customers', label: '👥 Customers', icon: '👥' },
    { path: '/orders', label: '📋 Đơn hàng', icon: '📋' },
    { path: '/orders/create', label: '🛒 Tạo đơn hàng', icon: '🛒' },
    { path: '/products', label: '📦 Products', icon: '📦' },
    { path: '/inventory', label: '📦 Inventory', icon: '📦' },
    { path: '/powerbi', label: '📈 Power BI Dashboard', icon: '📈' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">🏢 CRM System</div>
        <p>Quản lý khách hàng</p>
      </div>
      <nav>
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-name">👤 {user?.name || 'User'}</span>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;