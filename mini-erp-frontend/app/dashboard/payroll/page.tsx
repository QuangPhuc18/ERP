"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import axios from "axios";
import PayrollService from "../../services/PayrollService";
import EmployeeService, { EmployeeDTO } from "../../services/EmployeeService";

interface PayrollFormData {
  employeeId: number;
  month: number;
  year: number;
}

interface TimesheetFormData {
  employeeId: number;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  breakHours: number;
}

// 🎯 1. Định nghĩa chuẩn xác Interface cho Bảng lương
interface PayrollRecord {
  id: number;
  employeeName: string;
  totalWorkDays: number;
  totalHours: number;
  totalAmount: number;
  calculatedAt: string;
  isPaid: boolean;
}

// 🎯 2. Tạo Interface để fix triệt để lỗi gạch đỏ 'any'
interface CalculateResponse {
  message?: string;
  data?: {
    totalAmount?: number;
  };
  totalAmount?: number;
}

export default function PayrollPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [payrollList, setPayrollList] = useState<PayrollRecord[]>([]);
  const [filterMonth, setFilterMonth] = useState<number>(currentMonth);
  const [filterYear, setFilterYear] = useState<number>(currentYear);

  const [calculationData, setCalculationData] = useState<PayrollFormData>({
    employeeId: 0,
    month: currentMonth,
    year: currentYear
  });

  const [isTimesheetModalOpen, setIsTimesheetModalOpen] = useState(false);
  const [isSubmittingTimesheet, setIsSubmittingTimesheet] = useState(false);
  const [timesheetData, setTimesheetData] = useState<TimesheetFormData>({
    employeeId: 0,
    date: new Date().toISOString().split('T')[0],
    checkInTime: "08:00",
    checkOutTime: "17:00",
    breakHours: 0
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

  const fetchPayrollList = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await PayrollService.getList(filterMonth, filterYear);
      
      // 🎯 3. FIX LỖI DỮ LIỆU RỖNG TRÊN MÀN HÌNH: Đồng bộ hóa chữ Hoa/Thường từ C# sang React
      const normalizedData: PayrollRecord[] = data.map((item: Record<string, unknown>) => ({
        id: item.id ?? item.Id,
        employeeName: item.employeeName ?? item.EmployeeName,
        totalWorkDays: item.totalWorkDays ?? item.TotalWorkDays ?? 0,
        totalHours: item.totalHours ?? item.TotalHours ?? 0,
        totalAmount: item.totalAmount ?? item.TotalAmount ?? 0,
        calculatedAt: item.calculatedAt ?? item.CalculatedAt,
        isPaid: item.isPaid ?? item.IsPaid ?? false
      }));

      startTransition(() => {
        setPayrollList(normalizedData);
      });
    } catch (err) {
      console.error("Lỗi fetch bảng lương:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filterMonth, filterYear]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchPayrollList();
  }, [fetchPayrollList]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calculationData.employeeId === 0) { alert("Vui lòng chọn nhân viên!"); return; }

    setIsSubmitting(true);
    try {
      const result = await PayrollService.calculateAndSave(calculationData);
      
      // 🎯 4. FIX LỖI GẠCH ĐỎ 'any': Sử dụng Type Casting với Interface an toàn
      const amount = typeof result === 'object' && result !== null
        ? (result as CalculateResponse).data?.totalAmount || (result as CalculateResponse).totalAmount || 0 
        : Number(result) || 0;

      setIsModalOpen(false);
      const empName = employees.find(x => x.id === calculationData.employeeId)?.fullName;
      alert(`🎉 Tính lương thành công cho: ${empName}\n💰 Thực nhận: ${amount.toLocaleString('vi-VN')} VNĐ`);
      
      fetchPayrollList();
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(`Lỗi: ${err.response?.data?.message || err.response?.data || "Không thể tính lương"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    if (!window.confirm("Xác nhận đã chuyển khoản cho nhân viên này?")) return;
    
    try {
      await PayrollService.markAsPaid(id);
      fetchPayrollList(); 
      alert("Đã cập nhật trạng thái chi trả thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái.");
    }
  };

  const handleTimesheetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timesheetData.employeeId === 0) { alert("Vui lòng chọn nhân viên!"); return; }

    setIsSubmittingTimesheet(true);
    try {
      const fullCheckIn = `${timesheetData.date}T${timesheetData.checkInTime}:00`;
      const fullCheckOut = `${timesheetData.date}T${timesheetData.checkOutTime}:00`;
      
      await PayrollService.submitTimesheet({
        employeeId: timesheetData.employeeId,
        date: timesheetData.date,
        checkInTime: fullCheckIn,
        checkOutTime: fullCheckOut,
        breakHours: timesheetData.breakHours
      });
      setIsTimesheetModalOpen(false);
      alert("Chấm công thành công!");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(`Lỗi: ${err.response?.data || "Không thể chấm công"}`);
      } else {
        alert("Lỗi hệ thống");
      }
    } finally {
      setIsSubmittingTimesheet(false);
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Bảng Lương</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsTimesheetModalOpen(true)} 
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">schedule</span>
            Chấm công hàng ngày
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-[#10B981] text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-600 transition shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">calculate</span>
            Chốt bảng lương
          </button>
        </div>
      </div>

      {/* BỘ LỌC */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Kỳ lương (Tháng)</label>
          <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} className="w-32 p-2 border rounded-lg outline-none focus:border-[#10B981]">
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>Tháng {i+1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Năm</label>
          <input type="number" value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className="w-32 p-2 border rounded-lg outline-none focus:border-[#10B981]" />
        </div>
      </div>

      {/* BẢNG HIỂN THỊ LƯƠNG */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : payrollList.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
            <p>Chưa có dữ liệu lương tháng {filterMonth}/{filterYear}</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold">Mã ID</th>
                <th className="p-4 font-semibold">Họ và Tên</th>
                <th className="p-4 font-semibold">Thời gian làm việc</th>
                <th className="p-4 font-semibold text-right">Lương thực nhận</th>
                <th className="p-4 font-semibold text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {payrollList.map((record, index) => (
                <tr key={record.id || index} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="p-4 text-sm font-medium text-gray-500">#{record.id}</td>
                  <td className="p-4 font-medium text-gray-800">{record.employeeName}</td>
                  <td className="p-4 text-gray-600">
                    {record.totalWorkDays > 0 && <span className="block">{record.totalWorkDays} ngày</span>}
                    {record.totalHours > 0 && <span className="block text-blue-600">{record.totalHours} giờ</span>}
                    {record.totalWorkDays === 0 && record.totalHours === 0 && <span>0</span>}
                  </td>
                  <td className="p-4 text-right font-bold text-[#10B981]">
                    {record.totalAmount.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="p-4 text-center">
                    {record.isPaid ? (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-max mx-auto">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Đã chi trả
                      </span>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                          Chưa chi
                        </span>
                        <button 
                          onClick={() => handleMarkAsPaid(record.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded transition flex items-center"
                          title="Bấm để xác nhận đã chuyển khoản"
                        >
                          <span className="material-symbols-outlined text-sm">payments</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL TÍNH LƯƠNG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Tính lương nhân viên</h3>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Nhân viên</label>
                <select 
                  value={calculationData.employeeId} 
                  onChange={(e) => setCalculationData({...calculationData, employeeId: Number(e.target.value)})}
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-[#10B981]"
                >
                  <option value={0}>-- Chọn nhân viên --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                </select>
              </div>
              
              <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Tháng</label>
                    <input type="number" min="1" max="12" value={calculationData.month} onChange={(e) => setCalculationData({...calculationData, month: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg outline-none focus:border-[#10B981]" />
                </div>
                <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Năm</label>
                    <input type="number" value={calculationData.year} onChange={(e) => setCalculationData({...calculationData, year: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg outline-none focus:border-[#10B981]" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 border rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition">Hủy bỏ</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-[#10B981] text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50">
                    {isSubmitting ? "Đang tính..." : "Xác nhận tính lương"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHẤM CÔNG */}
      {isTimesheetModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Chấm công hàng ngày</h3>
            <form onSubmit={handleTimesheetSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Nhân viên <span className="text-red-500">*</span></label>
                <select 
                  value={timesheetData.employeeId} 
                  onChange={(e) => setTimesheetData({...timesheetData, employeeId: Number(e.target.value)})}
                  className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600"
                >
                  <option value={0}>-- Chọn nhân viên --</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
                </select>
              </div>
              
              <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Ngày làm việc</label>
                  <input type="date" value={timesheetData.date} onChange={(e) => setTimesheetData({...timesheetData, date: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600" />
              </div>

              <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Giờ vào (Check-in)</label>
                    <input type="text" placeholder="VD: 08:00" pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$" title="Nhập theo định dạng 24h (VD: 08:00 hoặc 14:30)" required value={timesheetData.checkInTime} onChange={(e) => setTimesheetData({...timesheetData, checkInTime: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600" />
                </div>
                <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Giờ ra (Check-out)</label>
                    <input type="text" placeholder="VD: 17:00" pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$" title="Nhập theo định dạng 24h (VD: 08:00 hoặc 17:00)" required value={timesheetData.checkOutTime} onChange={(e) => setTimesheetData({...timesheetData, checkOutTime: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600" />
                </div>
              </div>
              
              <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Thời gian nghỉ giữa ca (Giờ)</label>
                  <input type="number" step="0.5" min="0" value={timesheetData.breakHours} onChange={(e) => setTimesheetData({...timesheetData, breakHours: Number(e.target.value)})} className="w-full p-2.5 border rounded-lg outline-none focus:border-blue-600" placeholder="VD: 1.5 hoặc 2" />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsTimesheetModalOpen(false)} className="px-5 py-2 border rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition">Hủy bỏ</button>
                <button type="submit" disabled={isSubmittingTimesheet} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
                    {isSubmittingTimesheet ? "Đang lưu..." : "Lưu chấm công"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}