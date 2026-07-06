"use client";

import { useEffect, useState } from "react";
import { InventoryService, InventoryTransactionDTO } from "@/app/services/InventoryService";

export default function InventoryTransactionsPage() {
  const [transactions, setTransactions] = useState<InventoryTransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States Lọc & Phân trang
  const [filterType, setFilterType] = useState<string>("ALL"); 
  const [dateFilter, setDateFilter] = useState<string>("THIS_MONTH");
  const [startDate, setStartDate] = useState<string>(""); 
  const [endDate, setEndDate] = useState<string>(""); 
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 15;

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await InventoryService.getTransactions({
        filterType,
        dateFilter,
        startDate,
        endDate,
        page,
        pageSize
      });
      setTransactions(result.data);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Lỗi khi tải nhật ký:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset trang về 1 khi đổi bộ lọc
  useEffect(() => {
    setPage(1);
  }, [filterType, dateFilter, startDate, endDate]);

  // Load data khi bộ lọc hoặc trang thay đổi
  useEffect(() => {
    loadData();
  }, [filterType, dateFilter, startDate, endDate, page]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "IMPORT": return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-200">NHẬP KHO</span>;
      case "SALE": return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-200">XUẤT BÁN</span>;
      case "ADJUSTMENT": return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold border border-orange-200">ĐIỀU CHỈNH</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold">{type}</span>;
    }
  };

  const getQuantityDisplay = (qty: number) => {
    if (qty > 0) return <span className="text-emerald-600 font-black">+{qty}</span>;
    if (qty < 0) return <span className="text-red-600 font-black">{qty}</span>;
    return <span className="text-gray-500 font-black">{qty}</span>;
  };

  return (
    <div className="p-6 bg-[#F5F6FA] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-gray-700">history</span>
          Nhật Ký Tồn Kho
        </h1>
        <p className="text-gray-500 mt-2">
          Lịch sử biến động hàng hóa: Nhập hàng, Bán hàng POS và Kiểm kho.
        </p>
      </div>

      {/* 🎯 BỘ LỌC */}
      <div className="mb-6 flex flex-wrap gap-4 items-end bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Khoảng thời gian</label>
          <div className="flex gap-2 items-center">
            <select
              className="w-40 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                if (e.target.value !== "CUSTOM") {
                  setStartDate("");
                  setEndDate("");
                }
              }}
            >
              <option value="ALL">Tất cả thời gian</option>
              <option value="TODAY">Hôm nay</option>
              <option value="THIS_WEEK">Tuần này</option>
              <option value="THIS_MONTH">Tháng này</option>
              <option value="CUSTOM">Tùy chọn...</option>
            </select>

            <div className="flex items-center gap-2">
              <input 
                type="date" 
                title="Từ ngày"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setDateFilter("CUSTOM"); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 cursor-pointer"
              />
              <span className="text-gray-400 font-bold">-</span>
              <input 
                type="date" 
                title="Đến ngày"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setDateFilter("CUSTOM"); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Loại Giao Dịch</label>
          <select
            className="w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">Tất cả giao dịch</option>
            <option value="NO_SALES">Chỉ Nhập & Kiểm Kho (Ẩn Bán hàng)</option>
            <option value="IMPORT">Chỉ Nhập Kho</option>
            <option value="ADJUSTMENT">Chỉ Kiểm Kho (Điều chỉnh)</option>
            <option value="SALE">Chỉ Bán Hàng (POS)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-sm">
              <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest w-16 text-center">ID</th>
              <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest">Thời gian</th>
              <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest">Sản phẩm</th>
              <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest text-center">Loại Giao Dịch</th>
              <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest text-center">Số lượng</th>
              <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10">Đang tải dữ liệu...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">Không tìm thấy giao dịch nào phù hợp.</td></tr>
            ) : transactions.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-gray-50">
                <td className="py-4 px-6 text-center text-sm font-semibold text-gray-400">#{t.id}</td>
                <td className="py-4 px-6 text-sm font-medium text-gray-700">
                  {new Date(t.transactionDate).toLocaleString("vi-VN")}
                </td>
                <td className="py-4 px-6 text-[15px] font-bold text-gray-900">{t.productName}</td>
                <td className="py-4 px-6 text-center">{getTypeBadge(t.transactionType)}</td>
                <td className="py-4 px-6 text-center text-lg">{getQuantityDisplay(t.quantity)}</td>
                <td className="py-4 px-6 text-sm text-gray-500">{t.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🎯 UI PHÂN TRANG */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 border border-gray-200 rounded-lg text-gray-600 font-bold transition-all"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span> Trang Trước
          </button>
          
          <div className="text-sm font-bold text-gray-600">
            Trang {page} / {totalPages}
          </div>

          <button 
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 border border-gray-200 rounded-lg text-gray-600 font-bold transition-all"
          >
            Trang Sau <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
