"use client";

import { useEffect, useState } from "react";
import { InventoryService, ReconciliationDTO } from "@/app/services/InventoryService";
import { useRouter } from "next/navigation";

export default function InventoryReconciliationPage() {
  const [data, setData] = useState<ReconciliationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Chỉ Admin mới được phép xem trang này
    const role = localStorage.getItem("user_role") || "user";
    if (role.toLowerCase() !== "admin") {
      alert("Bạn không có quyền truy cập trang Đối soát Hệ thống!");
      router.push("/dashboard");
      return;
    }

    const loadData = async () => {
      try {
        const result = await InventoryService.getReconciliation();
        setData(result);
      } catch (err) {
        console.error("Lỗi đối soát dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  return (
    <div className="p-6 bg-white min-h-screen rounded-xl shadow-sm border border-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-indigo-600">balance</span>
          Kiểm Toán Dữ Liệu Tồn Kho
        </h1>
        {/* <p className="text-gray-500 mt-2 max-w-3xl">
          Công cụ đối soát dữ liệu tự động. Hệ thống sẽ trích xuất toàn bộ Lịch sử chứng từ (Tồn kho sổ sách) 
          và so sánh với Số lượng hiển thị (Tồn kho hệ thống) để phát hiện sự chênh lệch do can thiệp dữ liệu trái phép.
        </p> */}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-50 text-indigo-900 text-sm">
              <th className="py-4 px-6 font-bold uppercase tracking-widest w-20 text-center">ID</th>
              <th className="py-4 px-6 font-bold uppercase tracking-widest">Sản phẩm</th>
              <th className="py-4 px-6 font-bold uppercase tracking-widest text-center border-l border-indigo-100 bg-indigo-100/50">Tồn Kho Sổ Sách</th>
              <th className="py-4 px-6 font-bold uppercase tracking-widest text-center">Tồn Kho Hệ Thống</th>
              <th className="py-4 px-6 font-bold uppercase tracking-widest text-center">Kết Quả Đối Soát</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 font-medium text-gray-500">Đang quét toàn bộ hệ thống...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">Không có sản phẩm nào.</td></tr>
            ) : data.map((item) => (
              <tr key={item.id} className={`transition-colors ${!item.isMatch ? "bg-red-50/50" : "hover:bg-gray-50"}`}>
                <td className="py-4 px-6 text-center text-sm font-semibold text-gray-400">#{item.id}</td>
                <td className="py-4 px-6">
                  <p className="font-bold text-gray-900 text-base">{item.productName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Mã: {item.productCode}</p>
                </td>
                <td className="py-4 px-6 text-center border-l border-gray-100 bg-gray-50/30">
                  <span className="text-xl font-black text-indigo-700">{item.historyStock}</span>
                </td>
                <td className="py-4 px-6 text-center">
                  <span className="text-xl font-black text-slate-700">{item.systemStock}</span>
                </td>
                <td className="py-4 px-6 text-center">
                  {item.isMatch ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-green-200">
                      <span className="material-symbols-outlined text-sm">check_circle</span> KHỚP SỐ LIỆU
                    </span>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-red-200 shadow-sm">
                        <span className="material-symbols-outlined text-sm animate-pulse">warning</span> LỆCH ({item.difference > 0 ? `+${item.difference}` : item.difference})
                      </span>
                      <p className="text-[10.5px] text-red-500 font-medium tracking-tight">Cần kiểm tra chứng từ</p>
                    </div>
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
