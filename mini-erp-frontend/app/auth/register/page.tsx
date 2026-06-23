"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import AuthService from "../../services/AuthService";
import EmployeeService, { EmployeeDTO } from "../../services/EmployeeService";

export default function AuthRegisterPage() {
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [employeeId, setEmployeeId] = useState(0);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user"); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Nạp danh sách nhân viên khi vừa vào trang & ĐẶT CHỐT GÁC BẢO VỆ
  useEffect(() => {
    // 1. CHỐT GÁC: Kiểm tra quyền Admin
    if (typeof window !== "undefined") {
      const currentRole = localStorage.getItem("user_role");
      if (currentRole !== "admin") {
        alert("⛔ TỪ CHỐI TRUY CẬP: Bạn không có quyền Quản trị viên để vào trang này!");
        window.location.href = "/dashboard"; // Đá văng về trang chủ
        return; // Dừng thực thi toàn bộ code bên dưới
      }
    }

    // 2. NẾU LÀ ADMIN: Tiến hành tải danh sách nhân viên
    let isMounted = true;
    async function loadEmployees() {
      try {
        const data = await EmployeeService.getAll();
        if (isMounted) setEmployees(data);
      } catch (err) {
        if (isMounted) setErrorMessage("Không thể tải danh sách nhân viên để cấp tài khoản.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadEmployees().catch(err => console.error(err));
    return () => { isMounted = false; };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (employeeId === 0) {
      setErrorMessage("Vui lòng chọn nhân viên để cấp tài khoản!");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Gửi đầy đủ dữ liệu bao gồm cả employeeId xuống C#
      await AuthService.register({ username, password, role, employeeId });
      
      setSuccessMessage("Tạo tài khoản thành công! Đang chuyển hướng...");
      
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1500);

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(typeof err.response?.data === 'string' ? err.response.data : "Dữ liệu không hợp lệ hoặc nhân viên này đã có tài khoản!");
      } else {
        setErrorMessage("Lỗi kết nối hệ thống. Vui lòng thử lại!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
        .entrance-animation { animation: fadeInTranslate 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInTranslate { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .input-focus-ring:focus-within { border-color: #10B981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.15); }
        .primary-btn-active:active { transform: scale(0.99); }
      `}</style>

      <main className="flex min-h-screen bg-[#faf8ff] text-[#131b2e] font-sans">
        <section className="hidden lg:flex lg:w-[45%] bg-[#0f1c2e] p-[60px] flex-col justify-between text-white relative overflow-hidden">
          <div className="z-10">
            <div className="flex items-center gap-2 mb-20">
              <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
              <span className="text-[24px] font-bold tracking-tight">NexERP</span>
            </div>
            <div className="space-y-6">
              <h1 className="text-[32px] leading-tight font-extrabold entrance-animation" style={{ animationDelay: '100ms' }}>Mở rộng hệ sinh thái<br/>doanh nghiệp.</h1>
              <p className="text-[#8BAABF] text-[15px] leading-relaxed max-w-[420px] entrance-animation" style={{ animationDelay: '200ms' }}>Khởi tạo tài khoản phân quyền an toàn, cấp quyền truy cập nhanh chóng cho nhân sự mới gia nhập hệ thống.</p>
              <ul className="space-y-4 mt-12 entrance-animation" style={{ animationDelay: '300ms' }}>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-[#10B981]" style={{ fontVariationSettings: "'wght' 600" }}>shield_person</span><span className="text-[14px] font-medium text-white/90">Bảo mật dữ liệu tuyệt đối</span></li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-[#10B981]" style={{ fontVariationSettings: "'wght' 600" }}>admin_panel_settings</span><span className="text-[14px] font-medium text-white/90">Quản lý phân quyền Role-based</span></li>
              </ul>
            </div>
          </div>
          <div className="z-10 text-[#4A6A8A] text-[12px] font-medium entrance-animation" style={{ animationDelay: '400ms' }}>© 2026 NexERP Vietnam</div>
        </section>

        <section className="w-full lg:w-[55%] bg-white flex items-center justify-center p-6">
          <div className="w-full max-w-[400px] entrance-animation">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-[26px] font-bold text-black mb-2">Tạo tài khoản mới</h2>
              <p className="text-[#44474c] text-[14px]">Điền thông tin định danh để cấp quyền truy cập.</p>
            </div>

            {errorMessage && <div className="mb-6 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 font-medium flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">error</span>{errorMessage}</div>}
            {successMessage && <div className="mb-6 bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg border border-emerald-200 font-medium flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">check_circle</span>{successMessage}</div>}

            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Chọn Nhân viên */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-[#44474c] block uppercase">Chủ sở hữu (Nhân viên)</label>
                <div className="relative group input-focus-ring border border-[#c5c6cd] bg-[#F8FAFC] rounded-lg transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474c]/60 text-[20px]">badge</span>
                  <select 
                    className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-3 pl-10 pr-4 text-[#131b2e] text-[14px] cursor-pointer appearance-none"
                    value={employeeId} onChange={(e) => setEmployeeId(parseInt(e.target.value))} required disabled={isLoading}
                  >
                    <option value={0} disabled>{isLoading ? "Đang tải danh sách..." : "-- Chọn nhân viên cần cấp tài khoản --"}</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} (ID: {emp.id})</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#44474c]/40 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-[#44474c] block uppercase">Tài khoản</label>
                <div className="relative group input-focus-ring border border-[#c5c6cd] bg-[#F8FAFC] rounded-lg transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474c]/60 text-[20px]">person_add</span>
                  <input className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-3 pl-10 pr-4 text-[#131b2e] text-[14px]" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên định danh (VD: admin_01)" type="text" />
                </div>
              </div>

              {/* Phân quyền Role */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-[#44474c] block uppercase">Phân quyền (Role)</label>
                <div className="relative group input-focus-ring border border-[#c5c6cd] bg-[#F8FAFC] rounded-lg transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474c]/60 text-[20px]">admin_panel_settings</span>
                  <select className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-3 pl-10 pr-4 text-[#131b2e] text-[14px] cursor-pointer appearance-none" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="user">Nhân viên (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#44474c]/40 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-[#44474c] block uppercase">Mật khẩu</label>
                <div className="relative group input-focus-ring border border-[#c5c6cd] bg-[#F8FAFC] rounded-lg transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474c]/60 text-[20px]">key</span>
                  <input className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-3 pl-10 pr-12 text-[#131b2e] text-[14px]" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu bảo mật" type={showPassword ? "text" : "password"} />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#44474c]/60 hover:text-[#131b2e] transition-colors" onClick={() => setShowPassword(!showPassword)} type="button"><span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span></button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold tracking-wider text-[#44474c] block uppercase">Xác nhận mật khẩu</label>
                <div className="relative group input-focus-ring border border-[#c5c6cd] bg-[#F8FAFC] rounded-lg transition-all duration-200">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#44474c]/60 text-[20px]">lock_reset</span>
                  <input className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-3 pl-10 pr-12 text-[#131b2e] text-[14px]" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu" type={showConfirmPassword ? "text" : "password"} />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#44474c]/60 hover:text-[#131b2e] transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)} type="button"><span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? "visibility_off" : "visibility"}</span></button>
                </div>
              </div>

              {/* Primary CTA */}
              <button disabled={isSubmitting} className="w-full bg-[#10B981] text-white py-3.5 rounded-lg font-bold text-[15px] primary-btn-active transition-all duration-200 hover:brightness-105 mt-4 disabled:opacity-50" type="submit">
                {isSubmitting ? "Đang xử lý..." : "Khởi tạo tài khoản"}
              </button>
              
              <div className="text-center pt-4">
                <a href="/dashboard" className="text-[13px] font-semibold text-[#44474c] hover:text-[#10B981] transition-colors">← Quay lại Dashboard</a>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}