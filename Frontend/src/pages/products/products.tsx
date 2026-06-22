import { useState, useEffect } from 'react';
import { useProducts, useDeleteProduct, useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';
import './products.css';

export const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create' | null>(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: '',
    material: '',
    color: '',
    sizes: '',
    cost_price: 0,
    sale_price: 0,
    stock: 0,
    status: 'active',
  });

  const { data, isLoading, error, refetch } = useProducts({ page, limit, search });
  const deleteMutation = useDeleteProduct();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  // Lấy total từ pagination
  const products = data?.data || [];
  const total = data?.pagination?.total || data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    if (modalMode === 'create') {
      setFormData({
        sku: '',
        name: '',
        category: '',
        material: '',
        color: '',
        sizes: '',
        cost_price: 0,
        sale_price: 0,
        stock: 0,
        status: 'active',
      });
    } else if (modalMode === 'edit' && selectedProduct) {
      setFormData({
        sku: selectedProduct.sku || '',
        name: selectedProduct.name || '',
        category: selectedProduct.category || '',
        material: selectedProduct.material || '',
        color: selectedProduct.color || '',
        sizes: selectedProduct.sizes || '',
        cost_price: selectedProduct.cost_price || 0,
        sale_price: selectedProduct.sale_price || 0,
        stock: selectedProduct.stock || 0,
        status: selectedProduct.status || 'active',
      });
    }
  }, [modalMode, selectedProduct]);

  const handleDelete = (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        refetch();
        alert('✅ Xóa sản phẩm thành công!');
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

  const openModal = (product: any, mode: 'view' | 'edit' | 'create') => {
    setSelectedProduct(product);
    setModalMode(mode);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setModalMode(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'cost_price' || name === 'sale_price' || name === 'stock' ? Number(value) : value }));
  };

  const handleSave = async () => {
    if (!formData.sku || !formData.name) {
      alert('Vui lòng nhập SKU và tên sản phẩm (bắt buộc)');
      return;
    }
    try {
      if (modalMode === 'create') {
        await createMutation.mutateAsync(formData);
        alert('✅ Thêm sản phẩm thành công!');
      } else if (modalMode === 'edit' && selectedProduct) {
        await updateMutation.mutateAsync({ id: selectedProduct._id, data: formData });
        alert('✅ Cập nhật sản phẩm thành công!');
      }
      refetch();
      closeModal();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Lỗi không xác định';
      alert('❌ ' + message);
    }
  };

  if (isLoading) return <div className="pr-loading" style={{ padding: '20px', textAlign: 'center' }}>Đang tải danh sách sản phẩm...</div>;
  if (error) return <div className="pr-loading" style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>Lỗi tải dữ liệu</div>;

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
    <div className="products-page">
      {/* Header riêng */}
      <div className="pr-header">
        <div className="pr-header-left">
          <h1>📦 Quản lý sản phẩm</h1>
          <p>Quản lý thông tin sản phẩm trong hệ thống</p>
        </div>
        <button
          type="button"
          onClick={() => openModal(null, 'create')}
          className="btn-pr-primary"
        >
          + Thêm mới
        </button>
      </div>

      {/* Search */}
      <div className="pr-search-card">
        <div className="pr-search-body">
          <form onSubmit={handleSearch} className="pr-search-row">
            <div className="pr-search-group">
              <label>Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tìm theo tên sản phẩm, danh mục..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="pr-search-actions">
              <button type="submit" className="btn-pr-primary">
                🔍 Tìm kiếm
              </button>
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(1); refetch(); }}
                className="btn-pr-secondary"
              >
                ✕ Xóa tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bảng */}
      <div className="pr-table-card">
        <div className="pr-table-wrap">
          <table className="pr-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th className="text-right">Giá bán</th>
                <th className="text-right">Tồn kho</th>
                <th>Trạng thái</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Không có sản phẩm nào</td>
                </tr>
              ) : (
                products.map((p: any) => (
                  <tr key={p._id}>
                    <td><strong>{p.sku}</strong></td>
                    <td>{p.name}</td>
                    <td>{p.category || '—'}</td>
                    <td className="text-right" style={{ fontWeight: 500 }}>{p.sale_price?.toLocaleString()}đ</td>
                    <td className="text-right" style={{ fontWeight: 500 }}>{p.stock}</td>
                    <td>
                      <span className={`pr-status ${p.status === 'active' ? 'pr-status-active' : 'pr-status-inactive'}`}>
                        {p.status === 'active' ? 'Đang bán' : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => openModal(p, 'edit')}
                        className="pr-action-btn edit"
                        title="Sửa"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p._id)}
                        disabled={deleteMutation.isPending}
                        className="pr-action-btn delete"
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
      <div className="pr-pagination">
        <div className="pr-pagination-info">
          <div className="pr-pagination-limit">
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
            <span>sản phẩm</span>
          </div>
          <div className="pr-pagination-stats">
            Trang <strong>{page}</strong> / <strong>{totalPages || 1}</strong> (Tổng <strong>{total}</strong> sản phẩm)
          </div>
        </div>
        <div className="pr-pagination-controls">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="pr-page-btn"
          >
            ◀
          </button>
          {getPageNumbers().map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`pr-page-btn ${p === page ? 'active' : ''}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            className="pr-page-btn"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Modal thêm/sửa */}
      {modalMode && (
        <div className="modal pr-modal-override">
          <div className="modal-inner">
            <h3>
              {modalMode === 'edit' ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            <div className="edit-form">
              <input
                type="text"
                name="sku"
                placeholder="SKU *"
                value={formData.sku}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="name"
                placeholder="Tên sản phẩm *"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="category"
                placeholder="Danh mục"
                value={formData.category}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="material"
                placeholder="Chất liệu"
                value={formData.material}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="color"
                placeholder="Màu sắc"
                value={formData.color}
                onChange={handleInputChange}
              />
              <input
                type="text"
                name="sizes"
                placeholder="Kích thước (vd: S,M,L)"
                value={formData.sizes}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="cost_price"
                placeholder="Giá nhập"
                value={formData.cost_price}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="sale_price"
                placeholder="Giá bán"
                value={formData.sale_price}
                onChange={handleInputChange}
              />
              <input
                type="number"
                name="stock"
                placeholder="Tồn kho"
                value={formData.stock}
                onChange={handleInputChange}
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Đang bán</option>
                <option value="inactive">Hết hàng</option>
              </select>
            </div>
            <div className="modal-buttons">
              <button
                type="button"
                className="save-btn"
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </button>
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

export default ProductsPage;