"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "../CartContext";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <div className="pt-[120px] pb-12 px-5 md:px-16 max-w-screen-2xl mx-auto min-h-screen">
      {/* Header */}
      <header className="mb-12">
        <h1 className="font-sf-display text-sf-display-lg-mobile md:text-sf-display-lg text-sf-primary mb-2">Giỏ hàng của bạn</h1>
        <p className="font-sf-body text-sf-body-lg text-sf-on-surface-variant">Kiểm tra lại các sản phẩm trước khi thanh toán.</p>
      </header>

      {/* Cart Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
        {/* Left Column: Cart Items */}
        <div className="lg:col-span-8 space-y-6">
          
          {cart.length === 0 ? (
            <div className="bg-sf-surface-container-lowest border border-sf-surface-container-high rounded-xl p-12 text-center">
              <span className="material-symbols-outlined text-[48px] text-sf-on-surface-variant mb-4">production_quantity_limits</span>
              <h3 className="font-sf-display text-sf-headline-md text-sf-primary mb-2">Giỏ hàng trống</h3>
              <p className="font-sf-body text-sf-body-md text-sf-on-surface-variant mb-6">Bạn chưa chọn sản phẩm nào.</p>
              <Link href="/storefront" className="inline-block bg-sf-primary text-sf-on-primary px-6 py-3 rounded-full font-sf-body text-sf-label-caps hover:bg-sf-surface-tint transition-colors">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="bg-sf-surface-container-lowest border border-sf-surface-container-high rounded-xl overflow-hidden shadow-sm">
              {/* Table Header (Hidden on Mobile) */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-sf-surface-container-high bg-sf-surface-container-low/50 font-sf-body text-sf-label-caps text-sf-on-surface-variant uppercase">
                <div className="col-span-6">Sản phẩm</div>
                <div className="col-span-2 text-right">Đơn giá</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Thành tiền</div>
              </div>

              {/* Item Loop */}
              {cart.map((item) => (
                <div key={item.productId} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 border-b border-sf-surface-container-high items-center hover:bg-sf-surface-container-low transition-colors group relative">
                  <div className="md:col-span-6 flex gap-4 items-center">
                    <div className="w-24 h-24 bg-sf-surface-container-high rounded-lg overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <img className="w-full h-full object-cover" src={item.imageUrl} alt={item.productName} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-sf-surface-dim">image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-sf-display text-[18px] leading-tight text-sf-primary mb-1">{item.productName}</h3>
                      <p className="font-sf-body text-[14px] text-sf-on-surface-variant">{item.categoryName || "Sản phẩm"}</p>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 text-right font-sf-body text-sf-body-md hidden md:block">
                    {item.price.toLocaleString("vi-VN")} ₫
                  </div>
                  
                  <div className="md:col-span-2 flex justify-between md:justify-center items-center mt-4 md:mt-0">
                    <span className="md:hidden font-sf-body text-sf-body-md text-sf-on-surface-variant">{item.price.toLocaleString("vi-VN")} ₫</span>
                    <div className="flex items-center border border-sf-outline-variant rounded-full bg-sf-surface-container-lowest">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} aria-label="Decrease quantity" className="w-8 h-8 flex items-center justify-center text-sf-on-surface-variant hover:text-sf-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="w-6 text-center font-sf-body text-[14px]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} aria-label="Increase quantity" className="w-8 h-8 flex items-center justify-center text-sf-on-surface-variant hover:text-sf-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 flex justify-between md:justify-end items-center mt-4 md:mt-0">
                    <span className="md:hidden font-sf-body text-sf-label-caps text-sf-on-surface-variant uppercase">Tổng:</span>
                    <span className="font-sf-display text-[18px] text-sf-primary font-bold">{(item.price * item.quantity).toLocaleString("vi-VN")} ₫</span>
                  </div>
                  
                  <button onClick={() => removeFromCart(item.productId)} aria-label="Remove item" className="absolute top-4 right-4 md:relative md:top-auto md:right-auto md:col-span-12 md:flex md:justify-end md:-mt-8 text-sf-on-surface-variant hover:text-sf-error transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-sf-surface-container-lowest border border-sf-surface-container-high rounded-xl p-6 md:p-8 sticky top-[120px]">
            <h2 className="font-sf-display text-sf-headline-md text-sf-primary mb-6 border-b border-sf-surface-container-high pb-4">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-sf-body text-sf-body-md text-sf-on-surface-variant">Tạm tính</span>
                <span className="font-sf-body text-sf-body-md text-sf-primary font-medium">{cartTotal.toLocaleString("vi-VN")} ₫</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-sf-body text-sf-body-md text-sf-on-surface-variant">Phí vận chuyển</span>
                <span className="font-sf-body text-sf-body-md text-sf-primary font-medium">Calculated at checkout</span>
              </div>
            </div>
            
            {/* Discount Code */}
            <div className="mb-6 pt-4 border-t border-sf-surface-container-high">
              <label className="block font-sf-body text-sf-label-caps text-sf-on-surface-variant mb-2 uppercase" htmlFor="discount-code">Mã giảm giá</label>
              <div className="flex gap-2">
                <input className="w-full bg-sf-surface-container-lowest border-b border-sf-outline-variant focus:border-sf-primary focus:ring-0 px-0 py-2 font-sf-body text-sf-body-md text-sf-primary placeholder:text-sf-surface-dim transition-colors rounded-none shadow-none outline-none" id="discount-code" placeholder="Nhập mã..." type="text"/>
                <button className="text-sf-secondary-container hover:text-sf-secondary font-sf-body text-sf-label-caps whitespace-nowrap transition-colors border border-sf-secondary-container rounded px-4 uppercase">Áp dụng</button>
              </div>
            </div>
            
            {/* Total */}
            <div className="flex justify-between items-end mb-8 pt-4 border-t border-sf-surface-container-high">
              <span className="font-sf-display text-[18px] text-sf-primary font-bold">Tổng cộng</span>
              <span className="font-sf-display text-[32px] md:text-[36px] leading-none text-sf-primary font-bold">{cartTotal.toLocaleString("vi-VN")} ₫</span>
            </div>
            
            {/* Checkout CTA */}
            <Link href="/storefront/checkout" className={`w-full bg-sf-secondary-container text-sf-on-secondary-container hover:bg-sf-secondary hover:text-sf-on-secondary transition-colors py-4 rounded-full font-sf-body text-sf-label-caps tracking-wider flex items-center justify-center gap-2 group uppercase ${cart.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              Tiến hành thanh toán
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <p className="font-sf-body text-[12px] text-center text-sf-on-surface-variant mt-4">Taxes and shipping calculated at checkout.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
