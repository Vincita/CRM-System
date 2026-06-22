import React, { useState } from 'react';
import { useDashboardStats } from '../../hooks/useDashboard';
import './dashboard.css';

const Dashboard: React.FC = () => {
  // Đã xóa const { user } = useAuth(); vì không dùng đến
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const { data, isLoading, error, refetch } = useDashboardStats(selectedChannel);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
  };

  // Xử lý click vào kênh: chọn/bỏ chọn
  const handleChannelClick = (channel: string) => {
    if (selectedChannel === channel) {
      setSelectedChannel(null);
      refetch();
    } else {
      setSelectedChannel(channel);
      refetch();
    }
  };

  // Xóa bộ lọc
  const clearFilter = () => {
    setSelectedChannel(null);
    refetch();
  };

  if (isLoading) {
    return <div className="dashboard-loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="dashboard-error">Lỗi khi tải dữ liệu: {(error as any).message}</div>;
  }

  const stats = data?.data || {
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalCustomers: 0,
    newCustomersToday: 0,
    repeatCustomersToday: 0,
    totalProductsSold: 0,
    channels: {},
    activeChannel: null,
  };

  const channelKeys = Object.keys(stats.channels);

  return (
    <div className="fashion-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Fashion CRM</h1>
          <p>Customer 360 Workspace</p>
        </div>
        {/* Đã xóa header-right để không còn Signed in */}
      </div>

      <div className="analytics-title">
        <h2>FASHION CRM ANALYTICS</h2>
        <p>Multichannel Orders Dashboard</p>
        <small>Theo dõi đơn hàng thời trang từ dữ liệu khách hàng CSV, MongoDB và lịch sử hóa đơn.</small>
      </div>

      {/* FILTER BADGE - Hiển thị khi đang lọc */}
      {selectedChannel && (
        <div className="filter-badge">
          <span>🔍 Đang lọc theo kênh: <strong>{selectedChannel.toUpperCase()}</strong></span>
          <button onClick={clearFilter} className="clear-filter-btn">✕ Bỏ lọc</button>
        </div>
      )}

      {/* THỐNG KÊ HÔM NAY */}
      <div className="section-header">
        <h3>📊 Hôm nay</h3>
      </div>
      <div className="stats-grid-4">
        <div className="stat-card highlight">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Doanh thu</h3>
            <p className="stat-value revenue">{formatCurrency(stats.todayRevenue)}</p>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Đơn hàng</h3>
            <p className="stat-value">{stats.todayOrders}</p>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">🆕</div>
          <div className="stat-info">
            <h3>Khách mới</h3>
            <p className="stat-value">{stats.newCustomersToday}</p>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <h3>Khách cũ quay lại</h3>
            <p className="stat-value">{stats.repeatCustomersToday}</p>
          </div>
        </div>
      </div>

      {/* TỔNG QUAN */}
      <div className="section-header">
        <h3>📈 Tổng quan</h3>
      </div>
      <div className="stats-grid-4">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Tổng khách hàng</h3>
            <p className="stat-value">{stats.totalCustomers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>Tổng đơn hàng</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Tổng doanh thu</h3>
            <p className="stat-value revenue">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Sản phẩm đã bán</h3>
            <p className="stat-value">{stats.totalProductsSold}</p>
          </div>
        </div>
      </div>

      {/* THỐNG KÊ THEO KÊNH */}
      <div className="section-header">
        <h3>📱 Thống kê theo kênh</h3>
        <p className="section-subtitle">Bấm vào kênh để lọc dữ liệu</p>
      </div>
      <div className="channels-grid">
        {channelKeys.length === 0 ? (
          <p>Chưa có dữ liệu kênh</p>
        ) : (
          channelKeys.map((channel) => (
            <div
              key={channel}
              className={`channel-card ${selectedChannel === channel ? 'active' : ''}`}
              onClick={() => handleChannelClick(channel)}
            >
              <div className="channel-icon">📱</div>
              <div className="channel-info">
                <h4>{channel.toUpperCase()}</h4>
                <p className="channel-count">{stats.channels[channel]} đơn</p>
              </div>
              {selectedChannel === channel && (
                <div className="channel-active-badge">✓</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Nếu đang lọc, hiển thị nút xem tất cả */}
      {selectedChannel && (
        <div className="view-all-container">
          <button onClick={clearFilter} className="view-all-btn">
            📊 Xem tất cả kênh
          </button>
        </div>
      )}

      <div className="dashboard-footer">
        <p>© 2025 Fashion CRM — Customer 360 Workspace</p>
      </div>
    </div>
  );
};

export default Dashboard;