"use client";

import { useState } from "react";
import axios from "axios";
import AuthService from "../../services/AuthService"; 

export default function AuthLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await AuthService.login({ username, password });
      
      // Lấy role từ localStorage sau khi login thành công
      const role = localStorage.getItem("user_role");
      
      // Chuyển hướng dựa trên Role
      if (role !== "admin") {
        window.location.href = "/dashboard/pos"; 
      } else {
        window.location.href = "/dashboard"; 
      }
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setErrorMessage("Tài khoản hoặc mật khẩu không chính xác!");
        } else {
          setErrorMessage(typeof err.response?.data === 'string' ? err.response.data : "Tài khoản hoặc mật khẩu không chính xác!");
        }
      } else {
        setErrorMessage("Lỗi kết nối hệ thống. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");
    localStorage.setItem("is_demo_mode", "true");

    try {
      await AuthService.login({ username: "quangphuc", password: "123456" });
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setErrorMessage("Không thể đăng nhập bằng tài khoản Demo lúc này!");
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .entrance-animation {
          animation: fadeInTranslate 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeInTranslate {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .input-focus-ring:focus-within {
          border-color: #F59E0B;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15);
        }
        .primary-btn-active:active {
          transform: scale(0.99);
        }
      `}</style>

      <main className="flex min-h-screen bg-[#faf8ff] text-[#131b2e] font-sans">
        {/* LEFT PANEL (45%) */}
        <section className="hidden lg:flex lg:w-[45%] bg-[#0f1c2e] p-[60px] flex-col justify-between text-white relative overflow-hidden">
          <div className="z-10">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-20">
              <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
              <span className="text-[24px] font-bold tracking-tight">NexERP</span>
            </div>
            
            {/* Headline */}
            <div className="space-y-6">
              <h1 className="text-[32px] leading-tight font-extrabold entrance-animation" style={{ animationDelay: '100ms' }}>
                Quản lý doanh nghiệp<br/>thông minh hơn.
              </h1>
              <p className="text-[#8BAABF] text-[15px] leading-relaxed max-w-[420px] entrance-animation" style={{ animationDelay: '200ms' }}>
                Nền tảng ERP cho doanh nghiệp vừa và nhỏ tại Việt Nam — nhanh, chính xác, đáng tin.
              </p>
              
              {/* Feature List */}
              <ul className="space-y-4 mt-12 entrance-animation" style={{ animationDelay: '300ms' }}>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#F59E0B]" style={{ fontVariationSettings: "'wght' 600" }}>check_circle</span>
                  <span className="text-[14px] font-medium text-white/90">Unified platform</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#F59E0B]" style={{ fontVariationSettings: "'wght' 600" }}>check_circle</span>
                  <span className="text-[14px] font-medium text-white/90">Real-time reports</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#F59E0B]" style={{ fontVariationSettings: "'wght' 600" }}>check_circle</span>
                  <span className="text-[14px] font-medium text-white/90">Flexible permissions</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Footer */}
          <div className="z-10 text-[#4A6A8A] text-[12px] font-medium entrance-animation" style={{ animationDelay: '400ms' }}>
            © 2026 NexERP Vietnam
          </div>
        </section>

        {/* RIGHT PANEL (55%) */}
        <section className="w-full lg:w-[55%] bg-white flex items-center justify-center p-6">
          <div className="w-full max-w-[380px] entrance-animation">
            
            {/* Header */}
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-[26px] font-bold text-black mb-2">Đăng nhập</h2>
              <p className="text-[#44474c] text-[14px]">Chào mừng trở lại. Nhập thông tin tài khoản.</p>
            </div>

            {/* Hiển thị lỗi nếu có */}
            {errorMessage && (
              <div className="mb-6 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-[#44474c] block uppercase" htmlFor="username">Tài khoản</label>
                <div className="relative group input-focus-ring border border-[#c5c6cd] bg-[#F8FAFC] rounded-lg transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474c]/60 text-[20px]">person</span>
                  <input 
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-3 pl-10 pr-4 text-[#131b2e] text-[14px] placeholder:text-[#44474c]/40" 
                    id="username" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập username của bạn" 
                    type="text"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-[#44474c] block uppercase" htmlFor="password">Mật khẩu</label>
                <div className="relative group input-focus-ring border border-[#c5c6cd] bg-[#F8FAFC] rounded-lg transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474c]/60 text-[20px]">lock</span>
                  <input 
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-3 pl-10 pr-12 text-[#131b2e] text-[14px] placeholder:text-[#44474c]/40" 
                    id="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#44474c]/60 hover:text-[#131b2e] transition-colors" 
                    onClick={() => setShowPassword(!showPassword)} 
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input className="w-4 h-4 rounded border-[#c5c6cd] text-[#F59E0B] focus:ring-[#F59E0B]/20" type="checkbox" />
                  <span className="text-[13px] text-[#44474c]">Ghi nhớ đăng nhập</span>
                </label>
                <a className="text-[13px] font-semibold text-[#F59E0B] hover:underline decoration-2 underline-offset-4" href="#">Quên mật khẩu?</a>
              </div>

              {/* Primary CTA */}
              <button 
                disabled={isLoading}
                className="w-full bg-[#F59E0B] text-white py-3.5 rounded-lg font-bold text-[15px] primary-btn-active transition-all duration-200 hover:brightness-105 mt-2 disabled:opacity-50" 
                type="submit"
              >
                {isLoading ? "Đang xác thực..." : "Đăng nhập"}
              </button>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#c5c6cd]/30"></span></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-[12px] text-[#44474c]/50 uppercase tracking-widest font-bold">Dành cho Nhà tuyển dụng</span></div>
              </div>

              {/* Demo Login Button */}
              <button 
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full bg-[#E0E7FF] border border-[#C7D2FE] text-[#4338CA] py-3 rounded-lg flex items-center justify-center gap-2 font-bold text-[14px] hover:bg-[#C7D2FE] transition-colors" 
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                Trải nghiệm bản Demo (Chỉ xem)
              </button>
            </form>

            {/* Support Link */}
            <div className="mt-12 text-center">
              <p className="text-[13px] text-[#44474c]">
                Cần hỗ trợ? 
                <a className="text-[#000000] font-bold hover:text-[#F59E0B] transition-colors ml-1" href="mailto:support@nexerp.vn">Liên hệ support@nexerp.vn</a>
              </p>
            </div>

          </div>
        </section>
      </main>
    </>
  );
}