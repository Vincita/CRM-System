import { useParams, useNavigate } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrders';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useOrder(id || '');

  if (isLoading) return <div className="p-4">Đang tải chi tiết đơn hàng...</div>;
  if (error) return <div className="p-4 text-red-500">Lỗi tải dữ liệu</div>;

  const order = data?.data;
  const items = order?.items || [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header với nút quay lại */}
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📄 Chi tiết đơn hàng: {order?._id}</h1>
        <button
          onClick={() => navigate('/orders')}
          className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition flex items-center gap-2"
        >
          ← Quay lại danh sách
        </button>
      </div>

      {/* Thông tin đơn hàng */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div><span className="font-semibold text-gray-600">Mã đơn:</span> <span className="text-gray-800">{order?._id}</span></div>
          <div><span className="font-semibold text-gray-600">Khách hàng:</span> <span className="text-gray-800">{order?.customer_id}</span></div>
          <div><span className="font-semibold text-gray-600">Ngày tạo:</span> <span className="text-gray-800">{new Date(order?.order_date).toLocaleString('vi-VN')}</span></div>
          <div>
            <span className="font-semibold text-gray-600">Trạng thái:</span>
            <span className={`inline-block ml-2 px-3 py-1 rounded-full text-xs font-semibold
              ${order?.status === 'completed' ? 'bg-green-100 text-green-700' :
                order?.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'}`}
            >
              {order?.status === 'completed' ? 'Hoàn thành' :
               order?.status === 'shipped' ? 'Đã giao' : 'Đã hủy'}
            </span>
          </div>
          <div><span className="font-semibold text-gray-600">Kênh:</span> <span className="text-gray-800 uppercase">{order?.channel}</span></div>
          <div><span className="font-semibold text-gray-600">Thanh toán:</span> <span className="text-gray-800">{order?.payment_method === 'cod' ? 'COD' : order?.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'Thẻ tín dụng'}</span></div>
          <div><span className="font-semibold text-gray-600">Tỉnh:</span> <span className="text-gray-800">{order?.province || '—'}</span></div>
          <div><span className="font-semibold text-gray-600">Tổng phụ:</span> <span className="text-gray-800">{order?.totals_subtotal?.toLocaleString()}đ</span></div>
          <div><span className="font-semibold text-gray-600">Phí ship:</span> <span className="text-gray-800">{order?.totals_shipping_fee?.toLocaleString()}đ</span></div>
          <div className="col-span-2 md:col-span-3">
            <span className="font-semibold text-gray-600">Tổng tiền:</span>
            <span className="ml-2 text-xl font-bold text-blue-600">{order?.totals_grand_total?.toLocaleString()}đ</span>
          </div>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">🛍️ Sản phẩm đã mua</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">STT</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Sản phẩm</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-600">Đơn giá</th>
                <th className="py-3 px-4 text-center text-sm font-semibold text-gray-600">SL</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-600">Giảm giá</th>
                <th className="py-3 px-4 text-right text-sm font-semibold text-gray-600">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Không có sản phẩm</td>
                </tr>
              ) : (
                items.map((item: any) => {
                  const total = (item.unit_price - item.discount) * item.quantity;
                  return (
                    <tr key={item.line_no} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 text-sm text-gray-600">{item.line_no}</td>
                      <td className="py-3 px-4 text-sm text-gray-800">{item.product_id}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-700">{item.unit_price?.toLocaleString()}đ</td>
                      <td className="py-3 px-4 text-center text-sm text-gray-700">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-700">{item.discount?.toLocaleString()}đ</td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-gray-800">{total.toLocaleString()}đ</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;