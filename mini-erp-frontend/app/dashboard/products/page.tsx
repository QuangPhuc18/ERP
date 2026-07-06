"use client";

import React, { useEffect, useState, useCallback } from "react";
import ProductService, { ProductDTO } from "../../services/ProductService";
import CategoryService, { CategoryDTO } from "../../services/CategoryService";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("user");
  const [mounted, setMounted] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalError, setModalError] = useState("");
  
  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    price: 0,
    costPrice: 0,
    quantity: 0,
    categoryId: 0,
    imageUrl: "", // 🎯 Bổ sung trường dữ liệu ảnh
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [productData, categoryData] = await Promise.all([
        ProductService.getAll(),
        CategoryService.getAll()
      ]);
      setProducts(productData);
      setCategories(categoryData);
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

  const isAdmin = mounted && userRole === "admin";
  const formatCurrency = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

// 🎯 HÀM ĐỌC, TỰ ĐỘNG THU NHỎ VÀ MÃ HÓA ẢNH (CHỐNG TREO API)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 1. Tạo một khung Canvas ảo để vẽ lại ảnh thu nhỏ
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 300; // Cố định chiều rộng tối đa 300px (Đủ nét cho Web)
        
        // Tính toán tỷ lệ để không bị méo ảnh
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        // 2. Vẽ ảnh vào khung thu nhỏ
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 3. Xuất ra chuỗi Base64 định dạng JPEG, chất lượng 70% (Cực nhẹ)
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        
        // Lưu chuỗi siêu nhẹ này vào form
        setFormData((prev) => ({ ...prev, imageUrl: compressedBase64 }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ 
      productCode: "", 
      productName: "", 
      price: 0, 
      costPrice: 0, 
      quantity: 0, 
      // 🎯 SỬA LỖI DANH MỤC TRỐNG: Tự chọn ID đầu tiên thay vì số 0
      categoryId: categories.length > 0 ? categories[0].id : 0,
      imageUrl: "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: ProductDTO) => {
    setEditingId(product.id);
    
    const matchedCategory = categories.find(c => c.name === product.categoryName);
    const safeCategoryId = product.categoryId || (matchedCategory ? matchedCategory.id : (categories.length > 0 ? categories[0].id : 0));

    setFormData({
      productCode: product.productCode || "",
      productName: product.productName || "",
      price: product.price || 0,
      costPrice: product.costPrice || 0,
      quantity: product.quantity || 0,
      categoryId: safeCategoryId,
      imageUrl: product.imageUrl || "", // Nhận ảnh từ DB đổ lên form sửa
    });
    setModalError("");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.productCode || !formData.productName || formData.categoryId === 0) {
      setModalError("Vui lòng điền đủ Mã SP, Tên SP và chọn Danh mục!");
      return;
    }

    try {
      if (editingId) {
        await ProductService.update(editingId, formData);
      } else {
        await ProductService.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) { 
      const err = error as { response?: { data?: string } }; 
      setModalError(err.response?.data || "Có lỗi xảy ra khi lưu dữ liệu.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await ProductService.delete(id);
        loadData();
      } catch (error) { 
        const err = error as { response?: { data?: string } }; 
        alert(err.response?.data || "Không thể xóa!");
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    if (window.confirm("Bạn muốn đổi trạng thái Kinh Doanh của sản phẩm này?")) {
      try {
        const res = await ProductService.toggleStatus(id);
        alert(res.message);
        loadData();
      } catch (error) {
        alert("Lỗi khi thay đổi trạng thái!");
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up -m-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">inventory_2</span>
            Quản lý Sản phẩm
          </h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách hàng hóa, hình ảnh và tình trạng tồn kho</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md shadow-orange-100">
            <span className="material-symbols-outlined text-sm">add</span> Thêm sản phẩm
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="px-5 py-3.5 font-bold">Hình ảnh</th>
              <th className="px-5 py-3.5 font-bold">Mã SP</th>
              <th className="px-5 py-3.5 font-bold">Tên Sản phẩm</th>
              <th className="px-5 py-3.5 font-bold">Danh mục</th>
              <th className="px-5 py-3.5 font-bold text-right">Giá bán</th>
              <th className="px-5 py-3.5 font-bold text-center">Tồn kho</th>
              {isAdmin && <th className="px-5 py-3.5 font-bold text-center">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {isLoading ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-gray-400">Đang tải sản phẩm...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-gray-400">Chưa có sản phẩm nào trên hệ thống.</td></tr>
            ) : products.map((product) => (
              <tr key={product.id} className={`transition-colors ${product.isActive !== false ? "hover:bg-gray-50/50" : "bg-red-50/30 opacity-70"}`}>
                {/* Cột hiển thị hình ảnh sản phẩm trong danh sách */}
                <td className="px-5 py-3">
                  <div className={`w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm ${product.isActive !== false ? 'bg-white' : 'bg-red-100 grayscale'}`}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-gray-300 text-xl">image</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3 font-medium text-gray-600 flex flex-col gap-1 items-start justify-center min-h-[72px]">
                  <span>{product.productCode}</span>
                  {product.isActive === false && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200">NGỪNG BÁN</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-800 font-bold">{product.productName}</td>
                <td className="px-5 py-3 text-gray-500">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">{product.categoryName || "Chưa rõ"}</span>
                </td>
                <td className="px-5 py-3 text-right font-black text-orange-500">{formatCurrency(product.price)}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${product.quantity > 10 ? "bg-emerald-50 text-emerald-600" : product.quantity > 0 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
                    {product.quantity > 0 ? `${product.quantity} cái` : "Hết hàng"}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-5 py-3 text-center space-x-1">
                    <button onClick={() => handleOpenEdit(product)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                    <button onClick={() => handleToggleStatus(product.id)} className={`${product.isActive !== false ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'} p-1.5 rounded-lg transition-colors`} title={product.isActive !== false ? 'Ngừng kinh doanh' : 'Mở khóa lại'}>
                      <span className="material-symbols-outlined text-lg">{product.isActive !== false ? 'lock' : 'lock_open'}</span>
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"><span className="material-symbols-outlined text-lg">delete</span></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MODAL FORM THÊM / SỬA ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-[650px] overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-800">{editingId ? "Cập nhật Sản phẩm" : "Thêm Sản phẩm Mới"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1 grid grid-cols-2 gap-x-5 gap-y-4">
              {modalError && <p className="col-span-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">{modalError}</p>}
              
              {/* Cột trái: Form nhập văn bản */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mã SP <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 transition-all" value={formData.productCode} onChange={(e) => setFormData({...formData, productCode: e.target.value})} disabled={!!editingId} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 transition-all" value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Danh mục <span className="text-red-500">*</span></label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 transition-all bg-white" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: Number(e.target.value)})}>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giá nhập (Giá vốn)</label>
                  <input type="number" min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 transition-all" value={formData.costPrice || ""} onChange={(e) => setFormData({...formData, costPrice: e.target.value === '' ? 0 : Number(e.target.value)})} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giá bán công bố</label>
                  <input type="number" min="0" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500 transition-all" value={formData.price || ""} onChange={(e) => setFormData({...formData, price: e.target.value === '' ? 0 : Number(e.target.value)})} />
                </div>

                {/* Đã gỡ ô nhập Tồn Kho để đảm bảo đúng quy trình ERP (Kho phải nhập qua PO) */}
              </div>

              {/* 🎯 Cột phải: Chọn File ảnh và Xem trước */}
              <div className="flex flex-col h-full">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tải ảnh từ máy tính</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 cursor-pointer mb-3 outline-none" 
                />

                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Xem trước hình ảnh</label>
                <div className="flex-1 min-h-[220px] border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden p-2 relative group">
                  {formData.imageUrl ? (
                    <>
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
              <button onClick={handleSave} className="px-5 py-2 text-sm font-bold bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors shadow-md shadow-orange-100 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">save</span> Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}