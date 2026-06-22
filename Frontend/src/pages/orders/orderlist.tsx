import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import './orderlist.css'; // Import CSS riêng

const OrdersList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [customerSearch, setCustomerSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading, error, refetch } = useOrders({
    page,
    limit,
    customer_id: customerSearch || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  });

  if (isLoading) return <div className="ol-loading">Đang tải danh sách đơn hàng...</div>;
  if (error) return <div className="ol-loading" style={{ color: '#ef4444' }}>Lỗi tải dữ liệu</div>;

  const orders = data?.data || [];
  const total = data?.pagination?.total || data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const clearFilters = () => {
    setCustomerSearch('');
    setFromDate('');
    setToDate('');
    setPage(1);
    refetch();
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="orderlist-page">
      {/* Header */}
      <div className="ol-header">
        <div className="ol-header-left">
          <h1>📋 Danh sách đơn hàng</h1>
          <p>Quản lý tất cả đơn hàng</p>
        </div>
        <button
          onClick={() => navigate('/orders/create')}
          className="btn-ol-primary"
        >
          + Tạo đơn hàng
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="ol-card">
        <div className="ol-card-body">
          <div className="ol-filter-row">
            <div className="ol-filter-group">
              <label>Khách hàng (mã)</label>
              <input
                type="text"
                placeholder="CUSTxxxx..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
            </div>
            <div className="ol-filter-group">
              <label>Từ ngày</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="ol-filter-group">
              <label>Đến ngày</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="ol-filter-actions">
              <button
                onClick={() => { setPage(1); refetch(); }}
                className="btn-ol-primary"
              >
                🔍 Lọc
              </button>
              <button
                onClick={clearFilters}
                className="btn-ol-secondary"
              >
                ✕ Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng đơn hàng */}
      <div className="ol-card">
        <div className="ol-table-wrap">
          <table className="ol-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày tạo</th>
                <th className="text-right">Tổng tiền</th>
                <th className="text-center">Trạng thái</th>
                <th>Kênh</th>
                <th>Thanh toán</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="ol-empty">Chưa có đơn hàng</td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order._id}>
                    <td><span className="order-id">{order._id}</span></td>
                    <td>{order.customer_id}</td>
                    <td>{new Date(order.order_date).toLocaleDateString('vi-VN')}</td>
                    <td className="text-right" style={{ fontWeight: 600 }}>
                      {order.totals_grand_total?.toLocaleString()}đ
                    </td>
                    <td className="text-center">
                      <span className={`ol-status ${
                        order.status === 'completed' ? 'ol-status-completed' :
                        order.status === 'shipped' ? 'ol-status-shipped' :
                        'ol-status-cancelled'
                      }`}>
                        {order.status === 'completed' ? 'Hoàn thành' :
                         order.status === 'shipped' ? 'Đã giao' : 'Đã hủy'}
                      </span>
                    </td>
                    <td style={{ textTransform: 'uppercase' }}>{order.channel}</td>
                    <td>
                      {order.payment_method === 'cod' ? 'COD' :
                       order.payment_method === 'bank_transfer' ? 'Chuyển khoản' :
                       'Thẻ tín dụng'}
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="btn-ol-view"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phân trang */}
      <div className="ol-pagination">
        <div className="ol-pagination-info">
          <div className="ol-pagination-limit">
            <label>Hiển thị</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>dòng</span>
          </div>
          <div className="ol-pagination-stats">
            Trang <strong>{page}</strong> / <strong>{totalPages || 1}</strong> (Tổng <strong>{total}</strong> đơn hàng)
          </div>
        </div>
        <div className="ol-pagination-controls">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="ol-page-btn"
          >
            ◀
          </button>
          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`ol-page-btn ${p === page ? 'active' : ''}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            className="ol-page-btn"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;