"use client";

import React, { useEffect, useState } from "react";
import SettingsService, { StoreSettingDTO } from "../../services/SettingsService";

export default function SettingsPage() {
  const [setting, setSetting] = useState<StoreSettingDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await SettingsService.getStoreSetting();
      setSetting(data);
    } catch (error) {
      console.error("Lỗi tải cấu hình:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
      setUploadingLogo(true);
      const url = await SettingsService.uploadLogo(file);
      if (setting) {
        setSetting({ ...setting, logoUrl: url });
      }
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      alert("Tải ảnh thất bại!");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setting) return;
    try {
      setSaving(true);
      await SettingsService.updateStoreSetting(setting);
      alert("Cập nhật thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Có lỗi xảy ra khi lưu cấu hình!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  if (!setting) return <div className="p-8 text-center text-red-500">Không tải được cấu hình.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Cài đặt Hệ thống</h1>
      
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Thông tin chung */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Thông tin chung</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên cửa hàng</label>
                <input 
                  type="text" 
                  value={setting.storeName}
                  onChange={(e) => setSetting({...setting, storeName: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Câu Slogan</label>
                <input 
                  type="text" 
                  value={setting.slogan}
                  onChange={(e) => setSetting({...setting, slogan: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (Icon Name hoặc Link ảnh)</label>
                <div className="flex items-center gap-4">
                  {setting.logoUrl && setting.logoUrl.startsWith("http") && (
                    <img 
                      src={setting.logoUrl} 
                      alt="Logo Preview" 
                      className="w-12 h-12 object-cover rounded-lg border shadow-sm"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={setting.logoUrl}
                      onChange={(e) => setSetting({...setting, logoUrl: e.target.value})}
                      placeholder="Ví dụ: storefront hoặc https://..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                      />
                      {uploadingLogo && <span className="text-sm text-gray-500">Đang tải lên...</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Thông tin liên hệ</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input 
                  type="text" 
                  value={setting.phone}
                  onChange={(e) => setSetting({...setting, phone: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  value={setting.email}
                  onChange={(e) => setSetting({...setting, email: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <textarea 
                  value={setting.address}
                  onChange={(e) => setSetting({...setting, address: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Facebook</label>
                <input 
                  type="url" 
                  value={setting.facebookUrl}
                  onChange={(e) => setSetting({...setting, facebookUrl: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang lưu...
                </>
              ) : "Lưu Thay Đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
