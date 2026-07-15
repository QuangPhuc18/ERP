import React, { useEffect, useState } from "react";
import OrderService from "../../app/services/OrderService";
import { IClose, ICheck, ISpin } from "../shared/Icons";
import { PaymentMethod, CartItem, Customer } from "../../types/pos.types";

interface CheckoutModalProps {
  showCheckoutModal: boolean;
  setShowCheckoutModal: (val: boolean) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (val: PaymentMethod) => void;
  note: string;
  setNote: (val: string) => void;
  totalAmount: number;
  setAmountPaidStr: (val: string) => void;
  pointsUsed?: number;
  setPointsUsed?: (val: number) => void;
  maxPointsCanUse?: number;
  handleCheckout: () => void;
  isProcessing: boolean;
  completedOrder: Record<string, any> | null;
  setCompletedOrder: (val: Record<string, any> | null) => void;
  pendingPaymentOrder?: {orderId: number, totalAmount: number, orderData: any} | null;
  setPendingPaymentOrder?: (val: any) => void;
  storeInfo: { name: string; address: string; phone: string; logo: string; };
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  showCheckoutModal, setShowCheckoutModal, paymentMethod, setPaymentMethod,
  note, setNote, totalAmount, amountPaidStr, setAmountPaidStr,
  pointsUsed = 0, setPointsUsed = () => {}, maxPointsCanUse = 0,
  handleCheckout, isProcessing, completedOrder, setCompletedOrder, storeInfo, pendingPaymentOrder, setPendingPaymentOrder
}) => {
  useEffect(() => {
    let interval: any;
    if (pendingPaymentOrder) {
      interval = setInterval(async () => {
        try {
          const order = await OrderService.getOrderById(pendingPaymentOrder.orderId);
          if (order.status === "Completed") {
            if (setCompletedOrder) setCompletedOrder(pendingPaymentOrder.orderData);
            if (setPendingPaymentOrder) setPendingPaymentOrder(null);
            setShowCheckoutModal(false);
          }
        } catch (e) {
          console.error("Lỗi khi kiểm tra thanh toán", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [pendingPaymentOrder, setCompletedOrder, setPendingPaymentOrder, setShowCheckoutModal]);

  const [isManualConfirming, setIsManualConfirming] = useState(false);
  const handleManualConfirm = async () => {
    if (!pendingPaymentOrder) return;
    setIsManualConfirming(true);
    try {
      await OrderService.manualConfirmOrder(pendingPaymentOrder.orderId);
      if (setCompletedOrder) setCompletedOrder(pendingPaymentOrder.orderData);
      if (setPendingPaymentOrder) setPendingPaymentOrder(null);
      setShowCheckoutModal(false);
    } catch (e) {
      console.error(e);
      alert("Xác nhận thủ công thất bại!");
    } finally {
      setIsManualConfirming(false);
    }
  };

  if (!showCheckoutModal && !completedOrder && !pendingPaymentOrder) return null;

  return (
    <>
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[32px] max-w-4xl w-full flex shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden max-h-[90vh]">
            <div className="w-1/2 p-10 bg-[#F5F6FA] flex flex-col border-r border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-2xl mb-8 tracking-tight">Thanh toán</h3>
              <div className="space-y-6 flex-1">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-3 tracking-wide uppercase">Phương thức</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[{ id: "cash", label: "Tiền mặt", icon: "payments" }, { id: "transfer", label: "Chuyển khoản", icon: "account_balance" }, { id: "card", label: "Quẹt thẻ", icon: "credit_card" }].map(m => (
                      <button key={m.id} onClick={() => setPaymentMethod(m.id as PaymentMethod)} className={`py-4 px-2 rounded-[20px] border-2 flex flex-col items-center gap-2 transition-all duration-300 ${paymentMethod === m.id ? "bg-orange-50/80 border-orange-500 text-orange-600 shadow-sm" : "bg-white border-white text-gray-500 hover:border-orange-200 hover:bg-orange-50/30"}`}><span className="material-symbols-outlined text-[28px]">{m.icon}</span><span className="text-[13px] font-bold">{m.label}</span></button>
                    ))}
                  </div>
                </div>
                <div><label className="block text-sm font-bold text-gray-500 mb-3 tracking-wide uppercase">Ghi chú</label><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập ghi chú cho nhà bếp hoặc thu ngân..." className="w-full h-24 p-4 bg-white border border-gray-200/60 rounded-[20px] text-[15px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all resize-none shadow-sm placeholder:text-gray-400 font-medium"></textarea></div>
                {maxPointsCanUse > 0 && (
                  <div>
                    <label className="block text-sm font-bold text-orange-500 mb-2 tracking-wide uppercase flex items-center justify-between">
                      <span>Dùng điểm tích lũy</span>
                      <span className="text-gray-500 font-normal">Tối đa: {fmt(maxPointsCanUse).replace('đ', '')} đ</span>
                    </label>
                    <div className="flex gap-2 items-center">
                      <input 
                        type="range" 
                        min="0" 
                        max={maxPointsCanUse} 
                        step="1000"
                        value={pointsUsed} 
                        onChange={(e) => setPointsUsed(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" 
                      />
                      <input 
                        type="text" 
                        value={pointsUsed}
                        onChange={(e) => {
                           let val = Number(e.target.value.replace(/\D/g, ''));
                           if (val > maxPointsCanUse) val = maxPointsCanUse;
                           setPointsUsed(val);
                        }}
                        className="w-24 text-center py-2 px-2 border border-gray-200 rounded-xl outline-none focus:border-orange-500 font-bold"
                      />
                    </div>
                    {pointsUsed > 0 && <p className="text-xs text-orange-600 mt-2 italic font-medium">- Sẽ trừ {pointsUsed} điểm vào hoá đơn này</p>}
                  </div>
                )}
              </div>
            </div>
            <div className="w-1/2 p-10 flex flex-col bg-white relative">
              <button onClick={() => setShowCheckoutModal(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"><IClose /></button>
              <h3 className="font-extrabold text-gray-900 text-2xl mb-8 tracking-tight">Xác nhận</h3>
              <div className="space-y-8 flex-1 flex flex-col justify-center">
                <div className="text-center"><p className="text-[13px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Khách cần trả</p><p className="text-5xl font-black text-gray-900 tracking-tighter">{fmt(totalAmount)}</p></div>
                <div><p className="text-[13px] font-bold text-gray-400 mb-3 text-center uppercase tracking-widest">Khách đưa</p><input type="text" value={amountPaidStr} onChange={(e) => setAmountPaidStr(e.target.value.replace(/\D/g, ""))} placeholder="0" className="w-full text-center h-16 bg-gray-50 border border-gray-200/60 rounded-[20px] text-3xl font-black text-gray-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-50 transition-all shadow-sm" /></div>
                <div className="text-center bg-[#F5F6FA] p-6 rounded-[24px] border border-gray-100/50"><p className="text-[13px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Tiền thối lại</p>{(() => { const given = parseInt(amountPaidStr || "0", 10); const change = given - totalAmount; return <p className={`text-3xl font-black tracking-tight ${change < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{change < 0 ? `Khách nợ ${fmt(Math.abs(change))}` : fmt(change)}</p> })()}</div>
              </div>
              <button onClick={handleCheckout} disabled={isProcessing} className="w-full h-16 mt-8 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-[20px] text-[16px] font-black flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-orange-500/20 active:scale-[0.98] tracking-wide">{isProcessing ? <><ISpin /> ĐANG XỬ LÝ...</> : <><ICheck /> XÁC NHẬN THANH TOÁN</>}</button>
            </div>
          </div>
        </div>
      )}

      {pendingPaymentOrder && (
        <div className="fixed inset-0 bg-black/60 z-[65] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in no-print">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 flex flex-col shadow-2xl relative items-center text-center">
            <button onClick={() => { if(setPendingPaymentOrder) setPendingPaymentOrder(null); setShowCheckoutModal(false); }} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"><IClose /></button>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Quét mã QR để thanh toán</h2>
            <p className="text-gray-500 mb-6 font-medium text-sm">Đơn hàng #{pendingPaymentOrder.orderId} - Số tiền: <span className="font-bold text-orange-600">{fmt(pendingPaymentOrder.totalAmount)}</span></p>
            
            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 mb-6">
              {/* Thay YOUR_BIN và YOUR_ACCOUNT bằng mã ngân hàng và STK thực tế */}
              <img 
                src={`https://img.vietqr.io/image/970436-0909123456-compact2.png?amount=${pendingPaymentOrder.totalAmount}&addInfo=ERP%20DH${pendingPaymentOrder.orderId}&accountName=CUAHANG`} 
                alt="QR Code Thanh Toán" 
                className="w-64 h-64 object-contain rounded-xl"
              />
            </div>

            <div className="w-full flex items-center gap-2 text-sm text-gray-500 justify-center mb-6 font-medium bg-orange-50 text-orange-700 py-3 rounded-xl border border-orange-100">
              <ISpin /> Đang chờ khách thanh toán...
            </div>

            <button 
              onClick={handleManualConfirm} 
              disabled={isManualConfirming}
              className="w-full h-14 bg-gray-900 hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              {isManualConfirming ? "Đang xử lý..." : "Xác nhận đã nhận tiền (Thủ công)"}
            </button>
          </div>
        </div>
      )}

      {completedOrder && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in no-print">
          <div className="bg-gray-100 rounded-[32px] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl relative">
            <div className="p-6 pb-0 flex flex-col items-center"><div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4"><span className="material-symbols-outlined text-4xl">check_circle</span></div><h2 className="text-xl font-black text-gray-900 mb-2">Thanh toán thành công!</h2><p className="text-sm text-gray-500 font-medium mb-6">Đơn hàng #{completedOrder.orderNum}</p></div>
            <div className="bg-white mx-6 p-6 shadow-sm border border-gray-200/60 rounded-t-2xl border-b-0 relative"><div className="absolute top-0 left-0 w-full h-2 -translate-y-1/2 flex justify-around overflow-hidden">{Array.from({length: 12}).map((_, i) => <div key={i} className="w-2 h-2 bg-gray-100 rounded-full"></div>)}</div><div className="text-center mb-4"><p className="font-bold text-gray-800 text-lg">{storeInfo.name}</p><p className="text-xs text-gray-500">{storeInfo.address}</p></div><div className="border-t border-dashed border-gray-300 py-3 mb-3"><div className="flex justify-between text-sm font-bold"><span className="text-gray-500">Tổng cộng:</span><span>{fmt(completedOrder.totalAmount)}</span></div>
            {completedOrder.pointsUsed > 0 && <div className="flex justify-between text-sm font-bold text-orange-600"><span>Trừ điểm:</span><span>-{fmt(completedOrder.pointsUsed)}</span></div>}
            <div className="flex justify-between text-sm font-bold"><span className="text-gray-500">Khách đưa:</span><span>{fmt(completedOrder.amountPaid)}</span></div></div></div>
            <div className="p-6 bg-white border-t border-gray-100/50 pt-4 flex gap-3"><button onClick={() => window.print()} className="flex-1 py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[20px]">print</span> IN BILL</button><button onClick={() => setCompletedOrder(null)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">ĐÓNG</button></div>
          </div>
        </div>
      )}

      {/* Bill Printing HTML */}
      {completedOrder && (
        <div id="printable-bill" className="hidden print:block w-[80mm] text-black bg-white p-2 font-mono text-[12px] leading-snug mx-auto">
          <div className="text-center mb-4"><div className="text-xl font-bold mb-1">{storeInfo.name}</div><div className="text-[11px] mb-1">Đ/c: {storeInfo.address}</div><div className="text-[11px]">SĐT: {storeInfo.phone}</div></div>
          <div className="text-center text-lg font-bold mb-3 border-b border-dashed border-black pb-3">HÓA ĐƠN BÁN LẺ</div>
          <div className="text-[11px] mb-3 border-b border-dashed border-black pb-3"><div className="flex justify-between"><span>Số phiếu:</span> <span>#{completedOrder.orderNum}</span></div><div className="flex justify-between"><span>Ngày:</span> <span>{completedOrder.date}</span></div><div className="flex justify-between"><span>Khách hàng:</span> <span>{completedOrder.customer ? completedOrder.customer.fullName : "Khách lẻ"}</span></div></div>
          <div className="mb-3 border-b border-dashed border-black pb-3">
            <div className="flex font-bold border-b border-black pb-1 mb-1">
              <div className="w-1/2">Tên món</div>
              <div className="w-1/4 text-center">SL</div>
              <div className="w-1/4 text-right">T.Tiền</div>
            </div>
            {completedOrder.cart.map((item: CartItem, idx: number) => (
              <div key={idx} className="flex mb-1 items-start">
                <div className="w-1/2 pr-1">{item.productName} {item.selectedUnitName ? `(${item.selectedUnitName})` : ''}</div>
                <div className="w-1/4 text-center">{item.cartQuantity}</div>
                <div className="w-1/4 text-right">{fmt((item.selectedPrice ?? item.price) * item.cartQuantity).replace('đ','')}</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] mb-4 border-b border-dashed border-black pb-3 space-y-1"><div className="flex justify-between"><span>Cộng tiền hàng:</span> <span>{fmt(completedOrder.subtotal)}</span></div>{completedOrder.discountAmount > 0 && <div className="flex justify-between"><span>Chiết khấu:</span> <span>-{fmt(completedOrder.discountAmount)}</span></div>}
          {completedOrder.pointsUsed > 0 && <div className="flex justify-between text-orange-600 font-bold"><span>Trừ điểm:</span> <span>-{fmt(completedOrder.pointsUsed)}</span></div>}
          <div className="flex justify-between font-bold text-[14px] mt-1 pt-1 border-t border-black"><span>TỔNG CỘNG:</span> <span>{fmt(completedOrder.totalAmount)}</span></div><div className="flex justify-between mt-2"><span>Khách thanh toán:</span> <span>{fmt(completedOrder.amountPaid)}</span></div><div className="flex justify-between"><span>Tiền thừa/Ghi nợ:</span> <span>{fmt(Math.abs(completedOrder.amountPaid - completedOrder.totalAmount))}</span></div>
          {completedOrder.customer && <div className="flex justify-between text-gray-500 italic"><span>Điểm thưởng nhận:</span> <span>+{Math.floor(completedOrder.totalAmount * 0.01)} điểm</span></div>}
          </div>
          <div className="text-center text-[11px] italic">Cảm ơn quý khách và hẹn gặp lại!</div>
        </div>
      )}
    </>
  );
};

export { CheckoutModal };
