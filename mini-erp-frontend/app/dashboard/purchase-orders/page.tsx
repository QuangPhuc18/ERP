"use client";

import React, { useEffect, useState, useCallback, startTransition } from "react";
import PurchaseOrderService, { PurchaseOrderDTO, PurchaseOrderDetailDTO } from "../../services/PurchaseOrderService";
import ProductService, { ProductDTO } from "../../services/ProductService";
import SupplierService, { SupplierDTO } from "../../services/SupplierService";
import axios from "axios";

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("user");
  const [mounted, setMounted] = useState(false);

  // --- THÊM STATE PHÂN TRANG & LỌC ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // --- STATE MODAL TẠO PHIẾU NHẬP ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPOId, setEditingPOId] = useState<number | null>(null); // Trạng thái xác định có đang sửa hay không
  
  const [supplierId, setSupplierId] = useState<number>(0); 
  
  // Quản lý Giỏ hàng nhập kho
  const [cart, setCart] = useState<PurchaseOrderDetailDTO[]>([]);
  const [productSearch, setProductSearch] = useState<string>(""); // 🎯 State tìm kiếm sản phẩm
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 🎯 State mở combobox
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedUnitPrice, setSelectedUnitPrice] = useState<number>(0);

  // --- STATE XEM CHI TIẾT PHIẾU NHẬP ---
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderDTO | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [poData, productData, supplierData] = await Promise.all([
        PurchaseOrderService.getAll(currentPage, 20, selectedMonth, selectedYear).catch(() => ({ items: [], totalItems: 0, totalPages: 1, currentPage: 1 })), 
        ProductService.getAll(),
        SupplierService.getAll().catch(() => []) 
      ]);
      
      startTransition(() => {
        setPurchaseOrders(poData.items || []);
        setTotalPages(poData.totalPages || 1);
        setProducts(productData);
        setSuppliers(supplierData);
        if (supplierData.length > 0) {
          setSupplierId(supplierData[0].id);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setIsLoading(false);
    }
  }, [currentPage, selectedMonth, selectedYear]);

  useEffect(() => {
    const role = localStorage.getItem("user_role") || "user";
    setUserRole(role.trim().toLowerCase());
    setMounted(true);
    fetchInitialData();
  }, [fetchInitialData]);

  const isAdmin = mounted && userRole === "admin";
  const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const handleProductChange = (productId: number) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedUnitPrice(product.price * 0.7);
    } else {
      setSelectedUnitPrice(0);
    }
  };

  const handleAddToCart = () => {
    if (selectedProductId === 0 || selectedQuantity <= 0 || selectedUnitPrice < 0) {
      setModalError("Vui lòng chọn sản phẩm và nhập số lượng/đơn giá hợp lệ!");
      return;
    }
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    const existingItemIndex = cart.findIndex(item => item.productId === selectedProductId);
    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += selectedQuantity;
      newCart[existingItemIndex].unitPrice = selectedUnitPrice; 
      setCart(newCart);
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.productName,
        unitPrice: selectedUnitPrice,
        quantity: selectedQuantity
      }]);
    }
    
    setModalError("");
    setSelectedQuantity(1);
    setProductSearch(""); // Reset ô tìm kiếm sau khi thêm thành công
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  // --- LƯU PHIẾU NHÁP ---
  const handleSavePurchaseOrder = async () => {
    if (cart.length === 0) {
      setModalError("Danh sách nhập hàng đang trống!");
      return;
    }
    if (supplierId === 0) {
      setModalError("Vui lòng chọn nhà cung cấp!");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplierId: supplierId,
        details: cart.map(c => ({
          productId: c.productId,
          quantity: c.quantity,
          unitPrice: c.unitPrice
        }))
      };

      if (editingPOId) {
        // CẬP NHẬT PHIẾU CŨ
        await PurchaseOrderService.update(editingPOId, payload);
        alert("Đã cập nhật Phiếu Nhập Kho (Bản Nháp) thành công!");
      } else {
        // TẠO MỚI
        await PurchaseOrderService.create(payload);
        alert("Đã tạo Phiếu Nhập Kho (Bản Nháp). Quản lý cần duyệt phiếu để chính thức nhập hàng!");
      }

      setIsModalOpen(false);
      setCart([]); 
      setEditingPOId(null);
      await fetchInitialData();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setModalError(error.response?.data || "Lỗi khi lưu phiếu nhập kho!");
      } else {
        setModalError("Có lỗi xảy ra!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- MỞ MODAL SỬA PHIẾU ---
  const handleEditDraft = () => {
    if (!selectedPO) return;
    
    // Gán dữ liệu của phiếu cũ sang form
    setEditingPOId(selectedPO.id);
    
    // Tìm ID nhà cung cấp từ tên (hơi trick một xíu, lý tưởng là 백엔드 trả về SupplierId)
    // Nếu 백엔드 không trả về SupplierId, ta cố gắng tìm ID dựa trên suppliers list
    const foundSupplier = suppliers.find(s => s.name === selectedPO.supplierName);
    setSupplierId(foundSupplier ? foundSupplier.id : (suppliers.length > 0 ? suppliers[0].id : 0));
    
    setCart(selectedPO.details.map(d => ({
      productId: d.productId,
      productName: d.productName,
      unitPrice: d.unitPrice,
      quantity: d.quantity
    })));
    
    setModalError("");
    setSelectedPO(null); // Đóng modal chi tiết
    setIsModalOpen(true); // Mở modal form
  };

  // --- QUẢN LÝ DUYỆT PHIẾU ---
  const handleConfirmPO = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn duyệt Phiếu nhập này? Tồn kho thực tế sẽ tăng theo số lượng của phiếu.")) return;

    setIsConfirming(true);
    try {
      await PurchaseOrderService.confirm(id);
      alert("Đã duyệt Phiếu Nhập Hàng thành công! Tồn kho đã được cộng thêm.");
      setSelectedPO(null);
      await fetchInitialData();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data || "Lỗi khi duyệt phiếu!");
      } else {
        alert("Lỗi không xác định khi duyệt phiếu.");
      }
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in-up">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhập kho</h1>
          <p className="text-sm text-gray-500 mt-1">Lập phiếu nhập hàng và chờ Quản lý duyệt</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setIsModalOpen(true); setCart([]); setModalError(""); setEditingPOId(null); }} 
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add_box</span> Tạo Phiếu Nhập Nháp
          </button>
        )}
      </div>

      {/* BỘ LỌC THỜI GIAN */}
      <div className="flex items-center gap-4 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="material-symbols-outlined text-gray-500">calendar_month</span>
          Lọc theo tháng:
        </div>
        <input 
          type="month"
          value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
          onChange={(e) => {
            if (e.target.value) {
              const [y, m] = e.target.value.split('-');
              setSelectedYear(Number(y));
              setSelectedMonth(Number(m));
              setCurrentPage(1);
            }
          }}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-white font-medium text-gray-700"
        />
        <button 
          onClick={() => { setSelectedMonth(currentMonth); setSelectedYear(currentYear); setCurrentPage(1); }}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Tháng hiện tại
        </button>
      </div>

      {/* BẢNG DANH SÁCH PHIẾU NHẬP */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="px-4 py-3 font-semibold">Mã Phiếu</th>
              <th className="px-4 py-3 font-semibold">Nhà cung cấp</th>
              <th className="px-4 py-3 font-semibold">Ngày tạo</th>
              <th className="px-4 py-3 font-semibold text-right">Tổng chi phí</th>
              <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : purchaseOrders.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Chưa có phiếu nhập kho nào.</td></tr>
            ) : purchaseOrders.map((po) => (
              <tr 
                key={po.id} 
                onClick={() => setSelectedPO(po)}
                className="hover:bg-rose-50/30 transition-colors cursor-pointer group"
                title="Click để xem chi tiết phiếu nhập"
              >
                <td className="px-4 py-3 font-bold text-gray-900 group-hover:text-rose-600 transition-colors">#PO-{po.id}</td>
                <td className="px-4 py-3 font-medium text-blue-700">{po.supplierName || `Chưa rõ`}</td>
                <td className="px-4 py-3 text-gray-600">{new Date(po.orderDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 text-right font-bold text-rose-600">{formatCurrency(po.totalAmount)}</td>
                <td className="px-4 py-3 text-center">
                  {po.status === "Pending" ? (
                    <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-xs font-bold border border-orange-200">CHỜ DUYỆT</span>
                  ) : (
                    <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">ĐÃ NHẬP KHO</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 flex items-center"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span> Trước
          </button>
          
          <div className="text-sm font-medium text-gray-700 bg-gray-50 px-4 py-1.5 rounded-md border border-gray-200">
            Trang {currentPage} / {totalPages}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-3 py-1 border border-gray-300 rounded-md bg-white text-gray-600 disabled:opacity-50 hover:bg-gray-50 flex items-center"
          >
            Sau <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      )}

      {/* MODAL 1: XEM CHI TIẾT PHIẾU NHẬP */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[85vh] flex flex-col overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Chi Tiết Phiếu Nhập #PO-{selectedPO.id}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Ngày tạo: {new Date(selectedPO.orderDate).toLocaleString('vi-VN')}</p>
              </div>
              <button onClick={() => setSelectedPO(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-gray-400 font-medium text-xs uppercase tracking-wider">Nhà cung cấp</p>
                  <p className="font-bold text-blue-700 mt-0.5">{selectedPO.supplierName || "Chưa rõ"}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-medium text-xs uppercase tracking-wider">Trạng thái phiếu</p>
                  <p className="mt-0.5">
                    {selectedPO.status === "Pending" ? (
                      <span className="font-bold text-orange-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span> Đang chờ Quản lý duyệt
                      </span>
                    ) : (
                      <span className="font-bold text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Đã nhập kho hoàn tất
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <h4 className="font-bold text-gray-700 text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-base">list_alt</span> Danh sách mặt hàng nhập
              </h4>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-2.5 font-bold">Tên sản phẩm</th>
                      <th className="px-4 py-2.5 font-bold text-center w-20">Số lượng</th>
                      <th className="px-4 py-2.5 font-bold text-right">Đơn giá nhập</th>
                      <th className="px-4 py-2.5 font-bold text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedPO.details && selectedPO.details.length > 0 ? (
                      selectedPO.details.map((detail, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/40 transition-colors">
                          <td className="px-4 py-3 font-semibold text-gray-800">{detail.productName || `Sản phẩm (ID: ${detail.productId})`}</td>
                          <td className="px-4 py-3 text-center font-bold text-blue-600">+{detail.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(detail.unitPrice)}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-800">{formatCurrency(detail.unitPrice * detail.quantity)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-gray-400 font-medium">Không tìm thấy thông tin chi tiết mặt hàng.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 mt-4">
                <span className="font-bold text-gray-700">Tổng giá trị đơn nhập:</span>
                <span className="text-xl font-black text-rose-600">{formatCurrency(selectedPO.totalAmount)}</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-100">
              <button onClick={() => setSelectedPO(null)} className="px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-all">
                Đóng
              </button>
              
              {/* 🎯 NÚT DUYỆT PHIẾU VÀ SỬA PHIẾU CHỈ HIỂN THỊ KHI STATUS LÀ PENDING VÀ LÀ ADMIN */}
              {selectedPO.status === "Pending" && isAdmin && (
                <div className="flex gap-3">
                  <button 
                    onClick={handleEditDraft}
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    SỬA PHIẾU NHÁP
                  </button>

                  <button 
                    onClick={() => handleConfirmPO(selectedPO.id)}
                    disabled={isConfirming}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:bg-gray-400"
                  >
                    <span className="material-symbols-outlined text-sm">fact_check</span>
                    {isConfirming ? "ĐANG DUYỆT..." : "XÁC NHẬN NHẬP KHO CHÍNH THỨC"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: TẠO PHIẾU NHẬP KHO MỚI --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[850px] max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-rose-50/50">
              <h2 className="text-lg font-bold text-rose-900">
                {editingPOId ? `Sửa Phiếu Nhập Kho #PO-${editingPOId}` : "Tạo Phiếu Nhập Kho (Bản Nháp)"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {modalError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{modalError}</p>}
              
              <div className="mb-4">
                 <label className="block text-sm font-bold text-gray-700 mb-1">Nhà cung cấp</label>
                 <select 
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                    value={supplierId} 
                    onChange={(e) => setSupplierId(Number(e.target.value))}
                  >
                    {suppliers.length === 0 && <option value={0}>-- Chưa có nhà cung cấp nào --</option>}
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Mã: {s.supplierCode})</option>
                    ))}
                  </select>
              </div>

              {/* VÙNG CHỌN SẢN PHẨM & GIÁ NHẬP */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[300px] relative">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tìm & Chọn sản phẩm</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="🔍 Gõ tên, mã SP hoặc click để chọn..." 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 text-sm bg-white cursor-text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setIsDropdownOpen(true);
                        setSelectedProductId(0); // Reset ID nếu đang gõ chữ mới
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() => {
                        // Trì hoãn một chút để sự kiện onClick của danh sách kịp chạy
                        setTimeout(() => setIsDropdownOpen(false), 200);
                      }}
                    />
                    <span className="absolute right-3 top-2.5 material-symbols-outlined text-gray-400 pointer-events-none text-xl">expand_more</span>
                  </div>

                  {/* DANH SÁCH DROPDOWN TỰ TẠO */}
                  {isDropdownOpen && (
                    <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-[175px] overflow-y-auto left-0 animate-fade-in-up">
                      {products.filter(p => 
                          p.productName.toLowerCase().includes(productSearch.toLowerCase()) || 
                          (p.productCode && p.productCode.toLowerCase().includes(productSearch.toLowerCase()))
                        ).length === 0 ? (
                        <li className="px-4 py-3 text-sm text-gray-500 text-center">Không tìm thấy sản phẩm.</li>
                      ) : (
                        products.filter(p => 
                          p.productName.toLowerCase().includes(productSearch.toLowerCase()) || 
                          (p.productCode && p.productCode.toLowerCase().includes(productSearch.toLowerCase()))
                        ).map(p => (
                          <li 
                            key={p.id}
                            className="px-4 py-2.5 hover:bg-rose-50 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center transition-colors"
                            onClick={() => {
                              handleProductChange(p.id);
                              setProductSearch(p.productName); // Điền tên SP vào ô input
                              setIsDropdownOpen(false); // Đóng danh sách
                            }}
                          >
                            <div>
                              <div className="font-bold text-gray-800 text-sm">{p.productName}</div>
                              <div className="text-xs text-gray-500 mt-0.5 font-medium">Mã SP: <span className="text-gray-700">{p.productCode || 'N/A'}</span></div>
                            </div>
                            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md border border-rose-200 shadow-sm">
                              Tồn: {p.quantity}
                            </span>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Giá nhập (VNĐ)</label>
                  <input 
                    type="number" min="0" step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right outline-none focus:ring-2 focus:ring-rose-500" 
                    value={selectedUnitPrice} 
                    onChange={(e) => setSelectedUnitPrice(Number(e.target.value))} 
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Số lượng</label>
                  <input 
                    type="number" min="1" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center outline-none focus:ring-2 focus:ring-rose-500" 
                    value={selectedQuantity} 
                    onChange={(e) => setSelectedQuantity(Number(e.target.value))} 
                  />
                </div>
                <button onClick={handleAddToCart} className="bg-rose-100 text-rose-700 hover:bg-rose-200 px-4 py-2 rounded-lg font-medium transition-colors h-[42px]">
                  Thêm
                </button>
              </div>

              {/* BẢNG DANH SÁCH SP NHẬP KHO */}
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Tên SP</th>
                      <th className="px-4 py-2 font-semibold text-center w-16">SL</th>
                      <th className="px-4 py-2 font-semibold text-right">Giá nhập</th>
                      <th className="px-4 py-2 font-semibold text-right">Thành tiền</th>
                      <th className="px-4 py-2 font-semibold text-center w-16">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cart.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-6 text-gray-400">Chưa có SP nào để nhập</td></tr>
                    ) : cart.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.productName}</td>
                        <td className="px-4 py-3 text-center font-bold text-blue-600">+{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-medium text-rose-600">{formatCurrency(item.unitPrice * item.quantity)}</td>
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
              <div className="flex justify-between items-center bg-rose-50 p-4 rounded-lg border border-rose-100 mt-4">
                <span className="font-bold text-gray-700">Tổng chi phí dự kiến:</span>
                <span className="text-2xl font-black text-rose-700">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
              <button 
                onClick={handleSavePurchaseOrder} 
                disabled={isSubmitting}
                className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                {isSubmitting ? "Đang lưu..." : "Lưu Bản Nháp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}