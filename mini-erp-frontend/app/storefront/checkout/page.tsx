"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../CartContext";
import { useCustomerAuth } from "../CustomerAuthContext";
import CheckoutService, { OnlineOrderRequest } from "../../services/CheckoutService";
import signalRService from "../../services/SignalRService";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const { isLoggedIn, customerName, customerPhone } = useCustomerAuth();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState("Pending");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "",
    district: "",
    ward: "",
    address: "",
    paymentMethod: "cod"
  });

  const [pointsBalance, setPointsBalance] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0);

  // Lấy điểm khi số điện thoại thay đổi (debounce đơn giản)
  React.useEffect(() => {
    if (formData.phone && formData.phone.length >= 10) {
      CheckoutService.getCustomerPoints(formData.phone).then(res => {
        setPointsBalance(res.rewardPoints || 0);
        // Reset pointsUsed nếu điểm bị giảm (do đổi số)
        if (pointsUsed > (res.rewardPoints || 0)) setPointsUsed(0);
      });
    } else {
      setPointsBalance(0);
      setPointsUsed(0);
    }
  }, [formData.phone]);

  // Autofill nếu đã đăng nhập
  React.useEffect(() => {
    if (isLoggedIn) {
      setFormData(prev => ({
        ...prev,
        fullName: customerName || prev.fullName,
        phone: customerPhone || prev.phone
      }));
    }
  }, [isLoggedIn, customerName, customerPhone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, name, value } = e.target;
    setFormData(prev => ({ ...prev, [id || name]: value }));
  };

  const maxPointsCanUse = Math.min(pointsBalance, cartTotal);
  const finalPointsUsed = Math.min(pointsUsed, maxPointsCanUse);
  const finalTotal = cartTotal - finalPointsUsed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }
    
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng cơ bản (Họ tên, SĐT, Địa chỉ)!");
      return;
    }

    setLoading(true);
    try {
      const fullAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`;
      
      const payload: OnlineOrderRequest = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: fullAddress,
        note: "Đơn hàng Online",
        paymentMethod: formData.paymentMethod.toUpperCase(),
        shippingMethod: "Giao hàng tận nơi (Miễn phí)",
        shippingFee: 0,
        pointsUsed: finalPointsUsed,
        details: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const res = await CheckoutService.createOrder(payload);
      setPlacedOrderId(res.orderId);
      setSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      alert("Đặt hàng thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Lắng nghe cập nhật trạng thái đơn hàng Realtime
  React.useEffect(() => {
    if (success && placedOrderId) {
      signalRService.startConnection("");
      const handleStatusChange = (id: number, newStatus: string) => {
        if (id === placedOrderId) {
          console.log(`⚡ [Real-time] Đơn hàng ${id} chuyển sang trạng thái: ${newStatus}`);
          setOrderStatus(newStatus);
        }
      };
      signalRService.on("OrderStatusChanged", handleStatusChange);

      return () => {
        signalRService.off("OrderStatusChanged", handleStatusChange);
      };
    }
  }, [success, placedOrderId]);

  if (success) {
    const getStatusText = () => {
      switch (orderStatus) {
        case "Pending": return "Chờ xử lý";
        case "Processing": return "Đang chuẩn bị hàng";
        case "Shipping": return "Đang giao hàng";
        case "Completed": return "Giao hàng thành công";
        case "Cancelled": return "Đã bị hủy";
        default: return orderStatus;
      }
    };
    
    return (
      <div className="flex justify-center items-center h-screen px-5">
        <div className="text-center p-12 bg-sf-surface-container-lowest rounded-2xl border border-sf-outline-variant shadow-sm max-w-lg w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-green-600">
              {orderStatus === "Completed" ? "done_all" : "check_circle"}
            </span>
          </div>
          <h2 className="text-2xl font-sf-display font-bold text-sf-primary mb-2">Đặt hàng thành công!</h2>
          <p className="font-sf-body text-sm text-sf-on-surface-variant font-bold mb-6 uppercase tracking-wider">MÃ ĐƠN HÀNG: #WEB-{placedOrderId}</p>
          
          {/* Tracking Bar */}
          <div className="bg-sf-surface-container p-6 rounded-xl mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="font-sf-body text-sf-on-surface font-semibold text-sm">Trạng thái Live:</span>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                {getStatusText()}
              </span>
            </div>
            
            {/* Visual Steps */}
            <div className="flex items-center justify-between relative mt-8">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded"></div>
              
              <div className={`relative z-10 flex flex-col items-center w-1/4 ${(orderStatus === 'Pending' || orderStatus === 'Processing' || orderStatus === 'Shipping' || orderStatus === 'Completed') ? 'text-sf-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(orderStatus === 'Pending' || orderStatus === 'Processing' || orderStatus === 'Shipping' || orderStatus === 'Completed') ? 'bg-sf-primary text-white' : 'bg-gray-200'} transition-colors duration-500`}>
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                </div>
                <span className="text-[10px] uppercase font-bold mt-2 text-center leading-tight">Chờ xử lý</span>
              </div>
              
              <div className={`relative z-10 flex flex-col items-center w-1/4 ${(orderStatus === 'Processing' || orderStatus === 'Shipping' || orderStatus === 'Completed') ? 'text-sf-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(orderStatus === 'Processing' || orderStatus === 'Shipping' || orderStatus === 'Completed') ? 'bg-sf-primary text-white' : 'bg-gray-200'} transition-colors duration-500`}>
                  <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                </div>
                <span className="text-[10px] uppercase font-bold mt-2 text-center leading-tight">Chuẩn bị</span>
              </div>
              
              <div className={`relative z-10 flex flex-col items-center w-1/4 ${(orderStatus === 'Shipping' || orderStatus === 'Completed') ? 'text-sf-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(orderStatus === 'Shipping' || orderStatus === 'Completed') ? 'bg-sf-primary text-white' : 'bg-gray-200'} transition-colors duration-500`}>
                  <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                </div>
                <span className="text-[10px] uppercase font-bold mt-2 text-center leading-tight">Đang giao</span>
              </div>
              
              <div className={`relative z-10 flex flex-col items-center w-1/4 ${(orderStatus === 'Completed') ? 'text-sf-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(orderStatus === 'Completed') ? 'bg-sf-primary text-white' : 'bg-gray-200'} transition-colors duration-500`}>
                  <span className="material-symbols-outlined text-[16px]">home</span>
                </div>
                <span className="text-[10px] uppercase font-bold mt-2 text-center leading-tight">Đã giao</span>
              </div>
            </div>
            {orderStatus !== "Completed" && (
               <p className="text-[11px] text-sf-on-surface-variant mt-6 text-center italic">Trang này sẽ tự động cập nhật khi trạng thái đơn thay đổi, bạn không cần tải lại!</p>
            )}
          </div>

          <Link href="/storefront" className="inline-block bg-[#ff914d] text-white px-8 py-3 rounded-lg font-sf-body font-semibold uppercase tracking-widest hover:bg-[#e67e3a] transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="antialiased selection:bg-sf-primary selection:text-white">
      {/* Top Navigation */}
      <header className="w-full bg-sf-surface-container-lowest border-b border-sf-surface-variant sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-5 md:px-16 lg:px-6 py-4 flex items-center justify-between">
          <Link className="flex items-center gap-2" href="/storefront">
            <div className="w-10 h-10 bg-sf-primary-container rounded-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-white">eco</span>
            </div>
            <span className="font-sf-display text-sf-headline-md text-sf-primary tracking-tight uppercase">Fresh Editorial</span>
          </Link>
          <Link className="text-sf-on-surface-variant hover:text-sf-primary transition-colors flex items-center gap-2 font-sf-body text-sf-label-caps" href="/storefront/cart">
            <span className="material-symbols-outlined">arrow_back</span>
            TRỞ VỀ GIỎ HÀNG
          </Link>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-5 md:px-16 lg:px-6 py-12">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 lg:gap-12">
          
          {/* Left Column: Checkout Forms (2/3) */}
          <div className="w-full lg:w-2/3 space-y-16">
            
            {/* Section 1: Thông tin giao hàng */}
            <section>
              <h2 className="font-sf-display text-sf-display-lg-mobile md:text-sf-display-lg mb-8 text-sf-primary">Thông tin giao hàng</h2>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col">
                    <label className="font-sf-body text-sf-label-caps text-sf-on-surface-variant mb-2" htmlFor="fullName">HỌ TÊN</label>
                    <input required value={formData.fullName} onChange={handleChange} className="sf-input-underline w-full text-sf-on-surface" id="fullName" placeholder="Nhập họ và tên người nhận" type="text"/>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-sf-body text-sf-label-caps text-sf-on-surface-variant mb-2" htmlFor="phone">SỐ ĐIỆN THOẠI</label>
                    <input required value={formData.phone} onChange={handleChange} className="sf-input-underline w-full text-sf-on-surface" id="phone" placeholder="Nhập số điện thoại liên hệ" type="tel"/>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col">
                    <label className="font-sf-body text-sf-label-caps text-sf-on-surface-variant mb-2" htmlFor="city">TỈNH / THÀNH PHỐ</label>
                    <select value={formData.city} onChange={handleChange} className="sf-input-underline w-full text-sf-on-surface bg-transparent appearance-none rounded-none" id="city">
                      <option value="" disabled>Chọn Tỉnh/Thành phố</option>
                      <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                      <option value="Hà Nội">Hà Nội</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-sf-body text-sf-label-caps text-sf-on-surface-variant mb-2" htmlFor="district">QUẬN / HUYỆN</label>
                    <input value={formData.district} onChange={handleChange} className="sf-input-underline w-full text-sf-on-surface" id="district" placeholder="Nhập Quận/Huyện" type="text"/>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-sf-body text-sf-label-caps text-sf-on-surface-variant mb-2" htmlFor="ward">PHƯỜNG / XÃ</label>
                    <input value={formData.ward} onChange={handleChange} className="sf-input-underline w-full text-sf-on-surface" id="ward" placeholder="Nhập Phường/Xã" type="text"/>
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="font-sf-body text-sf-label-caps text-sf-on-surface-variant mb-2" htmlFor="address">ĐỊA CHỈ CỤ THỂ</label>
                  <input required value={formData.address} onChange={handleChange} className="sf-input-underline w-full text-sf-on-surface" id="address" placeholder="Số nhà, tên đường, tòa nhà..." type="text"/>
                </div>
              </div>
            </section>
            
            <hr className="border-t border-sf-surface-variant"/>
            
            {/* Section: Điểm Tích Lũy */}
            {pointsBalance > 0 && (
              <section>
                <h2 className="font-sf-display text-sf-headline-md mb-6 text-[#ff914d] flex items-center gap-2">
                  <span className="material-symbols-outlined">stars</span>
                  Dùng điểm tích lũy
                </h2>
                <div className="bg-[#fff9f5] border border-[#ffe0cc] rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-sf-body text-sf-on-surface font-semibold">Khả dụng: {pointsBalance.toLocaleString("vi-VN")} điểm</span>
                    <span className="font-sf-body text-sf-on-surface-variant text-sm">1 điểm = 1đ</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <input 
                      type="range" 
                      min="0" 
                      max={maxPointsCanUse} 
                      step="1000"
                      value={pointsUsed} 
                      onChange={(e) => setPointsUsed(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ff914d]" 
                    />
                    <input 
                      type="text" 
                      value={pointsUsed}
                      onChange={(e) => {
                         let val = Number(e.target.value.replace(/\D/g, ''));
                         if (val > maxPointsCanUse) val = maxPointsCanUse;
                         setPointsUsed(val);
                      }}
                      className="w-24 text-center py-2 px-2 border border-[#ffe0cc] rounded-xl outline-none focus:border-[#ff914d] font-bold text-[#ff914d]"
                    />
                  </div>
                  {pointsUsed > 0 && <p className="text-sm text-[#ff914d] mt-4 font-semibold italic">Đã dùng {pointsUsed.toLocaleString("vi-VN")} điểm. Hóa đơn sẽ được giảm {pointsUsed.toLocaleString("vi-VN")}đ</p>}
                </div>
              </section>
            )}

            <hr className="border-t border-sf-surface-variant"/>
            
            {/* Section 3: Phương thức thanh toán */}
            <section>
              <h2 className="font-sf-display text-sf-headline-md mb-6 text-sf-primary">Phương thức thanh toán</h2>
              <div className="space-y-4">
                <label className={`flex items-center p-6 bg-sf-surface-container-lowest border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'cod' ? 'border-sf-primary' : 'border-sf-surface-variant hover:border-sf-primary'}`}>
                  <input checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="sf-custom-radio" name="paymentMethod" type="radio" value="cod"/>
                  <span className="material-symbols-outlined mr-4 text-sf-on-surface-variant">payments</span>
                  <span className="font-sf-body text-sf-body-lg text-sf-on-surface">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className={`flex items-center p-6 bg-sf-surface-container-lowest border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'bank' ? 'border-sf-primary' : 'border-sf-surface-variant hover:border-sf-primary'}`}>
                  <input checked={formData.paymentMethod === 'bank'} onChange={handleChange} className="sf-custom-radio" name="paymentMethod" type="radio" value="bank"/>
                  <span className="material-symbols-outlined mr-4 text-sf-on-surface-variant">account_balance</span>
                  <span className="font-sf-body text-sf-body-lg text-sf-on-surface">Chuyển khoản ngân hàng</span>
                </label>
                <label className={`flex items-center p-6 bg-sf-surface-container-lowest border rounded-lg cursor-pointer transition-colors ${formData.paymentMethod === 'ewallet' ? 'border-sf-primary' : 'border-sf-surface-variant hover:border-sf-primary'}`}>
                  <input checked={formData.paymentMethod === 'ewallet'} onChange={handleChange} className="sf-custom-radio" name="paymentMethod" type="radio" value="ewallet"/>
                  <span className="material-symbols-outlined mr-4 text-sf-on-surface-variant">account_balance_wallet</span>
                  <span className="font-sf-body text-sf-body-lg text-sf-on-surface">Ví điện tử (Momo / ZaloPay)</span>
                </label>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary (1/3, Sticky) */}
          <aside className="w-full lg:w-1/3">
            <div className="bg-sf-surface-container-lowest border border-sf-surface-variant rounded-xl p-8 sticky top-24 shadow-[0_4px_24px_rgba(45,90,39,0.04)]">
              <h3 className="font-sf-display text-sf-headline-md mb-6 border-b border-sf-surface-variant pb-4 text-sf-primary">Tóm tắt đơn hàng</h3>
              
              {/* Item List */}
              <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="w-16 h-16 bg-sf-surface-container rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img className="w-full h-full object-cover" src={item.imageUrl} alt={item.productName} />
                      ) : (
                        <span className="material-symbols-outlined text-sf-surface-dim">image</span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className="font-sf-body text-sf-body-md font-semibold text-sf-on-surface pr-2">{item.productName}</span>
                        <span className="font-sf-body text-sf-body-md text-sf-on-surface">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</span>
                      </div>
                      <span className="font-sf-body text-sf-label-caps text-sf-on-surface-variant">SL: {item.quantity}</span>
                    </div>
                  </div>
                ))}
                
                {cart.length === 0 && (
                  <div className="text-center py-4 text-sf-on-surface-variant font-sf-body text-sm">
                    Giỏ hàng trống
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-sf-surface-variant pt-6 space-y-4 mb-8">
                <div className="flex justify-between font-sf-body text-sf-body-md text-sf-on-surface-variant">
                  <span>Tạm tính</span>
                  <span>{cartTotal.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between font-sf-body text-sf-body-md text-sf-on-surface-variant">
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </div>
                {finalPointsUsed > 0 && (
                  <div className="flex justify-between font-sf-body text-sf-body-md text-[#ff914d] font-semibold">
                    <span>Trừ điểm tích lũy</span>
                    <span>-{finalPointsUsed.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                <div className="flex justify-between font-sf-display text-sf-headline-md text-sf-primary mt-4 pt-4 border-t border-sf-surface-variant">
                  <span>Tổng cộng</span>
                  <span>{finalTotal.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              {/* CTA */}
              <button 
                type="submit" 
                disabled={loading || cart.length === 0}
                className={`w-full bg-[#ff914d] hover:bg-[#e67e3a] text-white font-sf-body text-sf-label-caps py-4 rounded-lg transition-colors flex justify-center items-center gap-2 uppercase tracking-widest shadow-[0_4px_14px_rgba(255,145,77,0.3)] ${(loading || cart.length === 0) ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {loading ? 'Đang xử lý...' : 'Đặt Hàng Ngay'}
                {!loading && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
              </button>
              
              <p className="font-sf-body text-[10px] text-sf-on-surface-variant text-center mt-4 uppercase tracking-wider">
                Bằng việc đặt hàng, bạn đồng ý với Điều khoản sử dụng của chúng tôi.
              </p>
            </div>
          </aside>
          
        </form>
      </div>
    </div>
  );
}
