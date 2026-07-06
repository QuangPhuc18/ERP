"use client";

import { useEffect, useState } from "react";
import { InventoryService, StockTakeDTO } from "@/app/services/InventoryService";

export default function StockTakesPage() {
  const [stockTakes, setStockTakes] = useState<StockTakeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  // Giả lập role admin để hiển thị nút Duyệt
  const [isAdmin, setIsAdmin] = useState(false);

  const loadData = async () => {
    try {
      const data = await InventoryService.getStockTakes();
      setStockTakes(data);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử kiểm kho:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsAdmin(localStorage.getItem("user_role") === "admin");
    loadData();
  }, []);

  const handleConfirm = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn Duyệt Phiếu kiểm kho này? (Tồn kho thực tế sẽ thay đổi theo phiếu)")) {
      return;
    }

    setConfirmingId(id);
    try {
      await InventoryService.confirmStockTake(id);
      alert("Đã duyệt Phiếu Kiểm Kho thành công! Tồn kho đã được cập nhật.");
      loadData();
    } catch (err: any) {
      alert(err.response?.data || "Lỗi khi duyệt phiếu.");
    } finally {
      setConfirmingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Draft") {
      return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold border border-orange-200">ĐANG CHỜ DUYỆT</span>;
    }
    if (status === "Completed") {
      return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-200">ĐÃ CHỐT KHO</span>;
    }
    return <span>{status}</span>;
  };

  return (
    <div className="p-6 bg-[#F5F6FA] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-gray-700">fact_check</span>
          Lịch Sử Phiếu Kiểm Kho
        </h1>
        <p className="text-gray-500 mt-2">
          Theo dõi các đợt kiểm đếm hàng hóa thực tế và quản lý duyệt tồn kho.
        </p>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100 text-sm">
              <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest w-24">Mã Phiếu</th>
              <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest">Thời gian</th>
              <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest">Người đếm</th>
              <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest text-center">Ghi chú</th>
              <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest text-center">Trạng Thái</th>
              <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10">Đang tải dữ liệu...</td></tr>
            ) : stockTakes.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-500">Chưa có phiếu kiểm kho nào.</td></tr>
            ) : stockTakes.map((st) => (
              <tr key={st.id} className="transition-colors hover:bg-gray-50">
                <td className="py-5 px-6 font-black text-gray-900">{st.code}</td>
                <td className="py-5 px-6 text-sm text-gray-700">
                  {new Date(st.checkDate).toLocaleString("vi-VN")}
                </td>
                <td className="py-5 px-6 font-medium text-gray-800">{st.employeeName}</td>
                <td className="py-5 px-6 text-sm text-gray-500 text-center max-w-[200px] truncate" title={st.note}>
                  {st.note || "-"}
                  <div className="text-[11px] text-gray-400 mt-1">Gồm {st.itemsCount} dòng SP</div>
                </td>
                <td className="py-5 px-6 text-center">{getStatusBadge(st.status)}</td>
                <td className="py-5 px-6 text-right">
                  {st.status === "Draft" && isAdmin ? (
                    <button
                      onClick={() => handleConfirm(st.id)}
                      disabled={confirmingId === st.id}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 disabled:bg-gray-400"
                    >
                      {confirmingId === st.id ? "ĐANG DUYỆT..." : "XÁC NHẬN ĐIỀU CHỈNH"}
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">Không có quyền duyệt</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
