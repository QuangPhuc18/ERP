"use client";

import React, { useEffect, useState, useCallback } from "react";
import PayableService, { UnpaidPurchaseOrderDTO, PaymentHistoryDTO } from "../../services/PayableService";
import axios from "axios";

export default function PayablesPage() {
  const [activeTab, setActiveTab] = useState<"UNPAID" | "HISTORY">("UNPAID");
  const [unpaidPOs, setUnpaidPOs] = useState<UnpaidPurchaseOrderDTO[]>([]);
  const [historyPOs, setHistoryPOs] = useState<PaymentHistoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- THÊM STATE PHÂN TRANG & LỌC ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  // Modal Thanh Toán
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<UnpaidPurchaseOrderDTO | null>(null);
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  // Modal Chi tiết lịch sử
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryPO, setSelectedHistoryPO] = useState<PaymentHistoryDTO | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (activeTab === "UNPAID") {
        const data = await PayableService.getUnpaidPurchaseOrders(currentPage, 20, selectedMonth, selectedYear);
        setUnpaidPOs(data.items || []);
        setTotalPages(data.totalPages || 1);
      } else {
        const data = await PayableService.getPaymentHistory(currentPage, 20, selectedMonth, selectedYear);
        setHistoryPOs(data.items || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Lỗi khi tải công nợ:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage, selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

  const openPaymentModal = (po: UnpaidPurchaseOrderDTO) => {
    setSelectedPO(po);
    setAmountToPay(po.remainingAmount);
    setModalError("");
    setIsModalOpen(true);
  };

  const handlePay = async () => {
    if (!selectedPO) return;
    if (amountToPay <= 0) {
      setModalError("Số tiền thanh toán phải lớn hơn 0");
      return;
    }
    if (amountToPay > selectedPO.remainingAmount) {
      setModalError(`Không được thanh toán vượt quá số tiền còn nợ (${formatCurrency(selectedPO.remainingAmount)})`);
      return;
    }

    setIsSubmitting(true);
    setModalError("");
    try {
      await PayableService.payPurchaseOrder(selectedPO.id, amountToPay);
      alert("Đã thanh toán thành công!");
      setIsModalOpen(false);
      loadData(); // Tải lại danh sách
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setModalError(error.response?.data || "Lỗi khi thanh toán!");
      } else {
        setModalError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Công Nợ</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi và thanh toán công nợ cho Nhà cung cấp</p>
        </div>
        <div className="bg-rose-50 px-4 py-2 rounded-lg border border-rose-100">
          <span className="text-sm font-bold text-gray-600 mr-2">Tổng nợ cần trả:</span>
          <span className="text-xl font-black text-rose-600">
            {formatCurrency(unpaidPOs.reduce((sum, po) => sum + po.remainingAmount, 0))}
          </span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button 
          onClick={() => { setActiveTab("UNPAID"); setCurrentPage(1); }}
          className={`pb-3 px-2 font-bold transition-all ${activeTab === "UNPAID" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}
        >
          Phiếu Cần Thanh Toán
        </button>
        <button 
          onClick={() => { setActiveTab("HISTORY"); setCurrentPage(1); }}
          className={`pb-3 px-2 font-bold transition-all ${activeTab === "HISTORY" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-800"}`}
        >
          Lịch sử Giao dịch
        </button>
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
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-gray-700"
        />
        <button 
          onClick={() => { setSelectedMonth(currentMonth); setSelectedYear(currentYear); setCurrentPage(1); }}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Tháng hiện tại
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="px-4 py-3 font-semibold">Mã Phiếu</th>
              <th className="px-4 py-3 font-semibold">Nhà cung cấp</th>
              <th className="px-4 py-3 font-semibold text-right">Tổng Tiền Nhập</th>
              <th className="px-4 py-3 font-semibold text-right">Đã Thanh Toán</th>
              <th className="px-4 py-3 font-semibold text-right text-rose-600">CÒN NỢ</th>
              <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
              <th className="px-4 py-3 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : activeTab === "UNPAID" ? (
              unpaidPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-gray-400 mb-2 material-symbols-outlined text-4xl">check_circle</div>
                    <div className="text-gray-500 font-medium">Tuyệt vời! Doanh nghiệp không có khoản nợ nào cần thanh toán.</div>
                  </td>
                </tr>
              ) : unpaidPOs.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-900">#PO-{po.id}</td>
                  <td className="px-4 py-3 font-medium text-blue-700">{po.supplierName}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(po.totalAmount)}</td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(po.paidAmount)}</td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600 bg-rose-50/30">{formatCurrency(po.remainingAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    {po.paymentStatus === "Partial" ? (
                      <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">TRẢ 1 PHẦN</span>
                    ) : (
                      <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200">CHƯA TRẢ</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => openPaymentModal(po)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      Thanh Toán
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              historyPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-gray-400 mb-2 material-symbols-outlined text-4xl">history</div>
                    <div className="text-gray-500 font-medium">Chưa có giao dịch thanh toán nào được ghi nhận.</div>
                  </td>
                </tr>
              ) : historyPOs.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-900">#PO-{po.id}</td>
                  <td className="px-4 py-3 font-medium text-blue-700">{po.supplierName}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(po.totalAmount)}</td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">{formatCurrency(po.paidAmount)}</td>
                  <td className="px-4 py-3 text-right font-bold text-rose-600">{formatCurrency(po.remainingAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    {po.paymentStatus === "Paid" ? (
                      <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">HOÀN TẤT</span>
                    ) : (
                      <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">TRẢ 1 PHẦN</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => { setSelectedHistoryPO(po); setIsHistoryModalOpen(true); }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border border-gray-300"
                    >
                      Chi Tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
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

      {/* MODAL THANH TOÁN */}
      {isModalOpen && selectedPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-indigo-900">Thanh toán nợ phiếu #PO-{selectedPO.id}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {modalError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 font-medium">{modalError}</p>}
              
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <p className="text-gray-500 mb-1">Nhà cung cấp:</p>
                  <p className="font-bold text-gray-800">{selectedPO.supplierName}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 mb-1">Số nợ còn lại:</p>
                  <p className="font-bold text-rose-600 text-lg">{formatCurrency(selectedPO.remainingAmount)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nhập số tiền muốn thanh toán đợt này:</label>
                <div className="relative">
                  <input 
                    type="number"
                    className="w-full px-4 py-3 text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
                    value={amountToPay}
                    onChange={(e) => setAmountToPay(Number(e.target.value))}
                    max={selectedPO.remainingAmount}
                  />
                  <span className="absolute right-4 top-3.5 text-gray-400 font-bold">VNĐ</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span> 
                  Nếu không đủ tiền, bạn có thể nhập số tiền nhỏ hơn để trả làm nhiều đợt.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Hủy</button>
              <button 
                onClick={handlePay}
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">payments</span>
                {isSubmitting ? "Đang xử lý..." : "Xác nhận Thanh Toán"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT LỊCH SỬ GIAO DỊCH */}
      {isHistoryModalOpen && selectedHistoryPO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết giao dịch #PO-{selectedHistoryPO.id}</h2>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-sm mb-6 border-b border-gray-100 pb-4">
                <div><span className="text-gray-500">Nhà cung cấp:</span> <span className="font-bold">{selectedHistoryPO.supplierName}</span></div>
                <div className="text-right"><span className="text-gray-500">Trạng thái:</span> <span className="font-bold text-indigo-600">{selectedHistoryPO.paymentStatus}</span></div>
                <div><span className="text-gray-500">Tổng tiền:</span> <span className="font-bold text-green-600">{formatCurrency(selectedHistoryPO.totalAmount)}</span></div>
                <div className="text-right"><span className="text-gray-500">Đã trả:</span> <span className="font-bold">{formatCurrency(selectedHistoryPO.paidAmount)}</span></div>
              </div>

              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">receipt_long</span> Các đợt thanh toán</h3>
              <div className="space-y-3">
                {selectedHistoryPO.payments.map((p, index) => (
                  <div key={p.id} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm flex justify-between items-center hover:border-indigo-300 transition-colors">
                    <div className="flex gap-4 items-center">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black">
                        #{selectedHistoryPO.payments.length - index}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{new Date(p.paymentDate).toLocaleString("vi-VN")}</p>
                        <p className="text-xs text-gray-500 mt-1">{p.note}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black text-green-600">+{formatCurrency(p.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
