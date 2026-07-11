"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import httpAxios from "../../../services/httpAxios";
import { useCustomerAuth } from "../../CustomerAuthContext";

export default function CustomerLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useCustomerAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError("Vui lòng nhập số điện thoại và mật khẩu");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const response = await httpAxios.post("/Auth/customer/login", {
        phone,
        password
      });
      
      if (response.data.token) {
        login(response.data.token, response.data.customerName || "Khách hàng");
        router.push("/storefront");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || "Số điện thoại hoặc mật khẩu không chính xác");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-sf-background min-h-screen flex flex-col font-sf-body text-sf-on-surface antialiased">
      <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden">
        {/* Abstract Background Element for Editorial Feel */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-S-rmsvfe1gBFIpLHWgBvJtSGpLHUMmwDMxbaQkrZZ2tKJ3zG3y7X7-Ssv5PDkM6ZD-lVeSZ_w6C9VJ5-ouK5HO-bxW933yjFjgJmdjg_AipdAqUkudOonvfIxmP2kg5lNIOtryXwPbfUqoLOFBz4y4_DlyaG_FWgVD_eNKK1j6Hm7jFT3AeLhpg0WMws0gkHfi8g8Y7sK_EF9liav9o6Uvl1GGuDAcFgoEVgNYL4KwTV-lZbbRFA')" }}></div>
        
        <div className="w-full max-w-md bg-sf-surface-container-lowest border border-sf-outline-variant p-12 shadow-sm relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <Link href="/storefront">
              <span className="font-sf-display text-2xl font-bold text-sf-primary tracking-tight">GROCER</span>
            </Link>
          </div>
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-sf-display text-4xl font-extrabold text-sf-primary mb-2">Đăng nhập</h1>
            <p className="font-sf-body text-base text-sf-on-surface-variant">Đăng nhập để tiếp tục mua sắm</p>
          </div>
          
          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-500 font-sf-body text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            
            {/* Phone Input */}
            <div className="relative group border-b border-sf-outline-variant pb-2 transition-all duration-300 focus-within:border-sf-primary focus-within:border-b-2">
              <label className="font-sf-body text-xs font-semibold tracking-wider text-sf-on-surface-variant mb-1 block uppercase">Số điện thoại</label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sf-outline mr-2" style={{ fontVariationSettings: "'FILL' 0" }}>call</span>
                <input 
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-sf-body text-base text-sf-on-surface placeholder-sf-outline-variant outline-none" 
                  placeholder="Nhập số điện thoại" 
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="relative group border-b border-sf-outline-variant pb-2 transition-all duration-300 focus-within:border-sf-primary focus-within:border-b-2">
              <label className="font-sf-body text-xs font-semibold tracking-wider text-sf-on-surface-variant mb-1 block uppercase">Mật khẩu</label>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sf-outline mr-2" style={{ fontVariationSettings: "'FILL' 0" }}>lock</span>
                <input 
                  className="w-full bg-transparent border-none p-0 focus:ring-0 font-sf-body text-base text-sf-on-surface placeholder-sf-outline-variant outline-none" 
                  placeholder="Nhập mật khẩu" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button 
                  className="text-sf-outline hover:text-sf-primary transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link className="font-sf-body text-xs font-semibold text-sf-on-surface-variant hover:text-sf-primary transition-colors" href="#">Quên mật khẩu?</Link>
            </div>
            
            {/* Submit Button */}
            <button 
              className="w-full bg-[#ffab69] hover:bg-[#8e4e14] text-[#783d01] hover:text-white font-sf-body text-sm font-semibold uppercase tracking-wider py-4 rounded-full transition-colors duration-300 shadow-[0_4px_14px_0_rgba(255,171,105,0.39)] hover:shadow-[0_6px_20px_rgba(255,171,105,0.23)] disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
              {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
            </button>
          </form>
          
          {/* Separator */}
          <div className="flex items-center justify-center my-8">
            <div className="border-t border-sf-outline-variant flex-grow"></div>
            <span className="px-4 font-sf-body text-xs font-semibold text-sf-outline uppercase">HOẶC</span>
            <div className="border-t border-sf-outline-variant flex-grow"></div>
          </div>
          
          {/* Social Logins */}
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center space-x-2 border border-sf-outline-variant py-3 rounded hover:bg-sf-surface-container-low transition-colors duration-300 text-sf-on-surface font-sf-body text-base">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span>Tiếp tục với Google</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 border border-sf-outline-variant py-3 rounded hover:bg-sf-surface-container-low transition-colors duration-300 text-sf-on-surface font-sf-body text-base">
              <span className="font-bold text-blue-500 tracking-tighter">Zalo</span>
              <span>Tiếp tục với Zalo</span>
            </button>
          </div>
          
          {/* Registration Link */}
          <div className="mt-8 text-center">
            <p className="font-sf-body text-base text-sf-on-surface-variant">
              Chưa có tài khoản? <Link className="text-sf-primary hover:underline font-sf-body text-xs font-semibold uppercase tracking-wider ml-1" href="/storefront/auth/register">ĐĂNG KÝ NGAY</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
