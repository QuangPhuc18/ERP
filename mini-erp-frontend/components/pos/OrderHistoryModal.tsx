import React, { useEffect, useState } from "react";
import OrderService, { OrderDTO } from "../../app/services/OrderService";

interface OrderHistoryModalProps {
  showModal: boolean;
  setShowModal: (val: boolean) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ showModal, setShowModal }) => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal) {
      loadOrders();
    }
  }, [showModal]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getCurrentShiftOrders();
      setOrders(data);
    } catch (error) {
      console.error("Lỗi tải lịch sử đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!showModal) return null;

  const fmt = (n: number) => n?.toLocaleString("vi-VN") + " đ";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Lịch sử đơn hôm nay</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Danh sách các hóa đơn bạn đã bán trong ca này</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadOrders} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Làm mới">
              <span className="material-symbols-outlined block">refresh</span>
            </button>
            <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <span className="material-symbols-outlined block">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {loading ? (
            <div className="text-center py-10 text-gray-400 font-medium flex flex-col items-center gap-3">
              <span className="material-symbols-outlined animate-spin text-4xl text-gray-300">progress_activity</span>
              Đang tải dữ liệu...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="material-symbols-outlined text-6xl text-gray-200 block mb-4">receipt_long</span>
              <p className="font-semibold text-lg text-gray-500">Chưa có đơn hàng nào</p>
              <p className="text-sm mt-1">Bạn chưa bán được đơn nào trong ca này.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, idx) => (
                <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:border-blue-100 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        Đơn hàng #{order.id}
                        {order.status === "Cancelled" && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border border-red-200">Đã hủy</span>
                        )}
                        {order.status === "Completed" && (
                          <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border border-green-200">Hoàn thành</span>
                        )}
                        {order.paymentMethod === "Cash" && (
                          <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border border-amber-200 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">payments</span> Tiền mặt
                          </span>
                        )}
                        {order.paymentMethod === "Transfer" && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest border border-indigo-200 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">account_balance</span> Chuyển khoản
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {new Date(order.orderDate).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-blue-600">{fmt(order.totalAmount)}</p>
                      <p className="text-sm font-semibold text-gray-500">Khách: {order.customerName}</p>
                    </div>
                  </div>
                  
                  {/* Products */}
                  <div className="bg-gray-50 rounded-xl p-4 mt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Chi tiết sản phẩm</p>
                    <div className="space-y-2">
                      {order.details?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-800">
                            {item.productName} <span className="text-gray-400 ml-1">x{item.quantity}</span>
                          </span>
                          <span className="font-semibold text-gray-600">{fmt(item.unitPrice * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
