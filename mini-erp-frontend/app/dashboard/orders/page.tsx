"use client";

import { useEffect, useState, useCallback } from "react";
import OrderService, { OrderDTO, OrderDetailDTO } from "../../services/OrderService";
import ProductService, { ProductDTO } from "../../services/ProductService";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("user");
  const [mounted, setMounted] = useState(false);

  // --- STATE CHO MODAL TẠO ĐƠN HÀNG (POS) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [customerId, setCustomerId] = useState<number>(1); // Tạm fix cứng Khách hàng ID 1
  
  // State quản lý Giỏ hàng
  const [cart, setCart] = useState<OrderDetailDTO[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [orderData, productData] = await Promise.all([
        OrderService.getAll().catch(() => []), // Tránh sập UI nếu Backend chưa có API Orders
        ProductService.getAll()
      ]);
      setOrders(orderData);
      // Giỏ hàng chỉ hiển thị những sản phẩm còn tồn kho (> 0)
      setProducts(productData.filter(p => p.quantity > 0)); 
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializePage = async () => {
      const role = localStorage.getItem("user_role") || "user";
      setUserRole(role.trim().toLowerCase());
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      
      await loadData();
    };
    initializePage();
  }, [loadData]);

  const isAdmin = mounted && userRole === "admin";
  const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  // --- LOGIC XỬ LÝ GIỎ HÀNG ---
  const handleAddToCart = () => {
    if (selectedProductId === 0 || selectedQuantity <= 0) return;
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    if (selectedQuantity > product.quantity) {
      setModalError(`Chỉ còn ${product.quantity} sản phẩm trong kho!`);
      return;
    }

    const existingItemIndex = cart.findIndex(item => item.productId === selectedProductId);
    if (existingItemIndex >= 0) {
      // Nếu có rồi thì cộng thêm số lượng
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += selectedQuantity;
      
      // Chặn nếu tổng số lượng trong giỏ vượt quá tồn kho
      if (newCart[existingItemIndex].quantity > product.quantity) {
         setModalError(`Tổng số lượng trong giỏ vượt quá tồn kho (${product.quantity})!`);
         return;
      }
      setCart(newCart);
    } else {
      // Thêm mới vào giỏ
      setCart([...cart, {
        productId: product.id,
        productName: product.productName,
        unitPrice: product.price,
        quantity: selectedQuantity
      }]);
    }
    
    setModalError("");
    setSelectedQuantity(1);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  // --- LƯU ĐƠN HÀNG (TRỪ KHO) ---
  const handleSaveOrder = async () => {
    if (cart.length === 0) {
      setModalError("Giỏ hàng đang trống!");
      return;
    }

    try {
      await OrderService.create({
        customerId: customerId,
        details: cart.map(c => ({
          productId: c.productId,
          quantity: c.quantity,
          unitPrice: c.unitPrice
        }))
      });
      setIsModalOpen(false);
      setCart([]); 
      loadData(); // Tải lại để thấy Hóa đơn mới và Tồn kho giảm đi
    } catch (error) {
      const err = error as { response?: { data?: string } };
      setModalError(err.response?.data || "Lỗi khi tạo đơn hàng!");
    }
  };

  // --- HỦY ĐƠN HÀNG (HOÀN KHO) ---
  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm(`Bạn có chắc chắn muốn HỦY đơn hàng #ORD-${orderId} và hoàn trả hàng vào kho không?`)) {
      try {
        await OrderService.cancel(orderId);
        loadData(); // Tải lại để thấy Trạng thái đổi màu và Tồn kho tăng lên
      } catch (error) {
        const err = error as { response?: { data?: string } };
        alert(err.response?.data || "Có lỗi xảy ra khi hủy đơn!");
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in-up">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bán hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Tạo hóa đơn và ghi nhận doanh thu</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setIsModalOpen(true); setCart([]); setModalError(""); }} 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span> Tạo đơn hàng
          </button>
        )}
      </div>

      {/* BẢNG DANH SÁCH ĐƠN HÀNG */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="px-4 py-3 font-semibold">Mã Hóa đơn</th>
              <th className="px-4 py-3 font-semibold">Ngày tạo</th>
              <th className="px-4 py-3 font-semibold">Người thu tiền</th>
              <th className="px-4 py-3 font-semibold text-right">Tổng tiền</th>
              <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
              {isAdmin && <th className="px-4 py-3 font-semibold text-center">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr><td colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-gray-400">Chưa có hóa đơn nào.</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">#ORD-{order.id}</td>
                <td className="px-4 py-3 text-gray-700">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-gray-700">{(order as Record<string, any>).employeeName || "System"}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-600">{formatCurrency(order.totalAmount)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    order.status === "Cancelled" 
                      ? "bg-red-50 text-red-600 border border-red-200" 
                      : "bg-green-50 text-green-600 border border-green-200"
                  }`}>
                    {order.status === "Cancelled" ? "Đã hủy" : "Hoàn tất"}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-center">
                    {order.status !== "Cancelled" ? (
                      <button 
                        onClick={() => handleCancelOrder(order.id)} 
                        className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors flex items-center justify-center gap-1 mx-auto bg-white border border-red-100 px-3 py-1 rounded-md shadow-sm"
                        title="Hủy đơn và hoàn kho"
                      >
                        <span className="material-symbols-outlined text-sm">cancel</span> Hủy
                      </button>
                    ) : (
                      <span className="text-gray-300 material-symbols-outlined text-base">block</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL TẠO ĐƠN HÀNG (MÀN HÌNH POS) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[90vh] flex flex-col overflow-hidden transform transition-all">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
              <h2 className="text-lg font-bold text-blue-900">Tạo Đơn Hàng Mới</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {modalError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{modalError}</p>}
              
              {/* VÙNG CHỌN SẢN PHẨM */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Chọn sản phẩm (Chỉ hiện SP còn hàng)</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={selectedProductId} 
                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  >
                    <option value={0}>-- Click để chọn --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.productName} - {formatCurrency(p.price)} (Tồn: {p.quantity})</option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Số lượng</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                    value={selectedQuantity} 
                    onChange={(e) => setSelectedQuantity(Number(e.target.value))} 
                  />
                </div>
                <button onClick={handleAddToCart} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg font-medium transition-colors h-[42px]">
                  Thêm
                </button>
              </div>

              {/* BẢNG GIỎ HÀNG */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Tên SP</th>
                      <th className="px-4 py-2 font-semibold text-center w-16">SL</th>
                      <th className="px-4 py-2 font-semibold text-right">Đơn giá</th>
                      <th className="px-4 py-2 font-semibold text-right">Thành tiền</th>
                      <th className="px-4 py-2 font-semibold text-center w-16">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cart.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-6 text-gray-400">Giỏ hàng đang trống</td></tr>
                    ) : cart.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.productName}</td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-600">{formatCurrency(item.unitPrice * item.quantity)}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 transition-colors">
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* TỔNG TIỀN */}
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                <span className="font-bold text-gray-700">Tổng thanh toán:</span>
                <span className="text-2xl font-black text-blue-700">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
              <button onClick={handleSaveOrder} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">payments</span>
                Thanh toán & Xuất kho
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}