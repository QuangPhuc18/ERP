"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import httpAxios from "../../../services/httpAxios";
import { useCustomerAuth } from "../../CustomerAuthContext";

export default function CustomerRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useCustomerAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !password) {
      setError("Vui lòng nhập đầy đủ họ tên, số điện thoại và mật khẩu");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Gọi API Đăng ký
      await httpAxios.post("/Auth/customer/register", {
        fullName,
        phone,
        password
      });
      
      // Đăng ký xong, tự động gọi API Đăng nhập
      const loginRes = await httpAxios.post("/Auth/customer/login", {
        phone,
        password
      });

      if (loginRes.data.token) {
        login(loginRes.data.token, loginRes.data.customerName || fullName);
        router.push("/storefront");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || "Đăng ký thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-sf-surface-container-low text-sf-on-surface font-sf-body min-h-[calc(100vh-100px)] flex items-center justify-center py-12 px-5 md:px-16 selection:bg-sf-primary-container selection:text-white">
      <main className="w-full max-w-md bg-sf-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0_4px_24px_rgba(45,90,39,0.05)] border border-sf-surface-variant flex flex-col items-center">
        {/* Logo */}
        <Link className="mb-8 block" href="/storefront">
          <img 
            alt="Organic Narrative Brand Logo" 
            className="w-16 h-16 object-cover rounded-DEFAULT" 
            src="https://lh3.googleusercontent.com/aida/AP1WRLuppoWlhYfizjZsEEMAjBYPyzBp-88M0zzXtRHloa2Ni8u39JqyP-ktfzVqZ1uKOpZbbQO2Q5tX8LD2bydi4epHm28bGlrHpos_4p3lJ3iPV8Exy614zLfcWwOGTrpaGhBN_x6VSJd93vablnj0xDe6Nasi-JvbDE4Fn-WnVWE8oQ-R4hArt6ZyvKJN-L02PT3NuvpqLTT_J20gsQ2vd2IGL0fknBg3jHkWv-Ojz1PKnWV_cl70AYVqDQ"
          />
        </Link>
        
        {/* Header */}
        <div className="text-center mb-8 w-full">
          <h1 className="font-sf-display text-2xl font-bold text-sf-primary mb-2">Tạo tài khoản mới</h1>
          <p className="font-sf-body text-base text-sf-on-surface-variant">Tích điểm mỗi đơn hàng, nhận ưu đãi riêng.</p>
        </div>
        
        {/* Form */}
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 font-sf-body text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Họ tên */}
          <div className="space-y-1">
            <label className="block font-sf-body text-xs font-semibold uppercase tracking-wider text-sf-on-surface-variant" htmlFor="fullname">Họ tên</label>
            <div className="relative">
              <input 
                className="w-full bg-sf-surface border-0 border-b border-sf-surface-variant focus:border-sf-primary-container focus:ring-0 px-0 py-3 font-sf-body text-base text-sf-on-surface transition-colors duration-200 outline-none" 
                id="fullname" 
                name="fullname" 
                placeholder="Nguyễn Văn A" 
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
          </div>
          
          {/* Số điện thoại */}
          <div className="space-y-1">
            <label className="block font-sf-body text-xs font-semibold uppercase tracking-wider text-sf-on-surface-variant" htmlFor="phone">Số điện thoại</label>
            <div className="relative">
              <input 
                className="w-full bg-sf-surface border-0 border-b border-sf-surface-variant focus:border-sf-primary-container focus:ring-0 px-0 py-3 font-sf-body text-base text-sf-on-surface transition-colors duration-200 outline-none" 
                id="phone" 
                name="phone" 
                placeholder="0912 345 678" 
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>
          
          {/* Mật khẩu */}
          <div className="space-y-1">
            <label className="block font-sf-body text-xs font-semibold uppercase tracking-wider text-sf-on-surface-variant" htmlFor="password">Mật khẩu</label>
            <div className="relative">
              <input 
                className="w-full bg-sf-surface border-0 border-b border-sf-surface-variant focus:border-sf-primary-container focus:ring-0 px-0 py-3 pr-10 font-sf-body text-base text-sf-on-surface transition-colors duration-200 outline-none" 
                id="password" 
                name="password" 
                placeholder="Tối thiểu 8 ký tự" 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button 
                className="absolute right-0 top-1/2 -translate-y-1/2 text-sf-on-surface-variant hover:text-sf-primary transition-colors" 
                onClick={() => setShowPassword(!showPassword)} 
                type="button"
              >
                <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>
          
          {/* Submit */}
          <div className="pt-4">
            <button 
              className="w-full bg-[#ffb36e] hover:bg-[#ffab69] text-[#251a00] py-4 px-6 rounded-full font-sf-body text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:shadow-[0_4px_12px_rgba(45,90,39,0.1)] active:scale-[0.98] disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
              {loading ? "ĐANG XỬ LÝ..." : "Đăng ký"}
            </button>
          </div>
        </form>
        
        {/* Footer Link */}
        <div className="mt-8 text-center w-full">
          <p className="font-sf-body text-base text-sf-on-surface-variant">
            Đã có tài khoản? <Link className="text-sf-primary font-semibold hover:underline decoration-2 underline-offset-4 transition-all" href="/storefront/auth/login">Đăng nhập</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
