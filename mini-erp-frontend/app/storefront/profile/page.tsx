"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfilePage() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", path: "/storefront/profile", icon: "dashboard" },
    { name: "Order History", path: "/storefront/profile/orders", icon: "receipt_long" },
    { name: "My Addresses", path: "/storefront/profile/addresses", icon: "location_on" },
    { name: "Account Info", path: "/storefront/profile/info", icon: "person" },
    { name: "Security", path: "/storefront/profile/security", icon: "lock" },
  ];

  return (
    <div className="bg-sf-background min-h-screen py-8 antialiased">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 bg-sf-surface-container-lowest rounded-2xl shadow-sm border border-sf-surface-variant flex flex-col h-full sticky top-[120px]">
          {/* User Profile Summary */}
          <div className="p-6 text-center border-b border-sf-surface-variant">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-sf-outline-variant bg-sf-surface-container">
              <img 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-sf-display text-sf-headline-md text-sf-primary leading-tight mb-1">
              Welcome<br/>back, Alex
            </h3>
            <div className="flex items-center justify-center gap-1 text-sf-on-tertiary-container font-sf-body text-xs font-semibold mb-1">
              <span className="material-symbols-outlined text-[14px]">stars</span>
              Gold Member
            </div>
            <p className="font-sf-body text-sf-body-md text-sf-on-surface-variant mb-4">2,450 pts</p>
            <button className="w-full bg-[#ff914d] hover:bg-[#e67e3a] text-white font-sf-body text-sf-label-caps py-2.5 rounded-full transition-colors uppercase tracking-widest shadow-sm">
              Redeem Points
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <li key={item.name}>
                    <Link 
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sf-body text-sf-body-md transition-colors ${
                        isActive 
                          ? 'bg-sf-surface text-sf-primary font-semibold' 
                          : 'text-sf-on-surface-variant hover:bg-sf-surface-container-lowest hover:text-sf-primary'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-sf-primary' : ''}`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-sf-surface-variant">
            <ul className="space-y-1">
              <li>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sf-body text-sf-body-md text-sf-on-surface-variant hover:bg-sf-surface hover:text-sf-primary transition-colors text-left">
                  <span className="material-symbols-outlined text-[20px]">help</span>
                  Support
                </button>
              </li>
              <li>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sf-body text-sf-body-md text-sf-error hover:bg-sf-error-container transition-colors text-left">
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1">
          <header className="mb-8">
            <h1 className="font-sf-display text-sf-display-lg-mobile md:text-sf-display-lg text-sf-primary font-bold">
              Chào Alex!
            </h1>
          </header>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Orders Stat */}
            <div className="bg-sf-surface-container-lowest p-6 rounded-2xl shadow-sm border border-sf-surface-variant flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-8 text-sf-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                <span className="font-sf-body text-sf-body-md">Đơn hàng</span>
              </div>
              <div className="font-sf-display text-[32px] md:text-[40px] font-bold text-sf-primary">
                24
              </div>
            </div>

            {/* Points Stat */}
            <div className="bg-sf-surface-container-lowest p-6 rounded-2xl shadow-sm border border-sf-surface-variant flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-8 text-sf-on-tertiary-container">
                <span className="material-symbols-outlined text-[20px]">stars</span>
                <span className="font-sf-body text-sf-body-md text-sf-on-surface-variant">Điểm tích lũy</span>
              </div>
              <div className="font-sf-display text-[32px] md:text-[40px] font-bold text-sf-primary">
                2,450
              </div>
            </div>

            {/* Shipping Stat */}
            <div className="bg-sf-primary-container p-6 rounded-2xl shadow-sm flex flex-col justify-between text-sf-on-primary">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                <span className="font-sf-body text-sf-body-md font-medium">Đang giao</span>
              </div>
              <div>
                <div className="font-sf-display text-[32px] md:text-[40px] font-bold leading-none mb-1">
                  1
                </div>
                <div className="font-sf-body text-sm opacity-90 uppercase tracking-wide font-semibold">
                  Đến lúc 14:30 hôm nay
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sf-display text-sf-headline-md text-sf-primary">Thông tin</h2>
                <button className="flex items-center gap-1 text-[#ff914d] hover:text-[#e67e3a] font-sf-body text-sf-label-caps uppercase tracking-widest transition-colors">
                  CHỈNH SỬA
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
              </div>
              <div className="bg-sf-surface-container-lowest p-8 rounded-2xl shadow-sm border border-sf-surface-variant space-y-6">
                <div>
                  <div className="font-sf-body text-xs font-semibold text-sf-on-surface-variant uppercase tracking-widest mb-1">HỌ VÀ TÊN</div>
                  <div className="font-sf-body text-sf-body-lg text-sf-on-surface">Alex Nguyen</div>
                </div>
                <div>
                  <div className="font-sf-body text-xs font-semibold text-sf-on-surface-variant uppercase tracking-widest mb-1">EMAIL</div>
                  <div className="font-sf-body text-sf-body-lg text-sf-on-surface">alex.nguyen@example.com</div>
                </div>
                <div>
                  <div className="font-sf-body text-xs font-semibold text-sf-on-surface-variant uppercase tracking-widest mb-1">SỐ ĐIỆN THOẠI</div>
                  <div className="font-sf-body text-sf-body-lg text-sf-on-surface">+84 987 654 321</div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div>
              <h2 className="font-sf-display text-sf-headline-md text-sf-primary mb-4">Đơn hàng gần đây</h2>
              <div className="space-y-4">
                {/* Order 1 */}
                <div className="bg-sf-surface-container-lowest p-4 rounded-xl shadow-sm border border-sf-surface-variant flex gap-4 items-center group cursor-pointer hover:border-sf-primary transition-colors">
                  <div className="w-16 h-16 bg-sf-surface-container rounded-lg overflow-hidden shrink-0">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZYJ9yNsdRUHUs_dO74kyXoUpEBqLB6sZlH1rI1a1E1iuBXWLSqJ3ewOK5Y7rX16oEQ_HLKTVoSMiGR6qI410z_H4eXGjeKzJIo3STQYBcBKyh593cf-JZVtVpjCv2JmicwtYc8yRdL_r5NSseZ22lvOWvZuVXZqNYrDmrJGuCL6einjVG3MsBJJjcww2vA8iVmskFLG_dB7Y44tuVBBaXT2a16WFPC838IeihAZ3yRJj-nmqxm7rf" alt="Order" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="font-sf-body text-sf-body-md font-bold text-sf-primary mb-1">Đơn hàng #8902</div>
                    <div className="font-sf-body text-sm text-sf-on-surface-variant">12 Thg 10, 2023 • 5 sản phẩm</div>
                  </div>
                  <div className="text-right">
                    <div className="font-sf-display text-sf-body-lg font-bold text-sf-primary mb-1">850.000₫</div>
                    <div className="flex items-center justify-end gap-1 font-sf-body text-xs font-medium text-[#ff914d]">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Đã giao
                    </div>
                  </div>
                </div>

                {/* Order 2 */}
                <div className="bg-sf-surface-container-lowest p-4 rounded-xl shadow-sm border border-sf-surface-variant flex gap-4 items-center group cursor-pointer hover:border-sf-primary transition-colors">
                  <div className="w-16 h-16 bg-sf-surface-container rounded-lg overflow-hidden shrink-0">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvjdmUqVhOAQrOaIcOFoep8K6abmxo7lvgvIJXtp_t9NuTlDTn1SMC83aoOkTuMTY8XfP25j_gggJQgKAQ2ZK9vsBKWdzVxi5nuGz9FyC32LnMVp30fV9JdMn4V69BbfzT4kbGy0eSFy2MXRtPnScKAjnKf6Y0cMm5vzgXTR7Mhf7l_99uUMwWE2_8XqnLIXHDbddN0plR18S3--zQ2zVqmqvH-0n2lirW6m30Trr22mt_cmZSK-fg" alt="Order" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="font-sf-body text-sf-body-md font-bold text-sf-primary mb-1">Đơn hàng #8895</div>
                    <div className="font-sf-body text-sm text-sf-on-surface-variant">05 Thg 10, 2023 • 3 sản phẩm</div>
                  </div>
                  <div className="text-right">
                    <div className="font-sf-display text-sf-body-lg font-bold text-sf-primary mb-1">320.000₫</div>
                    <div className="flex items-center justify-end gap-1 font-sf-body text-xs font-medium text-sf-on-surface-variant">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Đã giao
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-left">
                <button className="font-sf-body text-sf-label-caps text-[#ff914d] hover:text-[#e67e3a] uppercase tracking-widest font-bold transition-colors">
                  XEM TẤT CẢ ĐƠN HÀNG →
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
