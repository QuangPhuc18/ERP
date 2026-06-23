"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import axios from "axios";
import DepartmentService, { DepartmentDTO } from "../../services/DepartmentService";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [newDepartment, setNewDepartment] = useState<DepartmentDTO>({ name: "", description: "" });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentDTO | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [deletingDepartment, setDeletingDepartment] = useState<DepartmentDTO | null>(null);

  // ✅ FIX: Dùng startTransition để wrap tất cả setState bên trong
  //    => React hiểu đây là update không khẩn cấp, không bị lỗi set-state-in-effect
  const fetchDepartments = useCallback(async () => {
    try {
      const data = await DepartmentService.getAll();
      startTransition(() => {
        setDepartments(data);
        setIsLoading(false);
      });
    } catch (err) {
      startTransition(() => {
        setError("Không thể kết nối tới Server để tải danh sách phòng ban.");
        setIsLoading(false);
      });
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAdd(true);
    try {
      await DepartmentService.create(newDepartment);
      setIsAddModalOpen(false);
      setIsLoading(true);
      await fetchDepartments();
      setNewDepartment({ name: "", description: "" });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const openEditModal = (dept: DepartmentDTO) => {
    setEditingDepartment({ ...dept });
    setIsEditModalOpen(true);
  };

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDepartment?.id) return;

    setIsSubmittingEdit(true);
    try {
      await DepartmentService.update(editingDepartment.id, editingDepartment);
      setIsEditModalOpen(false);
      setIsLoading(true);
      await fetchDepartments();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const openDeleteModal = (dept: DepartmentDTO) => {
    setDeletingDepartment(dept);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingDepartment?.id) return;

    setIsSubmittingDelete(true);
    try {
      await DepartmentService.delete(deletingDepartment.id);
      setIsDeleteModalOpen(false);
      setIsLoading(true);
      await fetchDepartments();
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  const handleApiError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 403) alert("Bạn không có quyền thực hiện thao tác này!");
      else if (err.response?.status === 400 || err.response?.status === 500) alert("Không thể xóa phòng ban đang có nhân viên!");
      else alert("Có lỗi xảy ra từ máy chủ C#!");
    } else {
      alert("Có lỗi không xác định xảy ra!");
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-page-title text-[20px] font-semibold text-primary">Quản lý Phòng ban</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-[#F59E0B] text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition shadow-sm h-10"
        >
          <span className="material-symbols-outlined mr-2 text-[18px]">add_business</span>
          Thêm Phòng ban
        </button>
      </div>

      {error && <div className="mb-4 bg-red-100 text-red-700 p-4 rounded shadow-sm">{error}</div>}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-[#f2f3ff] text-[11px] font-bold text-on-surface-variant uppercase">
              <th className="p-4 w-24">Mã Phòng</th>
              <th className="p-4 min-w-[200px]">Tên Phòng ban</th>
              <th className="p-4">Mô tả chi tiết</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-primary">
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center animate-pulse">Đang tải dữ liệu...</td></tr>
            ) : departments.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-on-surface-variant">Chưa có phòng ban nào.</td></tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id} className="border-b border-outline-variant hover:bg-[#f2f3ff] transition-colors">
                  <td className="p-4 font-mono text-on-surface-variant font-bold text-[#F59E0B]">{dept.id}</td>
                  <td className="p-4 font-bold text-[#0f1c2e]">{dept.name}</td>
                  <td className="p-4 text-on-surface-variant">{dept.description}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => openEditModal(dept)} className="p-1.5 text-on-surface-variant hover:bg-[#d6e3fc] hover:text-[#0f1c2e] rounded transition" title="Chỉnh sửa">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => openDeleteModal(dept)} className="p-1.5 text-on-surface-variant hover:bg-[#ffdad6] hover:text-[#ba1a1a] rounded transition" title="Xóa">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL: THÊM PHÒNG BAN ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#0f1c2e] px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Thêm Phòng ban</h3>
              <button onClick={() => setIsAddModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAddDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên phòng ban</label>
                <input type="text" required value={newDepartment.name} onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:outline-none" placeholder="VD: Phòng IT" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả</label>
                <textarea required value={newDepartment.description} onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F59E0B] focus:outline-none" rows={3} placeholder="VD: Chịu trách nhiệm phần mềm..."></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-medium">Hủy</button>
                <button type="submit" disabled={isSubmittingAdd} className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg font-medium disabled:opacity-50">
                  {isSubmittingAdd ? "Đang lưu..." : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SỬA PHÒNG BAN ================= */}
      {isEditModalOpen && editingDepartment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-[#10B981] px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Cập nhật Phòng ban</h3>
              <button onClick={() => setIsEditModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleEditDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên phòng ban</label>
                <input type="text" required value={editingDepartment.name} onChange={(e) => setEditingDepartment({...editingDepartment, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả</label>
                <textarea required value={editingDepartment.description} onChange={(e) => setEditingDepartment({...editingDepartment, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#10B981] focus:outline-none" rows={3}></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-medium">Hủy</button>
                <button type="submit" disabled={isSubmittingEdit} className="px-4 py-2 bg-[#10B981] text-white rounded-lg font-medium disabled:opacity-50">
                  {isSubmittingEdit ? "Đang lưu..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: XÁC NHẬN XÓA ================= */}
      {isDeleteModalOpen && deletingDepartment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa phòng ban?</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Bạn có chắc chắn muốn xóa <strong className="text-gray-800">{deletingDepartment.name}</strong> không?
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Hủy bỏ</button>
              <button onClick={confirmDelete} disabled={isSubmittingDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50">
                {isSubmittingDelete ? "Đang xóa..." : "Xác nhận Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}