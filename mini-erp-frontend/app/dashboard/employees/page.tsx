"use client";

import { useState, useEffect, useCallback, startTransition, useRef } from "react";
import axios from "axios";
import EmployeeService, { EmployeeDTO } from "../../services/EmployeeService";
import DepartmentService from "../../services/DepartmentService"; 
import * as XLSX from 'xlsx';

interface DepartmentDTO {
  id: number;
  name: string; 
}

interface ExcelRow {
  "Họ và Tên"?: string;
  "Email"?: string;
  "ID Phòng ban"?: string | number;
  "Lương"?: string | number;
}

interface ExtendedEmployeeDTO extends EmployeeDTO {
  departmentName?: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<ExtendedEmployeeDTO[]>([]);
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [userRole, setUserRole] = useState<string>("user");
  const [mounted, setMounted] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [newEmployee, setNewEmployee] = useState<ExtendedEmployeeDTO>({
    fullName: "", email: "", departmentId: 0, dailySalary: 300000, employeeType: "FullTime", hourlyRate: 0
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<ExtendedEmployeeDTO | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<ExtendedEmployeeDTO | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [empData, deptData] = await Promise.all([
        EmployeeService.getAll(),
        DepartmentService.getAll().catch(() => []) 
      ]);
      
      startTransition(() => {
        setEmployees(empData);
        setDepartments(deptData);
        setIsLoading(false);
      });
    } catch (err) {
      startTransition(() => {
        setError("Không thể kết nối tới Server để tải dữ liệu.");
        setIsLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("user_role") || "user";
    setUserRole(role.trim().toLowerCase());
    setMounted(true);
    fetchInitialData();
  }, [fetchInitialData]);

  const isAdmin = mounted && userRole === "admin";

  const reloadEmployees = async () => {
    try {
      const data = await EmployeeService.getAll();
      startTransition(() => setEmployees(data));
    } catch (err) {
      console.error("Lỗi khi tải lại danh sách nhân viên");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        
        // 🎯 Ép kiểu dữ liệu đọc từ Excel thành mảng ExcelRow
        const data = XLSX.utils.sheet_to_json(ws) as ExcelRow[];
        
        if (data.length === 0) {
          alert("File Excel trống!");
          setIsImporting(false);
          return;
        }

        // 🎯 TypeScript tự hiểu row là ExcelRow
        const formattedData = data.map((row) => ({
          fullName: row["Họ và Tên"] || "Chưa có tên",
          email: row["Email"] || "",
          departmentId: Number(row["ID Phòng ban"]) || 0,
          dailySalary: Number(row["Lương"]) || 0
        }));

        await EmployeeService.createBulk(formattedData);
        alert(`Đã import thành công ${formattedData.length} nhân viên!`);
        
        await reloadEmployees(); 
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error: unknown) {
      console.error("Lỗi import Excel:", error);
      // 🎯 Bắt đúng câu báo lỗi từ Backend C# gửi lên
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data); 
      } else {
        alert("Đã xảy ra lỗi hệ thống khi import file Excel!");
      }
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.departmentId || newEmployee.departmentId === 0) {
      alert("Vui lòng chọn phòng ban!");
      return;
    }
    
    setIsSubmittingAdd(true);
    try {
      await EmployeeService.create(newEmployee);
      setIsAddModalOpen(false);
      await reloadEmployees();
      setNewEmployee({ fullName: "", email: "", departmentId: departments[0]?.id || 0, dailySalary: 300000 });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const openEditModal = (emp: ExtendedEmployeeDTO) => {
    setEditingEmployee({ 
      ...emp, 
      departmentId: emp.departmentId || 0,
      dailySalary: emp.dailySalary || 0,
      employeeType: emp.employeeType || "FullTime",
      hourlyRate: emp.hourlyRate || 0
    });
    setIsEditModalOpen(true);
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee?.id) return;
    if (!editingEmployee.departmentId || editingEmployee.departmentId === 0) {
      alert("Vui lòng chọn phòng ban!");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await EmployeeService.update(editingEmployee.id, editingEmployee);
      setIsEditModalOpen(false);
      await reloadEmployees();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const openDeleteModal = (emp: ExtendedEmployeeDTO) => {
    setDeletingEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingEmployee?.id) return;
    setIsSubmittingDelete(true);
    try {
      await EmployeeService.delete(deletingEmployee.id);
      setIsDeleteModalOpen(false);
      await reloadEmployees();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const handleApiError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 403) alert("Bạn không có quyền thực hiện thao tác này!");
      else alert(err.response?.data || "Có lỗi xảy ra từ máy chủ C#!");
    } else {
      alert("Có lỗi không xác định xảy ra!");
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <h2 className="font-page-title text-[20px] font-semibold text-primary">Quản lý Nhân sự</h2>
        
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <input 
                type="file" 
                accept=".xlsx, .xls" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition shadow-sm h-10 disabled:opacity-50"
              >
                <span className="material-symbols-outlined mr-2 text-[18px]">
                  {isImporting ? "hourglass_empty" : "upload_file"}
                </span>
                {isImporting ? "Đang xử lý..." : "Import Excel"}
              </button>

              <button
                onClick={() => {
                  setNewEmployee({ ...newEmployee, departmentId: departments.length > 0 ? departments[0].id : 0 });
                  setIsAddModalOpen(true);
                }}
                className="flex items-center px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition shadow-sm h-10"
              >
                <span className="material-symbols-outlined mr-2 text-[18px]">person_add</span>
                Thêm Nhân viên
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="mb-4 bg-red-100 text-red-700 p-4 rounded shadow-sm">{error}</div>}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-x-auto animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-[#f2f3ff] text-[11px] font-bold text-on-surface-variant uppercase">
              <th className="p-4 w-20">Mã NV</th>
              <th className="p-4 min-w-[200px]">Họ và Tên</th>
              <th className="p-4">Email</th>
              <th className="p-4">Phòng ban</th>
              <th className="p-4">Loại NV</th>
              <th className="p-4">Mức Lương</th>
              {isAdmin && <th className="p-4 text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="text-[13px] text-primary">
            {isLoading ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="p-8 text-center animate-pulse">Đang tải dữ liệu...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="p-8 text-center text-on-surface-variant">Chưa có nhân viên nào.</td></tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="border-b border-outline-variant hover:bg-[#f2f3ff] transition-colors">
                  <td className="p-4 font-mono text-on-surface-variant">NV-{emp.id?.toString().padStart(3, '0')}</td>
                  <td className="p-4 font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#d6e3fc] flex items-center justify-center text-[#0f1c2e] font-bold text-xs uppercase">
                      {emp.fullName.charAt(0)}
                    </div>
                    {emp.fullName}
                  </td>
                  <td className="p-4 text-on-surface-variant">{emp.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#eaedff] text-[11px] font-semibold border border-blue-100 text-blue-700">
                      {emp.departmentName || "Chưa phân phòng"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${emp.employeeType === 'PartTime' ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                      {emp.employeeType === 'PartTime' ? 'Part-time' : 'Full-time'}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-on-surface-variant">
                    {emp.employeeType === 'PartTime' 
                      ? `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(emp.hourlyRate || 0)} / giờ`
                      : `${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(emp.dailySalary || 0)} / ngày`}
                  </td>
                  
                  {isAdmin && (
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => openEditModal(emp)} className="p-1.5 text-on-surface-variant hover:bg-[#d6e3fc] hover:text-[#0f1c2e] rounded transition" title="Chỉnh sửa">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => openDeleteModal(emp)} className="p-1.5 text-on-surface-variant hover:bg-[#ffdad6] hover:text-[#ba1a1a] rounded transition" title="Xóa">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#0f1c2e] px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Thêm Nhân viên mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="hover:text-gray-300 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Họ và Tên <span className="text-red-500">*</span></label>
                <input type="text" required value={newEmployee.fullName} onChange={(e) => setNewEmployee({...newEmployee, fullName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" required value={newEmployee.email} onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phòng ban <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    value={newEmployee.departmentId} 
                    onChange={(e) => setNewEmployee({...newEmployee, departmentId: Number(e.target.value)})} 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:outline-none bg-white"
                  >
                    <option value={0} disabled>-- Chọn phòng ban --</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Loại NV <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    value={newEmployee.employeeType || "FullTime"} 
                    onChange={(e) => setNewEmployee({...newEmployee, employeeType: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:outline-none bg-white"
                  >
                    <option value="FullTime">Full-time (Theo ngày)</option>
                    <option value="PartTime">Part-time (Theo giờ)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mức lương (VNĐ) <span className="text-red-500">*</span></label>
                  {newEmployee.employeeType === 'PartTime' ? (
                    <input type="number" required min="0" value={newEmployee.hourlyRate || 0} onChange={(e) => setNewEmployee({...newEmployee, hourlyRate: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:outline-none" placeholder="Lương / giờ" />
                  ) : (
                    <input type="number" required min="0" value={newEmployee.dailySalary || 0} onChange={(e) => setNewEmployee({...newEmployee, dailySalary: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:outline-none" placeholder="Lương / ngày" />
                  )}
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">Hủy</button>
                <button type="submit" disabled={isSubmittingAdd} className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 transition-colors">
                  {isSubmittingAdd ? "Đang lưu..." : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#10B981] px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Cập nhật Nhân viên</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="hover:text-gray-100 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleEditEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Họ và Tên <span className="text-red-500">*</span></label>
                <input type="text" required value={editingEmployee.fullName} onChange={(e) => setEditingEmployee({...editingEmployee, fullName: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" required value={editingEmployee.email} onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phòng ban <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    value={editingEmployee.departmentId} 
                    onChange={(e) => setEditingEmployee({...editingEmployee, departmentId: Number(e.target.value)})} 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-none bg-white"
                  >
                    <option value={0} disabled>-- Chọn phòng ban --</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Loại NV <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    value={editingEmployee.employeeType || "FullTime"} 
                    onChange={(e) => setEditingEmployee({...editingEmployee, employeeType: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-none bg-white"
                  >
                    <option value="FullTime">Full-time (Theo ngày)</option>
                    <option value="PartTime">Part-time (Theo giờ)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Mức lương (VNĐ) <span className="text-red-500">*</span></label>
                  {editingEmployee.employeeType === 'PartTime' ? (
                    <input type="number" required min="0" value={editingEmployee.hourlyRate || 0} onChange={(e) => setEditingEmployee({...editingEmployee, hourlyRate: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-none" placeholder="Lương / giờ" />
                  ) : (
                    <input type="number" required min="0" value={editingEmployee.dailySalary || 0} onChange={(e) => setEditingEmployee({...editingEmployee, dailySalary: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-none" placeholder="Lương / ngày" />
                  )}
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">Hủy</button>
                <button type="submit" disabled={isSubmittingEdit} className="px-4 py-2 bg-[#10B981] text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                  {isSubmittingEdit ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && deletingEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa nhân viên?</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Bạn có chắc chắn muốn xóa nhân viên <strong className="text-gray-800">{deletingEmployee.fullName}</strong> không? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">Hủy bỏ</button>
              <button onClick={confirmDelete} disabled={isSubmittingDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                {isSubmittingDelete ? "Đang xóa..." : "Xác nhận Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}