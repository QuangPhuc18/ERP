"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCustomerAuth } from "../CustomerAuthContext";
import httpAxios from "../../services/httpAxios";
import signalRService from "../../services/SignalRService";

interface OrderDetail {
  productName: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

interface Order {
  id: number;
  orderDate: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  details: OrderDetail[];
}

export default function ProfilePage() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isInitialized, customerName, customerPhone, logout } = useCustomerAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [points, setPoints] = useState(0);

  // Chuyển hướng nếu chưa đăng nhập
  useEffect(() => {
    if (isInitialized && !isLoggedIn) {
      router.push("/storefront/auth/login");
    }
  }, [isLoggedIn, isInitialized, router]);

  // Lấy lịch sử đơn hàng và điểm tích lũy
  const fetchOrderHistory = () => {
    if (customerPhone) {
      setLoadingOrders(true);
      httpAxios.get(`/Storefront/orders/history?phone=${customerPhone}`)
        .then((res) => {
          setOrders(res.data);
        })
        .catch(err => console.error("Lỗi lấy lịch sử đơn hàng:", err))
        .finally(() => setLoadingOrders(false));
        
      httpAxios.get(`/Storefront/customers/${customerPhone}/points`)
        .then((res) => {
          setPoints(res.data.rewardPoints || 0);
        })
        .catch(err => console.error("Lỗi lấy điểm:", err));
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, [customerPhone]);

  // Kết nối Real-time cập nhật trạng thái đơn hàng
  useEffect(() => {
    signalRService.startConnection("");
    const handleStatusChange = (orderId: number, newStatus: string) => {
      // Cập nhật local state
      setOrders(prevOrders => 
        prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
    };

    signalRService.on("OrderStatusChanged", handleStatusChange);

    return () => {
      signalRService.off("OrderStatusChanged", handleStatusChange);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/storefront");
  };

  const navItems = [
    { name: "Tổng quan", path: "/storefront/profile", icon: "dashboard" },
    { name: "Lịch sử đơn hàng", path: "/storefront/profile/orders", icon: "receipt_long" },
  ];

  const getStatusText = (status: string) => {
    switch (status) {
      case "Pending": return "Chờ xử lý";
      case "Processing": return "Đang chuẩn bị";
      case "Shipping": return "Đang giao hàng";
      case "Completed": return "Đã giao";
      case "Cancelled": return "Đã hủy";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "text-yellow-600 bg-yellow-50";
      case "Processing": return "text-blue-600 bg-blue-50";
      case "Shipping": return "text-indigo-600 bg-indigo-50";
      case "Completed": return "text-green-600 bg-green-50";
      case "Cancelled": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (!isInitialized || !isLoggedIn) return null; // Ẩn giao diện lúc đợi redirect

  // Tính toán số liệu thống kê
  const totalOrders = orders.length;
  const shippingOrders = orders.filter(o => o.status === "Shipping").length;

  return (
    <div className="bg-sf-background min-h-screen py-8 antialiased">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 bg-sf-surface-container-lowest rounded-2xl shadow-sm border border-sf-surface-variant flex flex-col h-full sticky top-[120px]">
          {/* User Profile Summary */}
          <div className="p-6 text-center border-b border-sf-surface-variant">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-2 border-sf-outline-variant bg-sf-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-sf-on-surface-variant">person</span>
            </div>
            <h3 className="font-sf-display text-sf-headline-md text-sf-primary leading-tight mb-1">
              Chào mừng trở lại,<br/>{customerName?.split(" ").pop()}
            </h3>
            <div className="flex items-center justify-center gap-1 text-sf-on-tertiary-container font-sf-body text-xs font-semibold mb-1 mt-2">
              <span className="material-symbols-outlined text-[14px]">stars</span>
              Thành viên VIP
            </div>
            <p className="font-sf-body text-sf-body-md text-sf-on-surface-variant mb-4">{points.toLocaleString()} điểm</p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path === "/storefront/profile/orders" && pathname === "/storefront/profile"); // Mặc định chung trang
                return (
                  <li key={item.name}>
                    <button 
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sf-body text-sf-body-md transition-colors ${
                        isActive 
                          ? 'bg-sf-surface text-sf-primary font-semibold' 
                          : 'text-sf-on-surface-variant hover:bg-sf-surface-container-lowest hover:text-sf-primary'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-sf-primary' : ''}`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-sf-surface-variant">
            <ul className="space-y-1">
              <li>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sf-body text-sf-body-md text-sf-error hover:bg-sf-error-container transition-colors text-left">
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1">
          <header className="mb-8">
            <h1 className="font-sf-display text-sf-display-lg-mobile md:text-sf-display-lg text-sf-primary font-bold">
              Xin chào, {customerName}!
            </h1>
          </header>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Orders Stat */}
            <div className="bg-sf-surface-container-lowest p-6 rounded-2xl shadow-sm border border-sf-surface-variant flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-8 text-sf-on-surface-variant">
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                <span className="font-sf-body text-sf-body-md">Tổng đơn hàng</span>
              </div>
              <div className="font-sf-display text-[32px] md:text-[40px] font-bold text-sf-primary">
                {totalOrders}
              </div>
            </div>

            {/* Points Stat */}
            <div className="bg-sf-surface-container-lowest p-6 rounded-2xl shadow-sm border border-sf-surface-variant flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-8 text-sf-on-tertiary-container">
                <span className="material-symbols-outlined text-[20px]">stars</span>
                <span className="font-sf-body text-sf-body-md text-sf-on-surface-variant">Điểm tích lũy</span>
              </div>
              <div className="font-sf-display text-[32px] md:text-[40px] font-bold text-sf-primary">
                {points.toLocaleString()}
              </div>
            </div>

            {/* Shipping Stat */}
            <div className="bg-sf-primary-container p-6 rounded-2xl shadow-sm flex flex-col justify-between text-sf-on-primary">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                <span className="font-sf-body text-sf-body-md font-medium">Đang giao tới</span>
              </div>
              <div>
                <div className="font-sf-display text-[32px] md:text-[40px] font-bold leading-none mb-1">
                  {shippingOrders}
                </div>
                <div className="font-sf-body text-sm opacity-90 uppercase tracking-wide font-semibold">
                  Đơn hàng
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Recent Orders (Takes 2 columns on XL screens) */}
            <div className="xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sf-display text-sf-headline-md text-sf-primary">Lịch sử Đơn hàng</h2>
                <button onClick={fetchOrderHistory} className="flex items-center gap-1 text-sf-on-surface-variant hover:text-sf-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {loadingOrders ? (
                  <div className="text-center p-8 text-sf-on-surface-variant">Đang tải lịch sử...</div>
                ) : orders.length > 0 ? (
                  orders.map(order => (
                    <div key={order.id} className="bg-sf-surface-container-lowest p-5 rounded-xl shadow-sm border border-sf-surface-variant transition-all hover:border-sf-primary/50 group">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4 border-b border-sf-surface-variant pb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-sf-body font-bold text-sf-primary text-lg">#WEB-{order.id}</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          <div className="font-sf-body text-sm text-sf-on-surface-variant">
                            Đặt lúc: {order.orderDate}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="font-sf-display font-bold text-sf-primary text-xl mb-1">
                            {order.totalAmount.toLocaleString()}₫
                          </div>
                          <div className="font-sf-body text-xs text-sf-on-surface-variant">
                            {order.paymentMethod}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4 pt-4 border-t border-sf-surface-variant border-dashed">
                        {order.details.map((detail, idx) => (
                          <div key={idx} className="flex gap-4 items-center font-sf-body">
                            <div className="w-12 h-12 bg-sf-surface-container rounded flex-shrink-0 overflow-hidden">
                              {detail.imageUrl ? (
                                <img src={detail.imageUrl} alt={detail.productName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                  <span className="material-symbols-outlined text-xl">image_not_supported</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 pr-4 text-sm">
                              <span className="text-sf-on-surface line-clamp-2">
                                <span className="text-sf-on-surface-variant font-medium mr-2">{detail.quantity}x</span> 
                                {detail.productName}
                              </span>
                            </div>
                            <span className="text-sf-on-surface-variant font-medium shrink-0 text-sm">
                              {detail.subTotal.toLocaleString()}₫
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-sf-surface-container-lowest p-12 rounded-xl border border-sf-surface-variant text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">receipt_long</span>
                    <p className="font-sf-body text-sf-on-surface-variant mb-4">Bạn chưa có đơn hàng nào.</p>
                    <Link href="/storefront/shop" className="inline-block bg-[#ff914d] text-white px-6 py-2 rounded-lg font-sf-body text-sm font-semibold uppercase tracking-widest hover:bg-[#e67e3a] transition-colors">
                      Mua sắm ngay
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <button className="flex items-center gap-1 text-[#ff914d] hover:text-[#e67e3a] font-sf-body text-sf-label-caps uppercase tracking-widest transition-colors">
                  CHỈNH SỬA
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                </button>
              </div>
              <div className="bg-sf-surface-container-lowest p-8 rounded-2xl shadow-sm border border-sf-surface-variant space-y-6">
                <div>
                  <div className="font-sf-body text-xs font-semibold text-sf-on-surface-variant uppercase tracking-widest mb-1">HỌ VÀ TÊN</div>
                  <div className="font-sf-body text-sf-body-lg text-sf-on-surface font-medium">{customerName}</div>
                </div>
                <div>
                  <div className="font-sf-body text-xs font-semibold text-sf-on-surface-variant uppercase tracking-widest mb-1">SỐ ĐIỆN THOẠI</div>
                  <div className="font-sf-body text-sf-body-lg text-sf-on-surface font-medium">{customerPhone}</div>
                </div>
                <div>
                  <div className="font-sf-body text-xs font-semibold text-sf-on-surface-variant uppercase tracking-widest mb-1">TRẠNG THÁI TÀI KHOẢN</div>
                  <div className="font-sf-body text-sf-body-lg text-green-600 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    Đã xác minh
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
