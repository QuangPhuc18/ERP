"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import WorkShiftService, { WorkShiftDTO } from "../../services/WorkShiftService";

export default function DailyReportPage() {
  const [data, setData] = useState<WorkShiftDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const shifts = await WorkShiftService.getAll();
        setData(shifts);
      } catch (err) {
        console.error("Lỗi tải báo cáo ca:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const fmt = (n: number) => n.toLocaleString("vi-VN") + " đ";

  const formatShiftTime = (start: string, end?: string | null) => {
    const d1 = new Date(start);
    const time1 = d1.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
    const dateStr = d1.toLocaleDateString("vi-VN");
    if (!end) return `${time1} - Đang mở (${dateStr})`;
    const d2 = new Date(end);
    const time2 = d2.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' });
    return `${time1} - ${time2} (${dateStr})`;
  };

  // Lọc dữ liệu theo ngày
  const filteredData = data.filter(item => {
    if (!filterDate) return true;
    
    // 🎯 FIX: Khi đóng ca, ca sẽ thuộc về ngày đóng (EndTime). Nếu chưa đóng, lấy StartTime.
    const targetDate = item.endTime ? item.endTime : item.startTime;
    const d = new Date(targetDate);
    const localDateStr = d.toLocaleDateString("en-CA"); // "en-CA" format là YYYY-MM-DD
    return localDateStr === filterDate;
  });

  // Hàm Xuất ra Excel
  const exportToExcel = () => {
    // 1. Chuẩn bị dữ liệu để xuất (Mapping lại tiêu đề cho đẹp)
    const exportData = filteredData.map((item, index) => ({
      "STT": index + 1,
      "Tên nhân viên": item.employeeName,
      "Giờ làm việc": formatShiftTime(item.startTime, item.endTime),
      "Số sản phẩm": `${item.totalItems || 0} SP`,
      "Tiền đầu ca": item.startingCash,
      "Doanh thu tiền mặt": item.expectedCash - item.startingCash,
      "Tiền thực tế": item.actualCash,
      "Chênh lệch": item.variance,
      "Chuyển khoản": item.expectedTransfer,
      "Công nợ phát sinh": item.expectedDebt,
    }));

    // 2. Tạo Worksheet từ JSON
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // 3. Tạo Workbook và thêm Worksheet vào
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo ngày");

    // 4. Xuất file
    const today = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Bao_Cao_Cuoi_Ngay_${today}.xlsx`);
  };

  // Hàm tính tổng
  const totalItems = filteredData.reduce((sum, item) => sum + (item.totalItems || 0), 0);
  const totalStartingCash = filteredData.reduce((sum, item) => sum + item.startingCash, 0);
  const totalExpectedSales = filteredData.reduce((sum, item) => sum + (item.expectedCash - item.startingCash), 0);
  const totalActual = filteredData.reduce((sum, item) => sum + item.actualCash, 0);
  const totalVariance = filteredData.reduce((sum, item) => sum + item.variance, 0);
  const totalTransfer = filteredData.reduce((sum, item) => sum + item.expectedTransfer, 0);
  const totalDebt = filteredData.reduce((sum, item) => sum + item.expectedDebt, 0);

  return (
    <div className="p-6 bg-[#F5F6FA] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Báo Cáo Cuối Ngày</h1>
          <p className="text-gray-500 mt-1">Tổng hợp doanh thu theo từng nhân viên trong ngày</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="border-2 border-gray-200 focus:border-emerald-500 rounded-xl px-4 py-3 text-gray-700 font-bold outline-none transition-all cursor-pointer shadow-sm"
          />
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 active:scale-95"
          >
            <span className="material-symbols-outlined">description</span>
            XUẤT EXCEL
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-sm">
                <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest w-16 text-center">STT</th>
                <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest">Tên nhân viên</th>
                <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest">Giờ làm việc</th>
                <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest text-center">Số sản phẩm</th>
                <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest text-right">Tiền đầu ca</th>
                <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest text-right">Doanh thu tiền mặt</th>
                <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest text-right">Tiền thực tế</th>
                <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest text-right">Chênh lệch</th>
                <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest text-right">Chuyển khoản</th>
                <th className="py-4 px-6 font-bold text-gray-500 uppercase tracking-widest text-right">Công nợ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50 bg-white">
              {loading ? (
                <tr><td colSpan={9} className="py-10 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={9} className="py-10 text-center text-gray-400 font-medium">Không có dữ liệu ca làm việc cho ngày đã chọn.</td></tr>
              ) : filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-orange-50/30 transition-colors group">
                  <td className="py-4 px-6 text-center text-sm font-semibold text-gray-400">{index + 1}</td>
                  <td className="py-4 px-6 text-[15px] font-bold text-gray-900">{item.employeeName}</td>
                  <td className="py-4 px-6 text-[13px] font-medium text-gray-600">{formatShiftTime(item.startTime, item.endTime)}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-bold">
                      {item.totalItems || 0} SP
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-gray-600">{fmt(item.startingCash)}</td>
                  <td className="py-4 px-6 text-right font-medium text-gray-600">{fmt(item.expectedCash - item.startingCash)}</td>
                  <td className="py-4 px-6 text-right font-black text-emerald-600 bg-emerald-50/30">{fmt(item.actualCash)}</td>
                  <td className="py-4 px-6 text-right font-bold">
                    <span className={item.variance < 0 ? "text-red-500" : item.variance > 0 ? "text-blue-500" : "text-gray-400"}>
                      {item.variance > 0 ? "+" : ""}{fmt(item.variance)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right font-medium text-gray-600">{fmt(item.expectedTransfer)}</td>
                  <td className="py-4 px-6 text-right font-medium text-gray-600">{fmt(item.expectedDebt)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50/80 border-t-2 border-gray-100">
              <tr>
                <td colSpan={3} className="py-5 px-6 font-black text-gray-900 text-right uppercase tracking-widest">TỔNG TOÀN CA:</td>
                <td className="py-5 px-6 text-center">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-black">
                    {totalItems} SP
                  </span>
                </td>
                <td className="py-5 px-6 text-right font-bold text-gray-600">{fmt(totalStartingCash)}</td>
                <td className="py-5 px-6 text-right font-bold text-gray-600">{fmt(totalExpectedSales)}</td>
                <td className="py-5 px-6 text-right font-black text-emerald-700 bg-emerald-100/50">{fmt(totalActual)}</td>
                <td className="py-5 px-6 text-right font-black">
                  <span className={totalVariance < 0 ? "text-red-500" : totalVariance > 0 ? "text-blue-500" : "text-gray-400"}>
                    {totalVariance > 0 ? "+" : ""}{fmt(totalVariance)}
                  </span>
                </td>
                <td className="py-5 px-6 text-right font-black text-gray-700">{fmt(totalTransfer)}</td>
                <td className="py-5 px-6 text-right font-black text-orange-600">{fmt(totalDebt)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
