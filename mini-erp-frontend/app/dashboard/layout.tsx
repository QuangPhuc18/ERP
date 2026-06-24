"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AuthService from "../services/AuthService";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // 🎯 Dùng để xác định menu nào đang được chọn

  const [userRole, setUserRole] = useState("user");
  const [username, setUsername] = useState("User");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("user_role") || "user";
      const name = localStorage.getItem("username") || "User";
      setUserRole(role);
      setUsername(name);
    }
  }, []);

  // 🎯 Cấu trúc hóa Menu để dễ quản lý
  const menuItems = [
    { name: "Tổng quan", path: "/dashboard", icon: "dashboard" },
    { name: "Bán hàng POS", path: "/dashboard/pos", icon: "point_of_sale", isHighlight: true },
    { name: "Khách hàng", path: "/dashboard/customer", icon: "groups" },
    { name: "Kho Sản phẩm", path: "/dashboard/products", icon: "inventory_2" },
    { name: "Danh mục", path: "/dashboard/categories", icon: "category" },
    { name: "Nhân sự", path: "/dashboard/employees", icon: "badge" },
    { name: "Bộ phận", path: "/dashboard/departments", icon: "domain" },
    { name: "Bảng lương", path: "/dashboard/payroll", icon: "payments" }, 
    { name: "Quản lý Dự án", path: "/dashboard/projects", icon: "work" },
    { name: "Nhà cung cấp", path: "/dashboard/suppliers", icon: "local_shipping" },
    { name: "Báo cáo cuối ngày", path: "/dashboard/reports", icon: "summarize" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6FA]">
      
      {/* 🚀 SIDEBAR TRÁI (ẨN NẾU KHÔNG PHẢI ADMIN) */}
      {userRole === "admin" && (
      <aside className="hidden md:flex flex-col w-[260px] h-full bg-white border-r border-gray-200 z-20 shadow-sm shrink-0 transition-all">
        {/* Logo */}
        <div className="h-16 flex flex-col justify-center px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white font-bold text-xl">bolt</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-800 leading-tight tracking-tight">NexERP</h1>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none">Enterprise</p>
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3">Quản lý chung</div>
          
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path}
                className={`flex items-center px-3 py-2.5 rounded-xl font-medium transition-all group ${
                  isActive 
                    ? "bg-orange-50 text-orange-600" 
                    : item.isHighlight
                      ? "text-emerald-600 hover:bg-emerald-50"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span className={`material-symbols-outlined mr-3 text-[22px] transition-transform group-hover:scale-110 ${isActive ? 'font-bold' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}

          {/* Menu Admin */}
          {userRole === "admin" && (
            <>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-3">Khu vực Quản trị</div>
              <Link href="/dashboard/purchase-orders" className={`flex items-center px-3 py-2.5 rounded-xl font-medium transition-all group ${pathname === '/dashboard/purchase-orders' ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
                <span className="material-symbols-outlined mr-3 text-[22px] transition-transform group-hover:scale-110">local_shipping</span>
                <span className="text-sm">Nhập hàng (PO)</span>
              </Link>
              <Link href="/auth/register" className={`flex items-center px-3 py-2.5 rounded-xl font-medium transition-all group ${pathname === '/auth/register' ? "bg-blue-50 text-blue-600" : "text-blue-500 hover:bg-blue-50"}`}>
                <span className="material-symbols-outlined mr-3 text-[22px] transition-transform group-hover:scale-110">admin_panel_settings</span>
                <span className="text-sm">Cấp tài khoản mới</span>
              </Link>
            </>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center bg-white border border-gray-200 p-2 rounded-xl shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-black mr-3 uppercase">
              {username.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{username}</p>
              <p className="text-[11px] font-medium text-gray-400 uppercase">{userRole}</p>
            </div>
            <button onClick={() => AuthService.logout()} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Đăng xuất">
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
      )}

      {/* 🚀 MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TopNavBar (ẨN NẾU KHÔNG PHẢI ADMIN) */}
        {userRole === "admin" && (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center md:hidden">
            <h1 className="text-xl font-black text-orange-500">NexERP</h1>
          </div>
          
          <div className="hidden md:flex flex-1 items-center max-w-md">
            <div className="relative w-full group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors">search</span>
              <input className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all shadow-sm" placeholder="Tìm kiếm nhanh dữ liệu (Ctrl + K)..." type="text" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full relative transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
          </div>
        </header>
        )}

        {/* Nội dung trang (Page Content) */}
        <main className={`flex-1 overflow-y-auto ${pathname === '/dashboard/pos' ? 'p-0' : 'p-6'}`}>
          {children}
        </main>

      </div>
    </div>
  );
}