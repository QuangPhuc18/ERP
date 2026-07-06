"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import axios from "axios";
import Link from "next/link";
import PayrollService from "../../services/PayrollService";
import EmployeeService, { EmployeeDTO } from "../../services/EmployeeService";

interface AdvanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  amount: number;
  advanceDate: string;
  reason: string;
  isDeducted: boolean;
}

interface AdvanceFormData {
  employeeId: number;
  amount: number;
  advanceDate: string;
  reason: string;
}

export default function AdvancesPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [advancesList, setAdvancesList] = useState<AdvanceRecord[]>([]);
  
  const [filterMonth, setFilterMonth] = useState<number>(currentMonth);
  const [filterYear, setFilterYear] = useState<number>(currentYear);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<AdvanceFormData>({
    employeeId: 0,
    amount: 0,
    advanceDate: new Date().toISOString().split('T')[0],
    reason: ""
  });

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await EmployeeService.getAll();
      startTransition(() => {
        setEmployees(data);
      });
    } catch (err) {
      console.error("Lỗi fetch nhân viên:", err);
    }
  }, []);

  const fetchAdvances = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await PayrollService.getAdvances(filterMonth, filterYear);
      
      const normalizedData: AdvanceRecord[] = data.map((item: any) => ({
        id: item.id ?? item.Id,
        employeeId: item.employeeId ?? item.EmployeeId,
        employeeName: item.employeeName ?? item.EmployeeName,
        amount: item.amount ?? item.Amount ?? 0,
        advanceDate: item.advanceDate ?? item.AdvanceDate,
        reason: item.reason ?? item.Reason ?? "",
        isDeducted: item.isDeducted ?? item.IsDeducted ?? false
      }));

      startTransition(() => {
        setAdvancesList(normalizedData);
      });
    } catch (err) {
      console.error("Lỗi fetch tạm ứng:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filterMonth, filterYear]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchAdvances();
  }, [fetchAdvances]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.employeeId === 0) { alert("Vui lòng chọn nhân viên!"); return; }
    if (formData.amount <= 0) { alert("Số tiền phải lớn hơn 0!"); return; }

    setIsSubmitting(true);
    try {
      await PayrollService.createAdvance({
        employeeId: formData.employeeId,
        amount: formData.amount,
        advanceDate: formData.advanceDate,
        reason: formData.reason
      });
      setIsModalOpen(false);
      alert("Tạo phiếu tạm ứng thành công!");
      fetchAdvances();
      
      // Reset form
      setFormData({
        employeeId: 0,
        amount: 0,
        advanceDate: new Date().toISOString().split('T')[0],
        reason: ""
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(`Lỗi: ${err.response?.data?.message || err.response?.data || "Không thể tạo tạm ứng"}`);
      } else {
        alert("Lỗi hệ thống");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-200 mb-6 mt-2">
        <Link 
          href="/dashboard/timesheets" 
          className="px-6 py-3 font-semibold text-sm border-b-2 transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">schedule</span>
            Bảng Công
          </div>
        </Link>
        <Link 
          href="/dashboard/payroll" 
          className="px-6 py-3 font-semibold text-sm border-b-2 transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">payments</span>
            Bảng Lương
          </div>
        </Link>
        <Link 
          href="/dashboard/advances" 
          className="px-6 py-3 font-semibold text-sm border-b-2 transition-colors border-orange-500 text-orange-600"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">request_quote</span>
            Tạm Ứng
          </div>
        </Link>
      </div>

      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Tạm Ứng</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-orange-700 transition shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Ghi nhận tạm ứng
          </button>
        </div>
      </div>

      {/* BỘ LỌC */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Tháng tạm ứng</label>
          <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} className="w-32 p-2 border rounded-lg outline-none focus:border-orange-500">
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>Tháng {i+1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Năm</label>
          <input type="number" value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className="w-32 p-2 border rounded-lg outline-none focus:border-orange-500" />
        </div>
      </div>

      {/* BẢNG HIỂN THỊ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : advancesList.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">request_quote</span>
            <p>Chưa có dữ liệu tạm ứng tháng {filterMonth}/{filterYear}</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold">Mã ID</th>
                <th className="p-4 font-semibold">Họ và Tên</th>
                <th className="p-4 font-semibold">Ngày ứng</th>
                <th className="p-4 font-semibold text-right">Số tiền</th>
                <th className="p-4 font-semibold">Lý do</th>
                <th className="p-4 font-semibold text-center">Trạng thái khấu trừ</th>
              </tr>
            </thead>
            <tbody>
              {advancesList.map((record, index) => (
                <tr key={record.id || index} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="p-4 text-sm font-medium text-gray-500">#{record.id}</td>
                  <td className="p-4 font-bold text-gray-800">{record.employeeName}</td>
                  <td className="p-4 text-gray-600">{new Date(record.advanceDate).toLocaleDateString('vi-VN')}</td>
                  <td className="p-4 text-right font-bold text-amber-600">
                    {record.amount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-4 text-gray-500 italic max-w-xs truncate" title={record.reason}>{record.reason || '-'}</td>
                  <td className="p-4 text-center">
                    {record.isDeducted ? (
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">done_all</span>
                        Đã trừ vào lương
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">pending</span>
                        Đang ghi nợ
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL GHI NHẬN TẠM ỨNG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Ghi nhận Tạm ứng mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Nhân viên <span className="text-red-500">*</span></label>
                <select 
                  value={formData.employeeId} 
                  onChange={(e) => setFormData({...formData, employeeId: Number(e.target.value)})}
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-orange-500"
                >
                  <option value={0}>-- Chọn nhân viên --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                </select>
              </div>
              
              <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Số tiền (VNĐ) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" step="1000" value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg outline-none focus:border-orange-500 font-medium text-amber-600" placeholder="VD: 2000000" />
              </div>

              <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Ngày tạm ứng</label>
                  <input type="date" value={formData.advanceDate} onChange={(e) => setFormData({...formData, advanceDate: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:border-orange-500" />
              </div>
              
              <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Lý do (Không bắt buộc)</label>
                  <textarea value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:border-orange-500" rows={2} placeholder="Vd: Ứng tiền sinh hoạt..."></textarea>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition">Hủy bỏ</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50">
                    {isSubmitting ? "Đang lưu..." : "Xác nhận ghi nợ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
