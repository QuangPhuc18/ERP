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
  const [formData, setFormData] = useState({ name: "", description: "", imageUrl: "" });
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
    setFormData({ name: "", description: "", imageUrl: "" });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: CategoryDTO) => {
    setEditingId(category.id);
    setFormData({ 
      name: category.name, 
      description: category.description || "", 
      imageUrl: category.imageUrl || "" 
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setFormData((prev) => ({ ...prev, imageUrl: compressedBase64 }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setModalError("Tên danh mục không được để trống!");
      return;
    }

    try {
      if (editingId) {
        await CategoryService.update(editingId, formData);
      } else {
        await CategoryService.create(formData);
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
              <th className="px-6 py-4 font-semibold w-32">Hình ảnh</th>
              <th className="px-6 py-4 font-semibold">Tên Danh mục</th>
              {isAdmin && <th className="px-6 py-4 font-semibold text-center w-32">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              <tr><td colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-gray-400">Đang tải...</td></tr>
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-500">#{cat.id}</td>
                <td className="px-6 py-4">
                  <div className="w-16 h-12 rounded bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-gray-300">image</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">{cat.name}</p>
                  {cat.description && <p className="text-xs text-gray-500 truncate max-w-[250px]">{cat.description}</p>}
                </td>
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tên danh mục <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-all outline-none" placeholder="Nhập tên danh mục..." value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả ngắn</label>
                  <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] transition-all outline-none resize-none h-20" placeholder="Mô tả..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh đại diện</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100 cursor-pointer mb-3 outline-none" />
                  {formData.imageUrl && (
                    <div className="relative w-full h-32 rounded-lg border border-gray-200 overflow-hidden group">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => setFormData({ ...formData, imageUrl: "" })} className="bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600 shadow-md">Xóa ảnh</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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