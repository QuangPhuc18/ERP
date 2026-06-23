"use client";

import { useEffect, useState, useCallback } from "react";
import CategoryService, { CategoryDTO } from "../../services/CategoryService";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("user");
  const [mounted, setMounted] = useState(false);

  // --- STATE CHO MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [modalError, setModalError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await CategoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializePage = async () => {
      const role = localStorage.getItem("user_role") || "user";
      setUserRole(role.trim().toLowerCase());
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      
      await fetchData();
    };
    
    initializePage();
  }, [fetchData]);

  const isAdmin = mounted && userRole === "admin";

  // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
  const handleOpenAddModal = () => {
    setEditingId(null);
    setCategoryName("");
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: CategoryDTO) => {
    setEditingId(category.id);
    setCategoryName(category.name);
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      setModalError("Tên danh mục không được để trống!");
      return;
    }

    try {
      if (editingId) {
        await CategoryService.update(editingId, { name: categoryName });
      } else {
        await CategoryService.create({ name: categoryName });
      }
      setIsModalOpen(false);
      fetchData(); 
    } catch (error) {
      const err = error as { response?: { data?: string } }; 
      setModalError(err.response?.data || "Có lỗi xảy ra khi lưu dữ liệu.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này? Cảnh báo: Sẽ không thể xóa nếu danh mục đang chứa sản phẩm!")) {
      try {
        await CategoryService.delete(id);
        fetchData();
      } catch (error) {
        const err = error as { response?: { data?: string } }; 
        alert(err.response?.data || "Không thể xóa danh mục này!");
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh mục</h1>
          <p className="text-sm text-gray-500 mt-1">Phân loại sản phẩm trong kho</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAddModal} className="flex items-center gap-2 bg-[#10B981] hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <span className="material-symbols-outlined text-sm">add</span> Thêm danh mục
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="px-6 py-4 font-semibold w-24">ID</th>
              <th className="px-6 py-4 font-semibold">Tên Danh mục</th>
              {isAdmin && <th className="px-6 py-4 font-semibold text-center w-32">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr><td colSpan={isAdmin ? 3 : 2} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-500">#{cat.id}</td>
                <td className="px-6 py-4 font-semibold text-gray-900">{cat.name}</td>
                {isAdmin && (
                  <td className="px-6 py-4 text-center space-x-3">
                    <button onClick={() => handleOpenEditModal(cat)} className="text-blue-500 hover:text-blue-700"><span className="material-symbols-outlined">edit</span></button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700"><span className="material-symbols-outlined">delete</span></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🎯 MODAL VỚI HIỆU ỨNG BACKDROP-BLUR (LÀM MỜ) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800">{editingId ? "Sửa Danh mục" : "Thêm Danh mục Mới"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-6">
              {modalError && <p className="text-red-500 text-sm mb-3 bg-red-50 p-3 rounded-lg border border-red-100">{modalError}</p>}
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên danh mục <span className="text-red-500">*</span></label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-all outline-none" placeholder="Nhập tên danh mục..." value={categoryName} onChange={(e) => setCategoryName(e.target.value)} autoFocus />
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Hủy</button>
              <button onClick={handleSave} className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm">Lưu dữ liệu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}