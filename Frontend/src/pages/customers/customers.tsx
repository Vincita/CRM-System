import { useState, useEffect } from 'react';
import { useCustomers, useDeleteCustomer, useCreateCustomer, useUpdateCustomer } from '../../hooks/useCustomers';
import './customers.css'; // Import CSS riêng

export const CustomersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(15); // mặc định 15
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    birth_date: '',
    province: '',
    district: '',
    address: '',
  });

  const { data, isLoading, error, refetch } = useCustomers({ page, limit, search });
  const deleteMutation = useDeleteCustomer();
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  useEffect(() => {
    if (modalMode === 'create') {
      setFormData({
        name: '',
        email: '',
        phone: '',
        gender: '',
        birth_date: '',
        province: '',
        district: '',
        address: '',
      });
    } else if (modalMode === 'edit' && selectedCustomer) {
      setFormData({
        name: selectedCustomer.name || '',
        email: selectedCustomer.email || '',
        phone: selectedCustomer.phone || '',
        gender: selectedCustomer.gender || '',
        birth_date: selectedCustomer.birth_date || '',
        province: selectedCustomer.province || '',
        district: selectedCustomer.district || '',
        address: selectedCustomer.address || '',
      });
    }
  }, [modalMode, selectedCustomer]);

  const handleDelete = (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa khách hàng này?')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        refetch();
        alert('✅ Xóa khách hàng thành công!');
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || error.message || 'Xóa thất bại';
        alert('❌ ' + message);
      },
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const openModal = (customer: any, mode: 'view' | 'edit' | 'create') => {
    setSelectedCustomer(customer);
    setModalMode(mode);
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setModalMode(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert('Vui lòng nhập tên và email (bắt buộc)');
      return;
    }
    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync(formData);
        alert('✅ Thêm khách hàng thành công!');
      } else if (modalMode === 'edit' && selectedCustomer) {
        await updateMutation.mutateAsync({ id: selectedCustomer.id, data: formData });
        alert('✅ Cập nhật khách hàng thành công!');
      }
      refetch();
      closeModal();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Lỗi không xác định';
      alert('❌ ' + message);
    }
  };

  if (isLoading) return <div className="cu-loading">Đang tải danh sách khách hàng...</div>;
  if (error) return <div className="cu-loading" style={{ color: '#ef4444' }}>Lỗi tải dữ liệu</div>;

  const customers = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

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

  const getSegmentClass = (segment: string) => {
    const s = segment?.toLowerCase() || '';
    if (s === 'vip') return 'cu-segment-vip';
    if (s === 'vàng' || s === 'vang') return 'cu-segment-vang';
    if (s === 'bạc' || s === 'bac') return 'cu-segment-bac';
    return 'cu-segment-thuong';
  };

  return (
    <div className="customers-page">
      {/* Header riêng */}
      <div className="cu-header">
        <div className="cu-header-left">
          <h1>👥 Danh sách khách hàng</h1>
          <p>Quản lý thông tin và phân loại khách hàng</p>
        </div>
        <button
          type="button"
          onClick={() => openModal(null, 'create')}
          className="btn-cu-primary"
        >
          + Thêm mới
        </button>
      </div>

      {/* Search */}
      <div className="cu-search-card">
        <div className="cu-search-body">
          <form onSubmit={handleSearch} className="cu-search-row">
            <div className="cu-search-group">
              <label>Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="cu-search-actions">
              <button type="submit" className="btn-cu-primary">
                🔍 Tìm kiếm
              </button>
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(1); refetch(); }}
                className="btn-cu-secondary"
              >
                ✕ Xóa tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bảng */}
      <div className="cu-table-card">
        <div className="cu-table-wrap">
          <table className="cu-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên</th>
                <th>Email</th>
                <th>SĐT</th>
                <th>Phân khúc</th>
                <th className="text-right">Tổng chi</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="cu-empty">Không có khách hàng nào</td>
                </tr>
              ) : (
                customers.map((c: any) => (
                  <tr key={c.id}>
                    <td><span className="code">{c.code}</span></td>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || '—'}</td>
                    <td>
                      <span className={`cu-segment ${getSegmentClass(c.segment)}`}>
                        {c.segment || 'Thường'}
                      </span>
                    </td>
                    <td className="text-right" style={{ fontWeight: 500 }}>
                      {c.lifetime_value?.toLocaleString() || 0}
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => openModal(c, 'view')}
                        className="cu-action-btn view"
                        title="Xem"
                      >
                        👁️
                      </button>
                      <button
                        type="button"
                        onClick={() => openModal(c, 'edit')}
                        className="cu-action-btn edit"
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        disabled={deleteMutation.isPending}
                        className="cu-action-btn delete"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="cu-pagination">
        <div className="cu-pagination-info">
          <div className="cu-pagination-limit">
            <label>Hiển thị</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>dòng</span>
          </div>
          <div className="cu-pagination-stats">
            Hiển thị <strong>{customers.length}</strong> / <strong>{total}</strong> khách hàng
          </div>
        </div>
        <div className="cu-pagination-controls">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="cu-page-btn"
          >
            ◀
          </button>
          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`cu-page-btn ${p === page ? 'active' : ''}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            className="cu-page-btn"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Modal (giữ nguyên logic) */}
      {modalMode && (
        <div className="modal cu-modal-override">
          <div className="modal-inner">
            <h3>
              {modalMode === 'view' && 'Thông tin khách hàng'}
              {modalMode === 'edit' && 'Chỉnh sửa khách hàng'}
              {modalMode === 'create' && 'Thêm khách hàng mới'}
            </h3>
            {modalMode === 'view' && selectedCustomer && (
              <div className="edit-form" style={{ gap: '6px' }}>
                <p><strong>Mã:</strong> {selectedCustomer.code}</p>
                <p><strong>Tên:</strong> {selectedCustomer.name}</p>
                <p><strong>Email:</strong> {selectedCustomer.email}</p>
                <p><strong>SĐT:</strong> {selectedCustomer.phone || '—'}</p>
                <p><strong>Giới tính:</strong> {selectedCustomer.gender || '—'}</p>
                <p><strong>Ngày sinh:</strong> {selectedCustomer.birth_date || '—'}</p>
                <p><strong>Tỉnh:</strong> {selectedCustomer.province || '—'}</p>
                <p><strong>Quận/Huyện:</strong> {selectedCustomer.district || '—'}</p>
                <p><strong>Địa chỉ:</strong> {selectedCustomer.address || '—'}</p>
                <p><strong>Phân khúc:</strong> {selectedCustomer.segment || 'Thường'}</p>
                <p><strong>Tổng chi:</strong> {selectedCustomer.lifetime_value?.toLocaleString() || 0}</p>
              </div>
            )}
            {(modalMode === 'edit' || modalMode === 'create') && (
              <div className="edit-form">
                <input
                  type="text"
                  name="name"
                  placeholder="Tên *"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="gender"
                  placeholder="Giới tính"
                  value={formData.gender}
                  onChange={handleInputChange}
                />
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="province"
                  placeholder="Tỉnh/Thành phố"
                  value={formData.province}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="district"
                  placeholder="Quận/Huyện"
                  value={formData.district}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Địa chỉ chi tiết"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            )}
            <div className="modal-buttons">
              {modalMode !== 'view' && (
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSave}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              )}
              <button type="button" className="cancel-btn" onClick={closeModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};