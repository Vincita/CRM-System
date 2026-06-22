import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateOrder } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers, useCreateCustomer } from '../../hooks/useCustomers';
import './createorder.css';

interface CartItem {
  product_id: string;
  name: string;
  sale_price: number;
  quantity: number;
  discount: number;
}

const CreateOrder = () => {
  const navigate = useNavigate();

  // State cho khách hàng
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    province: '',
    district: '',
    address: '',
  });

  // State cho giỏ hàng
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // State cho thanh toán
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [channel, setChannel] = useState('offline');
  const [province, setProvince] = useState('');
  const [shippingFee, setShippingFee] = useState(0);

  // Hooks
  const { data: customersData } = useCustomers({ search: searchTerm, limit: 5 });
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 100 });
  const createOrderMutation = useCreateOrder();
  const createCustomerMutation = useCreateCustomer();

  const products = productsData?.data || [];
  const customerOptions = customersData?.data || [];

  // Chọn khách hàng từ dropdown
  const selectCustomer = (customer: any) => {
    console.log('selectCustomer called with:', customer); // DEBUG
    if (customer) {
      setSelectedCustomer(customer);
      setSearchTerm(customer.name || customer.tenKH || '');
    }
  };

  // Tạo khách hàng mới
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Creating customer with data:', newCustomerForm); // DEBUG
      const response = await createCustomerMutation.mutateAsync(newCustomerForm);
      console.log('API response:', response); // DEBUG

      // Kiểm tra cấu trúc response
      // Backend trả về: { success: true, data: { id, code, name, email, phone, ... } }
      const customerData = response?.data?.data || response?.data || response;

      if (customerData && customerData.id) {
        console.log('Customer data extracted:', customerData); // DEBUG
        selectCustomer(customerData);
        setShowCustomerModal(false);
        setNewCustomerForm({ name: '', email: '', phone: '', gender: '', province: '', district: '', address: '' });
        alert('✅ Tạo khách hàng thành công!');
      } else {
        console.error('Invalid customer data:', customerData); // DEBUG
        alert('❌ Tạo khách hàng thành công nhưng không nhận được dữ liệu. Vui lòng kiểm tra lại.');
      }
    } catch (error) {
      console.error('Create customer error:', error); // DEBUG
      alert('❌ Lỗi tạo khách hàng: ' + (error as any).message);
    }
  };

  // Thêm sản phẩm vào giỏ
  const addToCart = () => {
    if (!selectedProductId) return;
    const product = products.find((p: any) => p._id === selectedProductId);
    if (!product) return;
    const existing = cart.find(item => item.product_id === selectedProductId);
    if (existing) {
      setCart(cart.map(item =>
        item.product_id === selectedProductId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product._id,
        name: product.name,
        sale_price: product.sale_price,
        quantity,
        discount: 0,
      }]);
    }
    setSelectedProductId('');
    setQuantity(1);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.product_id === productId ? { ...item, quantity: newQty } : item
      ));
    }
  };

  const updateDiscount = (productId: string, newDiscount: number) => {
    setCart(cart.map(item =>
      item.product_id === productId ? { ...item, discount: newDiscount } : item
    ));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.sale_price - item.discount) * item.quantity, 0);
  const grandTotal = subtotal + shippingFee;

  // Tạo đơn hàng
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('selectedCustomer before submit:', selectedCustomer); // DEBUG
    if (!selectedCustomer) {
      alert('❌ Vui lòng chọn khách hàng');
      return;
    }
    if (cart.length === 0) {
      alert('❌ Vui lòng thêm ít nhất 1 sản phẩm');
      return;
    }
    const customer_id = selectedCustomer.id || selectedCustomer._id;
    console.log('customer_id:', customer_id); // DEBUG
    const orderData = {
      customer_id: customer_id,
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        discount: item.discount,
      })),
      payment_method: paymentMethod,
      channel: channel,
      province: province || selectedCustomer.province || '',
      shipping_fee: shippingFee,
    };
    console.log('orderData:', orderData); // DEBUG
    try {
      await createOrderMutation.mutateAsync(orderData);
      alert('✅ Tạo đơn hàng thành công!');
      navigate('/orders');
    } catch (error) {
      console.error('Order creation error:', error); // DEBUG
      alert('❌ Lỗi: ' + (error as any).message);
    }
  };

  if (productsLoading) {
    return <div className="p-4">Đang tải danh sách sản phẩm...</div>;
  }

  return (
    <div className="create-order-page">
      {/* Header */}
      <div className="co-header">
        <div className="co-header-left">
          <h1>🛒 Tạo đơn hàng mới</h1>
          <p>Quản lý khách hàng &gt; Tạo đơn hàng</p>
        </div>
        <button onClick={() => navigate('/orders')} className="btn-co-secondary">
          ← Quay lại
        </button>
      </div>

      {/* Thông tin khách hàng */}
      <div className="co-card">
        <div className="co-card-header">👤 Thông tin khách hàng</div>
        <div className="co-card-body">
          <div className="co-form-row">
            <div className="co-form-group flex-2">
              <label>Tìm khách hàng</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Tìm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="btn-co-primary"
                >
                  + Tạo mới
                </button>
              </div>
              {searchTerm && customerOptions.length > 0 && !selectedCustomer && (
                <ul className="co-customer-dropdown">
                  {customerOptions.map((c: any) => (
                    <li key={c.id} onClick={() => selectCustomer(c)}>
                      {c.name} - {c.phone || c.email} ({c.code})
                    </li>
                  ))}
                </ul>
              )}
              {selectedCustomer && (
                <div className="co-customer-selected">
                  <div>
                    <p><strong>Khách hàng:</strong> {selectedCustomer.name}</p>
                    <p><strong>Email:</strong> {selectedCustomer.email} - <strong>ĐT:</strong> {selectedCustomer.phone || '—'}</p>
                  </div>
                  <span className="change-link" onClick={() => { setSelectedCustomer(null); setSearchTerm(''); }}>
                    [Thay đổi]
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal tạo khách hàng mới */}
      {showCustomerModal && (
        <div className="co-modal">
          <div className="co-modal-inner">
            <h3>Thêm khách hàng mới</h3>
            <form onSubmit={handleCreateCustomer}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  name="name"
                  placeholder="Tên *"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  required
                />
                <input
                  name="email"
                  placeholder="Email *"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                  style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  required
                  type="email"
                />
                <input
                  name="phone"
                  placeholder="Số điện thoại"
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
                <input
                  name="province"
                  placeholder="Tỉnh/Thành phố"
                  value={newCustomerForm.province}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, province: e.target.value })}
                  style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
                <input
                  name="address"
                  placeholder="Địa chỉ"
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
              </div>
              <div className="co-modal-actions">
                <button type="button" className="btn-co-secondary" onClick={() => setShowCustomerModal(false)}>Hủy</button>
                <button type="submit" className="btn-co-primary">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chọn sản phẩm */}
      <div className="co-card">
        <div className="co-card-header">📦 Chọn sản phẩm</div>
        <div className="co-card-body">
          <div className="co-form-row">
            <div className="co-form-group">
              <label>Sản phẩm</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">-- Chọn --</option>
                {products.map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.name} - {p.sale_price?.toLocaleString()}đ | Tồn: {p.stock}
                  </option>
                ))}
              </select>
            </div>
            <div className="co-form-group" style={{ maxWidth: '100px' }}>
              <label>Số lượng</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="co-form-group" style={{ flex: '0 0 auto' }}>
              <button
                type="button"
                onClick={addToCart}
                className="btn-co-primary"
              >
                Thêm
              </button>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="co-table-wrap">
              <h4 style={{ fontWeight: 600, marginBottom: 6, marginTop: 12, fontSize: 14 }}>🛒 Giỏ hàng</h4>
              <table className="co-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th className="text-right">Đơn giá</th>
                    <th className="text-center">SL</th>
                    <th className="text-right">Giảm giá</th>
                    <th className="text-right">Thành tiền</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => {
                    const total = (item.sale_price - item.discount) * item.quantity;
                    return (
                      <tr key={item.product_id}>
                        <td>{item.name}</td>
                        <td className="text-right">{item.sale_price.toLocaleString()}đ</td>
                        <td className="text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product_id, Number(e.target.value))}
                            className="qty-input"
                          />
                        </td>
                        <td className="text-right">
                          <input
                            type="number"
                            min="0"
                            value={item.discount}
                            onChange={(e) => updateDiscount(item.product_id, Number(e.target.value))}
                            className="discount-input"
                          />
                        </td>
                        <td className="text-right"><strong>{total.toLocaleString()}đ</strong></td>
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product_id)}
                            className="remove-btn"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="total-row">
                    <td colSpan={3} className="text-right">Tổng phụ:</td>
                    <td colSpan={2} className="text-right">{subtotal.toLocaleString()}đ</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="text-right">Phí ship:</td>
                    <td colSpan={2} className="text-right">
                      <input
                        type="number"
                        min="0"
                        value={shippingFee}
                        onChange={(e) => setShippingFee(Number(e.target.value))}
                        style={{ width: '80px', padding: '4px 6px', border: '1px solid #ccc', borderRadius: '6px' }}
                      />
                    </td>
                    <td></td>
                  </tr>
                  <tr className="grand-total">
                    <td colSpan={3} className="text-right">Tổng cộng:</td>
                    <td colSpan={2} className="text-right">{grandTotal.toLocaleString()}đ</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Thanh toán */}
      <div className="co-card">
        <div className="co-card-header">💳 Thanh toán</div>
        <div className="co-card-body">
          <div className="co-form-row">
            <div className="co-form-group">
              <label>Phương thức</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cod">COD</option>
                <option value="bank">Chuyển khoản</option>
                <option value="credit_card">Thẻ tín dụng</option>
              </select>
            </div>
            <div className="co-form-group">
              <label>Kênh bán</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                <option value="offline">Offline</option>
                <option value="website">Website</option>
                <option value="shopee">Shopee</option>
                <option value="facebook">Facebook</option>
              </select>
            </div>
            <div className="co-form-group flex-2">
              <label>Tỉnh/Thành phố</label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Ví dụ: Hồ Chí Minh, Hà Nội..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="co-actions">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={createOrderMutation.isPending}
          className="btn-co-success"
        >
          {createOrderMutation.isPending ? 'Đang tạo...' : '✅ Tạo đơn hàng'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="btn-co-secondary"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

export default CreateOrder;