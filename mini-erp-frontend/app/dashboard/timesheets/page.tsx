"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PayrollService from "../../services/PayrollService";
import EmployeeService, { EmployeeDTO } from "../../services/EmployeeService";

interface TimesheetSummary {
  employeeId: number;
  employeeName: string;
  scheduledHours: number;
  posHours: number;
  manualHours: number;
  totalHours: number;
}

interface TimesheetLog {
  date: string;
  source: string;
  hours: number;
  details: string;
}

interface TimesheetFormData {
  employeeId: number;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  breakHours: number;
}

export default function TimesheetsPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [summaryList, setSummaryList] = useState<TimesheetSummary[]>([]);
  
  const [filterMonth, setFilterMonth] = useState<number>(currentMonth);
  const [filterYear, setFilterYear] = useState<number>(currentYear);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");
  const [timesheetLogs, setTimesheetLogs] = useState<TimesheetLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

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

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await PayrollService.getTimesheetsSummary(filterMonth, filterYear);
      
      const normalizedData: TimesheetSummary[] = data.map((item: any) => ({
        employeeId: item.employeeId ?? item.EmployeeId,
        employeeName: item.employeeName ?? item.EmployeeName,
        scheduledHours: item.scheduledHours ?? item.ScheduledHours ?? 0,
        posHours: item.posHours ?? item.PosHours ?? 0,
        manualHours: item.manualHours ?? item.ManualHours ?? 0,
        totalHours: item.totalHours ?? item.TotalHours ?? 0,
      }));

      startTransition(() => {
        setSummaryList(normalizedData);
      });
    } catch (err) {
      console.error("Lỗi fetch bảng công:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filterMonth, filterYear]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

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
      fetchSummary();
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

  const handleViewDetails = async (employeeId: number, employeeName: string) => {
    setSelectedEmployeeName(employeeName);
    setIsDetailModalOpen(true);
    setIsLoadingLogs(true);
    try {
      const logs = await PayrollService.getTimesheetLogs(employeeId, filterMonth, filterYear);
      const normalizedLogs: TimesheetLog[] = logs.map((log: any) => ({
        date: log.date ?? log.Date,
        source: log.source ?? log.Source,
        hours: log.hours ?? log.Hours,
        details: log.details ?? log.Details
      }));
      setTimesheetLogs(normalizedLogs);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết chấm công:", err);
      alert("Không thể tải chi tiết lịch sử.");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  return (
    <>
      {/* TABS NAVIGATION */}
      <div className="flex border-b border-gray-200 mb-6 mt-2">
        <Link 
          href="/dashboard/timesheets" 
          className="px-6 py-3 font-semibold text-sm border-b-2 transition-colors border-orange-500 text-orange-600"
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
          className="px-6 py-3 font-semibold text-sm border-b-2 transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">request_quote</span>
            Tạm Ứng
          </div>
        </Link>
      </div>

      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Bảng Công</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsTimesheetModalOpen(true)} 
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">schedule</span>
            Chấm công tay (Bù giờ)
          </button>
        </div>
      </div>

      {/* BỘ LỌC */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Kỳ công (Tháng)</label>
          <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} className="w-32 p-2 border rounded-lg outline-none focus:border-blue-500">
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={i+1}>Tháng {i+1}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Năm</label>
          <input type="number" value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className="w-32 p-2 border rounded-lg outline-none focus:border-blue-500" />
        </div>
      </div>

      {/* BẢNG HIỂN THỊ CÔNG */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : summaryList.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">pending_actions</span>
            <p>Chưa có dữ liệu bảng công tháng {filterMonth}/{filterYear}</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold">Mã ID</th>
                <th className="p-4 font-semibold">Họ và Tên</th>
                <th className="p-4 font-semibold text-center">Số giờ theo lịch</th>
                <th className="p-4 font-semibold text-center">Giờ tính lương (POS)</th>
                <th className="p-4 font-semibold text-center">Giờ cộng thêm</th>
                <th className="p-4 font-semibold text-center">Tổng giờ thực tế</th>
                <th className="p-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {summaryList.map((record, index) => {
                const isUnderperforming = record.posHours < record.scheduledHours;
                return (
                <tr key={record.employeeId || index} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="p-4 text-sm font-medium text-gray-500">#{record.employeeId}</td>
                  <td className="p-4 font-bold text-gray-800">{record.employeeName}</td>
                  <td className="p-4 text-center font-medium text-gray-600">
                    {record.scheduledHours > 0 ? `${record.scheduledHours}h` : '-'}
                  </td>
                  <td className={`p-4 text-center font-bold ${isUnderperforming ? 'text-red-500' : 'text-emerald-600'}`}>
                    {record.posHours > 0 ? `${record.posHours}h` : '-'}
                    {isUnderperforming && <div className="text-[10px] text-red-500 font-normal">(-{record.scheduledHours - record.posHours}h)</div>}
                  </td>
                  <td className="p-4 text-center font-medium text-orange-500">
                    {record.manualHours > 0 ? `${record.manualHours}h` : '-'}
                  </td>
                  <td className="p-4 text-center text-blue-600 font-bold text-lg">
                    {record.totalHours}h
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleViewDetails(record.employeeId, record.employeeName)}
                      className="text-gray-400 hover:text-blue-600 transition p-2 bg-gray-50 hover:bg-blue-50 rounded-lg inline-flex items-center"
                      title="Xem lịch sử chi tiết"
                    >
                      <span className="material-symbols-outlined text-[20px]">visibility</span>
                    </button>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL CHẤM CÔNG */}
      {isTimesheetModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Chấm công hàng ngày (Bù giờ)</h3>
            <p className="text-xs text-gray-500 mb-4">Sử dụng tính năng này nếu nhân viên quên Mở/Đóng ca trên phần mềm POS.</p>
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
                    {isSubmittingTimesheet ? "Đang lưu..." : "Ghi nhận công"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT LỊCH SỬ (DRILL-DOWN) */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">
                Lịch sử chấm công: <span className="text-blue-600">{selectedEmployeeName}</span>
              </h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-red-500">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto">
              {isLoadingLogs ? (
                <div className="p-8 text-center text-gray-500">Đang tải lịch sử...</div>
              ) : timesheetLogs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 italic">Không có dữ liệu làm việc trong tháng này.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs uppercase tracking-wider">
                      <th className="p-3 font-semibold">Ngày</th>
                      <th className="p-3 font-semibold">Nguồn</th>
                      <th className="p-3 font-semibold text-center">Số Giờ</th>
                      <th className="p-3 font-semibold">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timesheetLogs.map((log, index) => (
                      <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="p-3 text-sm font-medium text-gray-800">
                          {new Date(log.date).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-3 text-sm">
                          {log.source === "Tự động từ POS" ? (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold">{log.source}</span>
                          ) : (
                            <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-xs font-semibold">{log.source}</span>
                          )}
                        </td>
                        <td className="p-3 text-center font-bold text-blue-600">
                          {log.hours}h
                        </td>
                        <td className="p-3 text-sm text-gray-500 italic">
                          {log.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
