"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InventoryService, InventoryCheckDTO } from "@/app/services/InventoryService";

export default function InventoryCheckPage() {
  const router = useRouter();
  const [products, setProducts] = useState<InventoryCheckDTO[]>([]);
  const [actualCounts, setActualCounts] = useState<{ [key: number]: string }>({});
  const [reasons, setReasons] = useState<{ [key: number]: string }>({});
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Đưa hàm loadData vào trong useEffect để tránh lỗi chưa khai báo và lỗi dependency
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await InventoryService.getInventoryForCheck();
        setProducts(result);
      } catch (err) {
        setError("Không thể kết nối đến máy chủ để lấy dữ liệu kho.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSaveStockTake = async () => {
    const items = [];
    
    // Lọc ra những sản phẩm người dùng có nhập số liệu thực tế
    for (const p of products) {
      const actualStr = actualCounts[p.id];
      if (actualStr && actualStr.trim() !== "") {
        const actualNum = Number(actualStr);
        if (!isNaN(actualNum)) {
          items.push({
            productId: p.id,
            systemStock: p.systemStock,
            actualStock: actualNum,
            reason: reasons[p.id] || ""
          });
        }
      }
    }

    if (items.length === 0) {
      return alert("Vui lòng nhập số lượng đếm thực tế cho ít nhất một sản phẩm!");
    }

    setSaving(true);
    try {
      await InventoryService.createStockTake({ note, items });
      alert("Đã lưu Phiếu Kiểm Kho thành công! (Trạng thái: Bản Nháp)");
      router.push("/dashboard/stock-takes"); 
    } catch (err: unknown) {
      // Xử lý lỗi chuẩn TypeScript không dùng 'any'
      const axiosError = err as { response?: { data?: string }, message?: string };
      const errorMessage = axiosError.response?.data || axiosError.message || "Đã xảy ra lỗi khi lưu phiếu kiểm kho.";
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // --- HELPER FUNCTION: Xử lý logic hiển thị trạng thái lệch kho ---
  const renderStatus = (systemStock: number, actualStr?: string) => {
    if (!actualStr || actualStr.trim() === "") {
      return { text: "-", badgeClass: "text-gray-400", diffText: "" };
    }
    
    const actual = Number(actualStr);
    if (isNaN(actual)) {
      return { text: "Lỗi nhập", badgeClass: "text-red-500", diffText: "" };
    }

    const diff = actual - systemStock;
    if (diff === 0) {
      return { text: "Khớp", badgeClass: "bg-gray-100 text-gray-700 px-2 py-1 rounded", diffText: "0" };
    }
    if (diff > 0) {
      return { text: "Thừa hàng", badgeClass: "bg-blue-100 text-blue-700 px-2 py-1 rounded", diffText: `+${diff}` };
    }
    return { text: "Thiếu hàng", badgeClass: "bg-red-100 text-red-700 px-2 py-1 rounded", diffText: `${diff}` };
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* Header Section */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thực Hiện Đếm Kho</h1>
          <p className="text-slate-500 text-sm mt-1">
            Nhập số lượng đếm thực tế ngoài kệ. Hệ thống sẽ tự động tính chênh lệch.
          </p>
        </div>
        <button 
          onClick={handleSaveStockTake}
          disabled={saving || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
        >
          {saving ? "Đang lưu liệu..." : "Lưu Bản Nháp"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto mb-6">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase">
              <th className="py-3 px-4 font-semibold w-24">Mã SP</th>
              <th className="py-3 px-4 font-semibold">Tên sản phẩm</th>
              <th className="py-3 px-4 font-semibold text-center w-32">Tồn hệ thống</th>
              <th className="py-3 px-4 font-semibold text-center w-32">Tồn thực tế</th>
              <th className="py-3 px-4 font-semibold text-center w-24">Độ lệch</th>
              <th className="py-3 px-4 font-semibold text-center w-28">Trạng thái</th>
              <th className="py-3 px-4 font-semibold">Lý do điều chỉnh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500">Đang tải dữ liệu kho...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500">Không có sản phẩm nào cần kiểm kê.</td>
              </tr>
            ) : (
              products.map((item) => {
                const actualVal = actualCounts[item.id];
                const status = renderStatus(item.systemStock, actualVal);
                const hasInput = actualVal && actualVal.trim() !== "";
                const isMismatch = hasInput && Number(actualVal) !== item.systemStock;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500">{item.productCode}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{item.productName}</td>
                    
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">
                        {item.systemStock}
                      </span>
                    </td>
                    
                    <td className="py-3 px-4 text-center">
                      <input 
                        type="number" 
                        placeholder="0"
                        min="0"
                        className="w-20 text-center px-2 py-1.5 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        value={actualCounts[item.id] || ''}
                        onChange={(e) => setActualCounts({ ...actualCounts, [item.id]: e.target.value })}
                      />
                    </td>

                    <td className={`py-3 px-4 text-center font-semibold ${status.diffText.startsWith('-') ? 'text-red-600' : 'text-blue-600'}`}>
                      {status.diffText}
                    </td>

                    <td className="py-3 px-4 text-center text-xs">
                      <span className={status.badgeClass}>{status.text}</span>
                    </td>

                    <td className="py-3 px-4">
                      <input 
                        type="text" 
                        placeholder={isMismatch ? "Nhập lý do lệch..." : ""} 
                        disabled={!isMismatch}
                        className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded focus:border-blue-500 outline-none disabled:bg-slate-50 disabled:cursor-not-allowed transition-all"
                        value={reasons[item.id] || ''}
                        onChange={(e) => setReasons({ ...reasons, [item.id]: e.target.value })}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Note Section */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú đợt kiểm kho</label>
        <textarea 
          className="w-full border border-slate-300 rounded text-sm p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
          rows={3}
          placeholder="Nhập ghi chú cho đợt kiểm kê này (không bắt buộc)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        ></textarea>
      </div>

    </div>
  );
}