"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "react";
import ProjectService, { ProjectDTO } from "../../services/ProjectService";
import EmployeeService, { EmployeeDTO } from "../../services/EmployeeService";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form Dữ liệu
  const [newProject, setNewProject] = useState<ProjectDTO>({ name: "", description: "" });
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(0);

  // Tải dữ liệu Dự án và Nhân viên
  const fetchData = useCallback(async () => {
    try {
      const [projectData, employeeData] = await Promise.all([
        ProjectService.getAll(),
        EmployeeService.getAll()
      ]);
      setProjects(projectData);
      setEmployees(employeeData);
    } catch (err) {
      setError("Không thể tải dữ liệu Dự án từ Server C#.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // 1. API: Tạo dự án mới
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await ProjectService.create(newProject);
      setIsAddModalOpen(false);
      setIsLoading(true);
      await fetchData();
      setNewProject({ name: "", description: "" });
    } catch (err) {
      alert("Có lỗi xảy ra khi tạo dự án!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mở modal phân công
  const openAssignModal = (projectId: number) => {
    setSelectedProjectId(projectId);
    setIsAssignModalOpen(true);
  };

  // 2. API: Phân công nhân viên vào dự án
  const handleAssignEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || selectedEmployeeId === 0) {
      alert("Vui lòng chọn đầy đủ thông tin!");
      return;
    }

    setIsSubmitting(true);
    try {
      await ProjectService.assignEmployee(selectedProjectId, selectedEmployeeId);
      setIsAssignModalOpen(false);
      alert("🎉 Phân công nhân sự vào dự án thành công!");
      setSelectedEmployeeId(0);
    } catch (err) {
      alert("Có lỗi xảy ra hoặc nhân viên đã tham gia dự án này rồi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-page-title text-[20px] font-semibold text-primary">Quản lý Dự án</h2>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition shadow-sm h-10"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">add_task</span>
          Tạo Dự án mới
        </button>
      </div>

      {error && <div className="mb-4 bg-red-100 text-red-700 p-4 rounded shadow-sm">{error}</div>}

      {/* Bảng danh sách Dự án */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-[#f2f3ff] text-[11px] font-bold text-on-surface-variant uppercase">
              <th className="p-4 w-20">Mã DA</th>
              <th className="p-4 min-w-[200px]">Tên Dự án</th>
              <th className="p-4">Mô tả dự án</th>
              <th className="p-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-primary">
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center animate-pulse">Đang tải danh sách dự án...</td></tr>
            ) : projects.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">Chưa có dự án nào trong hệ thống.</td></tr>
            ) : (
              projects.map((proj) => (
                <tr key={proj.id} className="border-b border-outline-variant hover:bg-[#f2f3ff] transition-colors">
                  <td className="p-4 font-mono text-on-surface-variant font-bold">DA-{proj.id?.toString().padStart(3, '0')}</td>
                  <td className="p-4 font-bold text-[#0f1c2e]">{proj.name}</td>
                  <td className="p-4 text-on-surface-variant">{proj.description}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openAssignModal(proj.id!)}
                      className="px-3 py-1 bg-[#eaedff] text-[#0f1c2e] border border-outline-variant rounded-md font-semibold hover:bg-[#d6e3fc] transition text-xs flex items-center inline-flex gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">group_add</span>
                      Phân công nhân sự
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL: TẠO DỰ ÁN ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#0f1c2e] px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Tạo Dự án mới</h3>
              <button onClick={() => setIsAddModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên dự án</label>
                <input type="text" required value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" placeholder="VD: Xây dựng hệ thống ERP" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả dự án</label>
                <textarea required value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" rows={3} placeholder="VD: Dự án phát triển phần mềm quản lý nội bộ..."></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-lg">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg font-medium disabled:opacity-50">
                  {isSubmitting ? "Đang tạo..." : "Xác nhận Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PHÂN CÔNG NHÂN SỰ ================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#10B981] px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Phân công vào Dự án</h3>
              <button onClick={() => setIsAssignModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAssignEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Chọn Nhân viên tham gia</label>
                <select 
                  required 
                  value={selectedEmployeeId} 
                  onChange={(e) => setSelectedEmployeeId(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none cursor-pointer text-sm"
                >
                  <option value={0} disabled>-- Vui lòng chọn nhân viên --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName} (ID: {emp.id})</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận Phân công"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}