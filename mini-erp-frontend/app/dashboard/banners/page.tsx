"use client";

import React, { useEffect, useState, useCallback } from "react";
import BannerService, { BannerDTO } from "../../services/BannerService";

export default function BannersPage() {
  const [banners, setBanners] = useState<BannerDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("user");
  const [mounted, setMounted] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalError, setModalError] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    imageUrl: "",
    isActive: true,
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await BannerService.getAll();
      setBanners(data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializePage = async () => {
      const role = localStorage.getItem("user_role") || "user";
      setUserRole(role.trim().toLowerCase());
      setMounted(true);
      await loadData();
    };
    initializePage();
  }, [loadData]); 

  const isAdmin = mounted && (userRole === "admin" || userRole === "manager");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1000; // Banner ảnh có thể to hơn
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

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ 
      title: "", 
      subtitle: "", 
      buttonText: "", 
      buttonLink: "", 
      imageUrl: "",
      isActive: true,
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: BannerDTO) => {
    setEditingId(banner.id);
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      buttonText: banner.buttonText || "",
      buttonLink: banner.buttonLink || "",
      imageUrl: banner.imageUrl || "",
      isActive: banner.isActive,
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      setModalError("Vui lòng nhập Tiêu đề (Title)!");
      return;
    }

    try {
      if (editingId) {
        await BannerService.update(editingId, formData);
      } else {
        await BannerService.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) { 
      const err = error as { response?: { data?: string } }; 
      setModalError(err.response?.data || "Có lỗi xảy ra khi lưu dữ liệu.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa Banner này?")) {
      try {
        await BannerService.delete(id);
        loadData();
      } catch (error) { 
        const err = error as { response?: { data?: string } }; 
        alert(err.response?.data || "Không thể xóa!");
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await BannerService.toggleStatus(id);
      alert(res.message);
      loadData();
    } catch (error) {
      alert("Lỗi khi thay đổi trạng thái!");
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up -m-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-500">view_carousel</span>
            Quản lý Banner (Hero Section)
          </h1>
          <p className="text-sm text-gray-500 mt-1">Thay đổi ảnh bìa, slogan và nút gọi hành động trang chủ</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md shadow-purple-100">
            <span className="material-symbols-outlined text-sm">add</span> Thêm Banner
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="px-5 py-3.5 font-bold">Hình ảnh</th>
              <th className="px-5 py-3.5 font-bold">Tiêu đề (Title)</th>
              <th className="px-5 py-3.5 font-bold">Trạng thái</th>
              {isAdmin && <th className="px-5 py-3.5 font-bold text-center">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {isLoading ? (
              <tr><td colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-gray-400">Đang tải dữ liệu...</td></tr>
            ) : banners.length === 0 ? (
              <tr><td colSpan={isAdmin ? 4 : 3} className="text-center py-8 text-gray-400">Chưa có Banner nào trên hệ thống.</td></tr>
            ) : banners.map((banner) => (
              <tr key={banner.id} className={`transition-colors ${banner.isActive ? "hover:bg-gray-50/50" : "bg-gray-50/30 opacity-60"}`}>
                <td className="px-5 py-3 w-40">
                  <div className={`w-32 h-16 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm ${banner.isActive ? 'bg-white' : 'bg-gray-100'}`}>
                    {banner.imageUrl ? (
                      <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-gray-300 text-xl">image</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 font-medium text-gray-800 flex flex-col justify-center min-h-[72px]">
                  <span className="font-bold text-base">{banner.title}</span>
                  <span className="text-gray-500 text-xs">{banner.subtitle}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${banner.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"}`}>
                    {banner.isActive ? "Đang hiển thị" : "Đang ẩn"}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-5 py-3 text-center space-x-1">
                    <button onClick={() => handleToggleStatus(banner.id)} className={`${banner.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'} p-1.5 rounded-lg transition-colors`} title={banner.isActive ? 'Ẩn banner' : 'Bật hiển thị'}>
                      <span className="material-symbols-outlined text-lg">{banner.isActive ? 'visibility_off' : 'visibility'}</span>
                    </button>
                    <button onClick={() => handleOpenEdit(banner)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                    <button onClick={() => handleDelete(banner.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-[800px] overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-800">{editingId ? "Cập nhật Banner" : "Thêm Banner Mới"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
              {modalError && <p className="col-span-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">{modalError}</p>}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tiêu đề (Title) <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 transition-all" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Curated freshness, delivered daily." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đoạn mô tả phụ (Subtitle)</label>
                  <textarea className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 transition-all resize-none h-24" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} placeholder="Experience the season best produce..."></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chữ trên nút (Button)</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 transition-all" value={formData.buttonText} onChange={(e) => setFormData({...formData, buttonText: e.target.value})} placeholder="Shop the Season" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Đường dẫn nút (Link)</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-500 transition-all" value={formData.buttonLink} onChange={(e) => setFormData({...formData, buttonLink: e.target.value})} placeholder="#essentials" />
                    </div>
                </div>
                <label className="flex items-center gap-2 mt-4 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                  <span className="text-sm font-bold text-gray-700">Kích hoạt hiển thị Banner này</span>
                </label>
              </div>

              <div className="flex flex-col h-full">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Ảnh nền Banner</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100 cursor-pointer mb-3 outline-none" 
                />

                <div className="flex-1 min-h-[220px] border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden p-2 relative group">
                  {formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                        <button type="button" onClick={() => setFormData({ ...formData, imageUrl: "" })} className="bg-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-red-600 shadow-md">
                          <span className="material-symbols-outlined text-[14px]">delete</span> Xóa ảnh
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400 select-none">
                      <span className="material-symbols-outlined text-4xl mb-1">add_photo_alternate</span>
                      <p className="text-[11px] font-medium">Chưa chọn tệp ảnh nào</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100 shadow-sm">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Hủy</button>
              <button onClick={handleSave} className="px-5 py-2 text-sm font-bold bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors shadow-md shadow-purple-100 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">save</span> Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
