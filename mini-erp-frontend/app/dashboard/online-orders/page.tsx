"use client";

import React, { useEffect, useState } from "react";
import httpAxios from "../../services/httpAxios";
import signalRService from "../../services/SignalRService";

interface OrderDetail {
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

interface Order {
  id: number;
  customerName: string;
  employeeName: string;
  orderDate: string;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: string;
  note: string;
  status: string;
  details: OrderDetail[];
}

export default function OnlineOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    httpAxios.get("/Orders")
      .then(res => {
        // Lọc các đơn hàng được đặt từ hệ thống Website (EmployeeName = "System")
        const onlineOrders = res.data.filter((o: Order) => o.employeeName === "System");
        setOrders(onlineOrders);
      })
      .catch(err => console.error("Lỗi lấy danh sách đơn hàng:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();

    // Lắng nghe sự kiện có đơn hàng mới để tải lại danh sách
    const handleNewOrder = () => {
      fetchOrders();
    };

    signalRService.on("NewOrderReceived", handleNewOrder);

    return () => {
      signalRService.off("NewOrderReceived", handleNewOrder);
    };
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    if (!confirm(`Bạn có chắc chắn muốn chuyển trạng thái đơn hàng thành "${newStatus}"?`)) return;
    
    setIsUpdating(true);
    try {
      // Backend mong đợi [FromBody] string (phải bọc trong dấu nháy kép cho JSON string)
      await httpAxios.put(`/Orders/${orderId}/status`, `"${newStatus}"`, {
        headers: { "Content-Type": "application/json" }
      });
      alert("Cập nhật trạng thái thành công!");
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      alert("Cập nhật trạng thái thất bại. Vui lòng thử lại!");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending": return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Chờ xử lý</span>;
      case "Processing": return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Đang chuẩn bị</span>;
      case "Shipping": return <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">Đang giao hàng</span>;
      case "Completed": return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Hoàn thành</span>;
      case "Cancelled": return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Đã hủy</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  if (loading && orders.length === 0) {
    return <div className="p-6 text-center text-gray-500">Đang tải danh sách đơn hàng Online...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Đơn hàng Online</h1>
        <button onClick={fetchOrders} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">refresh</span>
          Làm mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                <th className="p-4 font-semibold">Mã ĐH</th>
                <th className="p-4 font-semibold">Ngày đặt</th>
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Tổng tiền</th>
                <th className="p-4 font-semibold">Thanh toán</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900">#WEB-{order.id}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(order.orderDate).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-4 text-sm">
                      <p className="font-semibold text-gray-800">{order.customerName}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.note}</p>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-800">
                      {order.totalAmount.toLocaleString()}₫
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.paymentMethod}
                    </td>
                    <td className="p-4 text-sm">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded transition-colors" 
                        title="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Chưa có đơn hàng Online nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #WEB-{selectedOrder.id}</h2>
                <p className="text-sm text-gray-500 mt-1">Ngày đặt: {new Date(selectedOrder.orderDate).toLocaleString("vi-VN")}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Thông tin khách hàng</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-800 mb-1">{selectedOrder.customerName}</p>
                    <p className="text-sm text-gray-600 mb-1"><span className="font-medium">PT Thanh toán:</span> {selectedOrder.paymentMethod}</p>
                    {selectedOrder.note && <p className="text-sm text-gray-600"><span className="font-medium">Ghi chú:</span> {selectedOrder.note}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cập nhật Trạng thái</h3>
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">Hiện tại:</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button disabled={isUpdating} onClick={() => handleUpdateStatus(selectedOrder.id, "Processing")} className="px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded border border-blue-200">Đang chuẩn bị</button>
                      <button disabled={isUpdating} onClick={() => handleUpdateStatus(selectedOrder.id, "Shipping")} className="px-3 py-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded border border-indigo-200">Đang giao</button>
                      <button disabled={isUpdating} onClick={() => handleUpdateStatus(selectedOrder.id, "Completed")} className="px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 rounded border border-green-200">Hoàn thành</button>
                      <button disabled={isUpdating} onClick={() => handleUpdateStatus(selectedOrder.id, "Cancelled")} className="px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 rounded border border-red-200">Hủy đơn</button>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sản phẩm đã đặt</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <tr>
                      <th className="p-3 font-semibold">Tên sản phẩm</th>
                      <th className="p-3 font-semibold text-center">Số lượng</th>
                      <th className="p-3 font-semibold text-right">Đơn giá</th>
                      <th className="p-3 font-semibold text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedOrder.details.map((detail, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-gray-800">{detail.productName}</td>
                        <td className="p-3 text-center">{detail.quantity}</td>
                        <td className="p-3 text-right">{detail.unitPrice.toLocaleString()}₫</td>
                        <td className="p-3 text-right font-semibold text-gray-800">{detail.subTotal.toLocaleString()}₫</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={3} className="p-3 text-right font-bold text-gray-600 uppercase text-xs">Tổng cộng</td>
                      <td className="p-3 text-right font-bold text-indigo-600 text-base">{selectedOrder.totalAmount.toLocaleString()}₫</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
