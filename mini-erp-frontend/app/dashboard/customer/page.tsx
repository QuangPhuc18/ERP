"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import axios from "axios";
import CustomerService, { CustomerDTO } from "../../services/CustomerService";

export default function CustomerPage() {
  const [customers, setCustomers] = useState<CustomerDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // 🎯 Thêm state để nhận biết đang Sửa hay Thêm mới
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: ""
  });

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await CustomerService.getAll();
      startTransition(() => {
        setCustomers(data);
      });
    } catch (err) {
      console.error("Lỗi fetch khách hàng:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // 🎯 Hàm xử lý Lưu (Dùng chung cho cả Thêm và Sửa)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert("Vui lòng nhập Tên và Số điện thoại!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // Nếu có editingId -> Gọi API Cập nhật
        await CustomerService.update(editingId, formData);
        alert("🎉 Cập nhật khách hàng thành công!");
      } else {
        // Ngược lại -> Gọi API Thêm mới
        await CustomerService.create(formData);
        alert("🎉 Thêm khách hàng thành công!");
      }
      
      handleCloseModal();
      fetchCustomers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(`Lỗi: ${err.response?.data || "Không thể lưu khách hàng"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎯 Bấm nút Sửa -> Đổ dữ liệu cũ vào Form
  const handleEdit = (customer: CustomerDTO) => {
    setEditingId(customer.id);
    setFormData({
      fullName: customer.fullName,
      email: customer.email || "",
      phone: customer.phone,
      address: customer.address || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khách hàng ${name}?`)) return;
    try {
      await CustomerService.delete(id);
      fetchCustomers();
    } catch (err) {
      alert("Lỗi khi xóa khách hàng!");
    }
  };

  // 🎯 Hàm đóng Modal và Reset dữ liệu sạch sẽ
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ fullName: "", email: "", phone: "", address: "" });
  };

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <>
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Quản lý Khách hàng</h2>
        <button 
          onClick={() => {
            handleCloseModal(); // Đảm bảo form trống khi bấm Thêm mới
            setIsModalOpen(true);
          }} 
          className="bg-[#10B981] text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-600 transition shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Thêm Khách hàng
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc số điện thoại..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-2 border rounded-lg outline-none focus:border-[#10B981] transition"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">group_off</span>
            <p>Không tìm thấy khách hàng nào.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <th className="p-4 font-semibold">Mã KH</th>
                <th className="p-4 font-semibold">Họ và Tên</th>
                <th className="p-4 font-semibold">Số điện thoại</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Địa chỉ</th>
                <th className="p-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="p-4 text-sm font-medium text-gray-500">#{customer.customerCode || customer.id}</td>
                  <td className="p-4 font-bold text-gray-800">{customer.fullName}</td>
                  <td className="p-4 text-gray-600">{customer.phone}</td>
                  <td className="p-4 text-gray-600">{customer.email}</td>
                  <td className="p-4 text-gray-600">{customer.address}</td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      {/* 🎯 NÚT SỬA */}
                      <button 
                        onClick={() => handleEdit(customer)}
                        className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded transition"
                        title="Sửa khách hàng"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      
                      {/* NÚT XÓA */}
                      <button 
                        onClick={() => handleDelete(customer.id, customer.fullName)}
                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded transition"
                        title="Xóa khách hàng"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            {/* 🎯 Đổi tiêu đề Modal dựa vào state */}
            <h3 className="font-bold text-lg mb-4 text-gray-800">
              {editingId ? "Cập nhật Khách hàng" : "Thêm Khách hàng mới"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Họ và Tên <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:border-[#10B981]" placeholder="Nguyễn Văn A" />
              </div>
              
              <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                    <input required type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:border-[#10B981]" placeholder="090..." />
                </div>
                <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:border-[#10B981]" placeholder="email@domain.com" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Địa chỉ</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:border-[#10B981]" placeholder="Số nhà, đường, quận..." />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2 border rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition">Hủy bỏ</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-[#10B981] text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50">
                    {/* 🎯 Đổi text nút bấm */}
                    {isSubmitting ? "Đang xử lý..." : (editingId ? "Cập nhật" : "Lưu thông tin")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}