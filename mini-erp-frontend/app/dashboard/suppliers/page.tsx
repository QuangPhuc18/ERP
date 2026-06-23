"use client";

import React, { useEffect, useState, useCallback } from "react";
import SupplierService, { SupplierDTO } from "../../services/SupplierService";
import axios from "axios";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("user");
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<SupplierDTO>>({
    supplierCode: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await SupplierService.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu nhà cung cấp:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("user_role") || "user";
    setUserRole(role.trim().toLowerCase());
    setMounted(true);
    loadData();
  }, [loadData]);

  const isAdmin = mounted && userRole === "admin";

  // --- Lọc dữ liệu theo Search ---
  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.supplierCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.phone && s.phone.includes(searchQuery))
  );

  // --- MỞ MODAL THÊM ---
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ supplierCode: "", name: "", email: "", phone: "", address: "" });
    setModalError("");
    setIsModalOpen(true);
  };

  // --- MỞ MODAL SỬA ---
  const handleOpenEdit = (supplier: SupplierDTO) => {
    setEditingId(supplier.id);
    setFormData({
      supplierCode: supplier.supplierCode,
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });
    setModalError("");
    setIsModalOpen(true);
  };

  // --- LƯU DỮ LIỆU (THÊM / SỬA) ───
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierCode || !formData.name) {
      setModalError("Vui lòng điền đầy đủ Mã và Tên nhà cung cấp!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await SupplierService.update(editingId, formData);
      } else {
        await SupplierService.create(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: unknown) { // 🎯 FIX LỖI ANY: Ép kiểu ẩn danh chuẩn TypeScript
      if (axios.isAxiosError(error)) {
        setModalError(error.response?.data || "Có lỗi xảy ra khi gọi API đến Server.");
      } else {
        setModalError("Đã xảy ra lỗi hệ thống không xác định.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- XÓA DỮ LIỆU ───
  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này? Các phiếu nhập liên quan có thể bị ảnh hưởng!")) {
      try {
        await SupplierService.delete(id);
        loadData();
      } catch (error: unknown) { // 🎯 FIX LỖI ANY: Xử lý an toàn cho luồng Xóa dữ liệu
        if (axios.isAxiosError(error)) {
          alert(error.response?.data || "Không thể xóa nhà cung cấp này do ràng buộc dữ liệu!");
        } else {
          alert("Lỗi hệ thống không thể thực hiện thao tác xóa.");
        }
      }
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up min-h-[80vh] flex flex-col">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600">local_shipping</span>
            Nhà Cung Cấp
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý đối tác và nguồn hàng nhập kho</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input 
              type="text" 
              placeholder="Tìm tên, mã, SĐT..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-indigo-500 transition-all w-64"
            />
          </div>
          {isAdmin && (
            <button onClick={handleOpenAdd} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-indigo-100">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Thêm đối tác
            </button>
          )}
        </div>
      </div>

      {/* ── BẢNG DỮ LIỆU ── */}
      <div className="flex-1 overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
              <th className="px-5 py-4 font-bold">Mã NCC</th>
              <th className="px-5 py-4 font-bold">Tên đối tác</th>
              <th className="px-5 py-4 font-bold">Liên hệ</th>
              <th className="px-5 py-4 font-bold w-1/3">Địa chỉ</th>
              {isAdmin && <th className="px-5 py-4 font-bold text-center">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {isLoading ? (
              <tr><td colSpan={isAdmin ? 5 : 4} className="text-center py-10 text-gray-400">Đang tải dữ liệu nhà cung cấp...</td></tr>
            ) : filteredSuppliers.length === 0 ? (
              <tr><td colSpan={isAdmin ? 5 : 4} className="text-center py-10 text-gray-400">Chưa có dữ liệu nhà cung cấp nào trên hệ thống.</td></tr>
            ) : filteredSuppliers.map((s) => (
              <tr key={s.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-5 py-4 font-bold text-indigo-600">{s.supplierCode}</td>
                <td className="px-5 py-4 font-bold text-gray-800">{s.name}</td>
                <td className="px-5 py-4 text-gray-600">
                  {s.phone && <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">call</span> {s.phone}</div>}
                  {s.email && <div className="flex items-center gap-1.5 mt-1 text-gray-400"><span className="material-symbols-outlined text-[14px]">mail</span> {s.email}</div>}
                  {!s.phone && !s.email && <span className="text-gray-300 italic">Chưa cập nhật</span>}
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {s.address ? s.address : <span className="text-gray-300 italic">Chưa cập nhật</span>}
                </td>
                {isAdmin && (
                  <td className="px-5 py-4 text-center space-x-2">
                    <button onClick={() => handleOpenEdit(s)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MODAL THÊM / SỬA ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-[600px] flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-600">{editingId ? 'edit_square' : 'add_box'}</span>
                {editingId ? "Cập nhật Nhà cung cấp" : "Thêm Nhà cung cấp mới"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-5">
              {modalError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100 font-medium">{modalError}</p>}
              
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Mã NCC <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.supplierCode} onChange={e => setFormData({...formData, supplierCode: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none transition-all" placeholder="VD: NCC-SS01" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Số điện thoại</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none transition-all" placeholder="09xx..." />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tên Nhà cung cấp <span className="text-red-500">*</span></label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none transition-all" placeholder="Tên công ty / Đối tác..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email liên hệ</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none transition-all" placeholder="email@company.com" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Địa chỉ</label>
                <textarea rows={3} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 outline-none transition-all resize-none" placeholder="Địa chỉ trụ sở / kho hàng..." />
              </div>
            </form>

            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors">Hủy bỏ</button>
              <button type="submit" onClick={handleSave} disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center gap-2 disabled:opacity-60">
                <span className="material-symbols-outlined text-[18px]">save</span> 
                {isSubmitting ? "Đang xử lý..." : "Lưu dữ liệu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}