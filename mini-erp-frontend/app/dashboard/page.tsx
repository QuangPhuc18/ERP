"use client";

import React, { useEffect, useState, startTransition } from "react";
import httpAxios from "../services/httpAxios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";

// ─────────────────────────────────────────────
// TYPESCRIPT INTERFACES (🎯 KHẮC PHỤC LỖI ANY)
// ─────────────────────────────────────────────
interface Kpis {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  monthlyRevenue: number;
}

interface RevenueMonth {
  month: string;
  revenue: number;
}

interface OrderStat {
  status: string;
  count: number;
}

interface CategoryRevenue {
  categoryName: string;
  revenue: number;
}

interface TopProduct {
  productName: string;
  soldQuantity: number;
}

interface LowStockProduct {
  productName: string;
  quantity: number;
}

interface TopCustomer {
  customerName: string;
  totalSpent: number;
}

// Interface mới phục vụ tính năng theo dõi Nhập - Xuất - Tồn tháng này
interface ProductFlowStats {
  productName: string;
  importedQuantity: number;
  soldQuantity: number;
  currentStock: number;
}

interface DashboardData {
  kpis: Kpis;
  revenueByMonth: RevenueMonth[];
  orderStats: OrderStat[];
  categoryRevenue: CategoryRevenue[];
  topProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
  topCustomers: TopCustomer[];
  monthlyProductFlow?: ProductFlowStats[]; // Thuộc tính mới thêm
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchDashboardData = async () => {
    try {
      const res = await httpAxios.get("/Dashboard/full-stats");
      startTransition(() => {
        setData(res.data);
      });
    } catch (error) {
      console.error("Lỗi tải thống kê", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const fmt = (n: number) => n?.toLocaleString("vi-VN") + "đ";

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const statusMap: Record<string, { label: string, color: string }> = {
    "Pending": { label: "Chờ xác nhận", color: "text-blue-500 bg-blue-50" },
    "Delivering": { label: "Đang giao", color: "text-amber-500 bg-amber-50" },
    "Completed": { label: "Hoàn thành", color: "text-green-500 bg-green-50" },
    "Cancelled": { label: "Đã hủy", color: "text-red-500 bg-red-50" },
  };

  if (loading || !data) {
    return <div className="p-6 text-gray-500 animate-pulse flex items-center justify-center h-screen">Đang tổng hợp dữ liệu báo cáo toàn hệ thống...</div>;
  }

  return (
    <div className="p-6 bg-[#F5F6FA] min-h-screen animate-fade-in -m-6 space-y-6">
      
      {/* TIÊU ĐỀ */}
      <div>
        <h1 className="text-2xl font-black text-gray-800">Báo cáo Tổng quan</h1>
        <p className="text-sm text-gray-500 mt-1">Cập nhật số liệu kinh doanh và luồng hàng hóa theo thời gian thực</p>
      </div>

      {/* 1. THÈ THỐNG KÊ (KPI CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-2xl">inventory_2</span></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng sản phẩm</p>
            <h3 className="text-2xl font-black text-gray-800">{data.kpis.totalProducts}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-2xl">receipt_long</span></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng đơn hàng</p>
            <h3 className="text-2xl font-black text-gray-800">{data.kpis.totalOrders}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-2xl">group</span></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng khách hàng</p>
            <h3 className="text-2xl font-black text-gray-800">{data.kpis.totalCustomers}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><span className="material-symbols-outlined text-2xl">payments</span></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Doanh thu tháng này</p>
            <h3 className="text-xl font-black text-green-600">{fmt(data.kpis.monthlyRevenue)}</h3>
          </div>
        </div>
      </div>

      {/* KHỐI BIỂU ĐỒ DOANH THU & TRẠNG THÁI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BIỂU ĐỒ DOANH THU THEO THÁNG */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-6">Doanh thu 6 tháng gần nhất</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueByMonth} margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000000}M`} />
                {/* 🎯 SỬA LỖI FORMATTER: Ép kiểu dữ liệu an toàn */}
                <Tooltip formatter={(value: unknown) => fmt(Number(value))} cursor={{ fill: '#f8fafc' }} />
                <Bar name="Doanh thu" dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* THỐNG KÊ ĐƠN HÀNG */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-4">Trạng thái đơn hàng</h3>
          <div className="space-y-3">
            {data.orderStats.map((stat: OrderStat, idx: number) => {
              const mapping = statusMap[stat.status] || { label: stat.status || "Chưa rõ", color: "text-gray-500 bg-gray-50" };
              return (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${mapping.color.split(' ')[1]}`}></div>
                    <span className="font-medium text-gray-700">{mapping.label}</span>
                  </div>
                  <span className={`font-black text-lg ${mapping.color.split(' ')[0]}`}>{stat.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🎯 KHỐI MỚI: BIẾN ĐỘNG NHẬP - XUẤT - TỒN SẢN PHẨM TRONG THÁNG (YÊU CẦU BỔ SUNG) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500 text-[20px]">analytics</span>
            Biến động hàng hóa trong tháng (Nhập - Xuất - Tồn)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-gray-500 font-bold bg-white border-b border-gray-100">
                <th className="py-3 px-5">Tên sản phẩm</th>
                <th className="py-3 px-5 text-center bg-rose-50/30 text-rose-700">Đã nhập (Tháng này)</th>
                <th className="py-3 px-5 text-center bg-green-50/30 text-green-700">Đã bán (Tháng này)</th>
                <th className="py-3 px-5 text-center bg-blue-50/30 text-blue-700">Tồn kho hiện tại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data.monthlyProductFlow || []).map((p: ProductFlowStats, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-gray-800">{p.productName}</td>
                  <td className="py-3.5 px-5 text-center font-bold text-rose-600">
                    {p.importedQuantity > 0 ? `+${p.importedQuantity}` : `0`}
                  </td>
                  <td className="py-3.5 px-5 text-center font-bold text-green-600">
                    {p.soldQuantity > 0 ? `-${p.soldQuantity}` : `0`}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${p.currentStock > 5 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                      {p.currentStock} cái
                    </span>
                  </td>
                </tr>
              ))}
              {(!data.monthlyProductFlow || data.monthlyProductFlow.length === 0) && (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400 font-medium">Chưa có dữ liệu biến động kho hàng trong tháng này.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KHỐI SẢN PHẨM & TỒN KHO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DOANH THU THEO DANH MỤC */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-2">Cơ cấu doanh thu theo Danh mục</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.categoryRevenue} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="revenue" nameKey="categoryName">
                  {data.categoryRevenue.map((entry: CategoryRevenue, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {/* 🎯 SỬA LỖI FORMATTER: Ép kiểu dữ liệu an toàn */}
                <Tooltip formatter={(value: unknown) => fmt(Number(value))} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP SẢN PHẨM BÁN CHẠY */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-4">Top 5 Sản phẩm bán chạy</h3>
          <div className="space-y-4">
            {data.topProducts.map((p: TopProduct, idx: number) => (
              <div key={idx} className="flex justify-between items-center border-b border-dashed border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-gray-100 text-gray-500' : idx === 2 ? 'bg-orange-100 text-orange-500' : 'bg-gray-50 text-gray-400'}`}>{idx + 1}</span>
                  <span className="font-medium text-sm text-gray-800 line-clamp-1">{p.productName}</span>
                </div>
                <span className="font-bold text-orange-500 text-sm">{p.soldQuantity} <span className="text-xs font-normal text-gray-400">cái</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* THỐNG KÊ TỒN KHO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            Cảnh báo sắp hết hàng <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          </h3>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-10">Kho hàng đang đầy đủ, không có sản phẩm nào sắp hết.</p>
          ) : (
            <div className="space-y-3">
              {data.lowStockProducts.map((p: LowStockProduct, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-red-50/50 border border-red-100">
                  <span className="font-medium text-sm text-gray-800 truncate max-w-[180px]">{p.productName}</span>
                  <span className="text-xs font-bold bg-white text-red-500 px-2 py-1 rounded-md border border-red-100 shadow-sm">Còn {p.quantity} cái</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TOP KHÁCH HÀNG VIP */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-base font-bold text-gray-800">Top khách hàng chi tiêu nhiều nhất (VIP)</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-white text-gray-500 font-bold border-b border-gray-100">
              <th className="py-3 px-5">Xếp hạng</th>
              <th className="py-3 px-5">Tên khách hàng</th>
              <th className="py-3 px-5 text-right">Tổng tiền đã mua</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.topCustomers.map((c: TopCustomer, idx: number) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-5">
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg font-bold text-xs">#{idx + 1}</span>
                </td>
                <td className="py-4 px-5 font-bold text-gray-800">{c.customerName}</td>
                <td className="py-4 px-5 text-right font-black text-blue-600">{fmt(c.totalSpent)}</td>
              </tr>
            ))}
            {data.topCustomers.length === 0 && (
              <tr><td colSpan={3} className="text-center py-8 text-gray-400">Chưa có dữ liệu khách hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}