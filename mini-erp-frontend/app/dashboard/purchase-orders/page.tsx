"use client";

import React, { useEffect, useState, useCallback, startTransition } from "react";
import PurchaseOrderService, { PurchaseOrderDTO, PurchaseOrderDetailDTO } from "../../services/PurchaseOrderService";
import ProductService, { ProductDTO } from "../../services/ProductService";
import SupplierService, { SupplierDTO } from "../../services/SupplierService"; // 🎯 IMPORT SERVICE NHÀ CUNG CẤP
import axios from "axios";

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderDTO[]>([]);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]); // 🎯 STATE CHỨA DỮ LIỆU NHÀ CUNG CẤP THẬT
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("user");
  const [mounted, setMounted] = useState(false);

  // --- STATE MODAL TẠO PHIẾU NHẬP ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [supplierId, setSupplierId] = useState<number>(0); 
  
  // Quản lý Giỏ hàng nhập kho
  const [cart, setCart] = useState<PurchaseOrderDetailDTO[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedUnitPrice, setSelectedUnitPrice] = useState<number>(0);

  // --- STATE XEM CHI TIẾT PHIẾU NHẬP ---
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderDTO | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      // 🎯 KÉO CÙNG LÚC 3 LUỒNG DỮ LIỆU: Phiếu Nhập, Sản Phẩm, Nhà Cung Cấp
      const [poData, productData, supplierData] = await Promise.all([
        PurchaseOrderService.getAll().catch(() => []), 
        ProductService.getAll(),
        SupplierService.getAll().catch(() => []) 
      ]);
      
      startTransition(() => {
        setPurchaseOrders(poData);
        setProducts(productData);
        setSuppliers(supplierData);
        // Tự động chọn nhà cung cấp đầu tiên nếu có dữ liệu
        if (supplierData.length > 0) {
          setSupplierId(supplierData[0].id);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("user_role") || "user";
    setUserRole(role.trim().toLowerCase());
    setMounted(true);
    fetchInitialData();
  }, [fetchInitialData]);

  const isAdmin = mounted && userRole === "admin";
  const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  // --- AUTO ĐIỀN GIÁ GỢI Ý KHI CHỌN SẢN PHẨM ---
  const handleProductChange = (productId: number) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedUnitPrice(product.price * 0.7); // Giả lập giá vốn = 70% giá bán
    } else {
      setSelectedUnitPrice(0);
    }
  };

  // --- THÊM VÀO GIỎ HÀNG NHẬP ---
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
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  // --- LƯU PHIẾU NHẬP (CỘNG TỒN KHO) ---
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
      await PurchaseOrderService.create({
        supplierId: supplierId,
        details: cart.map(c => ({
          productId: c.productId,
          quantity: c.quantity,
          unitPrice: c.unitPrice
        }))
      });
      setIsModalOpen(false);
      setCart([]); 
      await fetchInitialData();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setModalError(error.response?.data || "Lỗi khi tạo phiếu nhập kho!");
      } else {
        setModalError("Có lỗi xảy ra!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in-up">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhập kho</h1>
          <p className="text-sm text-gray-500 mt-1">Lập phiếu nhập hàng và ghi nhận chi phí</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { setIsModalOpen(true); setCart([]); setModalError(""); }} 
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">inventory</span> Lập Phiếu Nhập
          </button>
        )}
      </div>

      {/* BẢNG DANH SÁCH PHIẾU NHẬP */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="px-4 py-3 font-semibold">Mã Phiếu</th>
              <th className="px-4 py-3 font-semibold">Nhà cung cấp</th>
              <th className="px-4 py-3 font-semibold">Ngày nhập</th>
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
                  <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">Đã nhập kho</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: XEM CHI TIẾT PHIẾU NHẬP ĐÃ CÓ */}
      {selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[85vh] flex flex-col overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Chi Tiết Phiếu Nhập Hàng #PO-{selectedPO.id}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Ngày nhập: {new Date(selectedPO.orderDate).toLocaleString('vi-VN')}</p>
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
                  <p className="font-bold text-green-600 mt-0.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Đã nhập kho hoàn tất
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

            <div className="px-6 py-4 bg-gray-50 flex justify-end border-t border-gray-100">
              <button onClick={() => setSelectedPO(null)} className="px-5 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-all">Đóng lại</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: TẠO PHIẾU NHẬP KHO MỚI --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[850px] max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-rose-50/50">
              <h2 className="text-lg font-bold text-rose-900">Tạo Phiếu Nhập Kho Mới</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {modalError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{modalError}</p>}
              
              {/* 🎯 ĐỔ DỮ LIỆU ĐỘNG VÀO CHỌN NHÀ CUNG CẤP */}
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
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Chọn sản phẩm</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                    value={selectedProductId} 
                    onChange={(e) => handleProductChange(Number(e.target.value))}
                  >
                    <option value={0}>-- Click để chọn SP --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.productName} (Tồn: {p.quantity})</option>
                    ))}
                  </select>
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
                <span className="font-bold text-gray-700">Tổng chi phí nhập:</span>
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
                <span className="material-symbols-outlined text-sm">inventory_2</span>
                {isSubmitting ? "Đang xử lý..." : "Xác nhận & Nhập Kho"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}