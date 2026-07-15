"use client";

import React, { useEffect } from "react";
import { usePosState } from "../../../hooks/usePosState";
import { Topbar } from "../../../components/pos/Topbar";
import { ProductGrid } from "../../../components/pos/ProductGrid";
import { CartSidebar } from "../../../components/pos/CartSidebar";
import { CheckoutModal } from "../../../components/pos/CheckoutModal";
import { EndShiftModal } from "../../../components/pos/EndShiftModal";
import { CustomerModal } from "../../../components/pos/CustomerModal";
import StartShiftModal from "../../../components/pos/StartShiftModal";
import { OrderHistoryModal } from "../../../components/pos/OrderHistoryModal";
import signalRService from "../../services/SignalRService";

export default function POSPage() {
  const state = usePosState();

  // Store config (can be updated later by a settings page)
  const storeInfo = {
    name: "Tạp Hóa NexERP",
    address: "123 Đường Bán Lẻ, Quận Trung Tâm, TP.HCM",
    phone: "0909 123 456",
    logo: "storefront"
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !(e.target as HTMLElement).tagName.match(/INPUT|TEXTAREA/i) && !state.showCheckoutModal) {
        state.handleOpenCheckout();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.cart, state.totalAmount, state.showCheckoutModal]);

  // Kết nối SignalR khi mở POS
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      signalRService.startConnection(token);
    }

    // Lắng nghe sự kiện thanh toán thành công
    signalRService.on("PaymentReceived", (orderId: number, amount: number) => {
      console.log("🟢 PaymentReceived", orderId, amount);
      if (state.pendingPaymentOrder && state.pendingPaymentOrder.orderId === orderId) {
        state.handlePaymentSuccess();
      }
    });

    // Lắng nghe sự kiện tồn kho bị thay đổi (bởi người khác bán)
    signalRService.on("InventoryUpdated", () => {
      console.log("🟢 Tồn kho thay đổi -> Đang tải lại sản phẩm...");
      state.fetchProducts();
    });

    return () => {
      signalRService.off("PaymentReceived");
      signalRService.off("InventoryUpdated");
    };
  }, [state.pendingPaymentOrder, state.handlePaymentSuccess, state.fetchProducts]);

  return (
    <div className="flex h-screen bg-[#F5F6FA] overflow-hidden relative">
      
      {/* â•â•â•â•â•â•â•â• LEFT: PRODUCT AREA â•â•â•â•â•â•â•â• */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar 
          currentTime={state.currentTime}
          searchQuery={state.searchQuery}
          setSearchQuery={state.setSearchQuery}
          setShowEndShiftModal={state.setShowEndShiftModal}
          setShowOrderHistoryModal={state.setShowOrderHistoryModal}
        />

        <ProductGrid 
          loading={state.loading}
          categories={state.categories}
          activeCategory={state.activeCategory}
          setActiveCategory={state.setActiveCategory}
          currentProducts={state.currentProducts}
          addToCart={state.addToCart}
          totalPages={state.totalPages}
          currentPage={state.currentPage}
          setCurrentPage={state.setCurrentPage}
        />
      </div>

      {/* â•â•â•â•â•â•â•â• RIGHT: CART AREA â•â•â•â•â•â•â•â• */}
      <CartSidebar 
        isMobileCartOpen={state.isMobileCartOpen}
        setIsMobileCartOpen={state.setIsMobileCartOpen}
        cart={state.cart}
        tabs={state.tabs}
        activeTabId={state.activeTabId}
        setActiveTabId={state.setActiveTabId}
        tabsContainerRef={state.tabsContainerRef}
        setTabs={state.setTabs}
        tabCounter={state.tabCounter}
        setTabCounter={state.setTabCounter}
        orderNum={state.orderNum}
        setShowCustModal={state.setShowCustModal}
        selectedCustomer={state.selectedCustomer}
        updateQty={state.updateQty}
        updateUnit={state.updateUnit}
        removeItem={state.removeItem}
        subtotal={state.subtotal}
        totalAmount={state.totalAmount}
        handleOpenCheckout={state.handleOpenCheckout}
        isProcessing={state.isProcessing}
      />

      {/* â•â•â•â•â•â•â•â• MODALS â•â•â•â•â•â•â•â• */}
      <CheckoutModal 
        showCheckoutModal={state.showCheckoutModal}
        setShowCheckoutModal={state.setShowCheckoutModal}
        paymentMethod={state.paymentMethod}
        setPaymentMethod={state.setPaymentMethod}
        note={state.note}
        setNote={state.setNote}
        totalAmount={state.totalAmount}
        amountPaidStr={state.amountPaidStr}
        setAmountPaidStr={state.setAmountPaidStr}
        pointsUsed={state.pointsUsed}
        setPointsUsed={state.setPointsUsed}
        maxPointsCanUse={state.maxPointsCanUse}
        handleCheckout={state.handleCheckout}
        isProcessing={state.isProcessing}
        completedOrder={state.completedOrder}
        setCompletedOrder={state.setCompletedOrder}
        pendingPaymentOrder={state.pendingPaymentOrder}
        setPendingPaymentOrder={state.setPendingPaymentOrder}
        storeInfo={storeInfo}
      />

      <CustomerModal 
        showCustModal={state.showCustModal}
        setShowCustModal={state.setShowCustModal}
        custSearchQuery={state.custSearchQuery}
        setCustSearchQuery={state.setCustSearchQuery}
        customers={state.customers}
        setSelectedCustomer={state.setSelectedCustomer}
        selectedCustomer={state.selectedCustomer}
        newCustName={state.newCustName}
        setNewCustName={state.setNewCustName}
        newCustPhone={state.newCustPhone}
        setNewCustPhone={state.setNewCustPhone}
        handleAddQuickCustomer={state.handleAddQuickCustomer}
      />

      <EndShiftModal 
        showEndShiftModal={state.showEndShiftModal}
        setShowEndShiftModal={state.setShowEndShiftModal}
        shiftSummary={state.shiftSummary}
        storeInfo={storeInfo}
        currentShift={state.currentShift}
        setCurrentShift={state.setCurrentShift}
      />

      {state.showStartShiftModal && (
        <StartShiftModal 
          employeeName={typeof window !== "undefined" ? localStorage.getItem("user_name") || "NhÃ¢n viÃªn" : "NhÃ¢n viÃªn"}
          onShiftStarted={(shift) => {
            state.setCurrentShift(shift);
            state.setShowStartShiftModal(false);
          }}
        />
      )}

      <OrderHistoryModal
        showModal={state.showOrderHistoryModal}
        setShowModal={state.setShowOrderHistoryModal}
      />

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #printable-bill, #printable-bill *, #printable-zreport, #printable-zreport * { visibility: visible; }
          #printable-bill, #printable-zreport { position: absolute; left: 0; top: 0; width: 80mm; margin: 0; padding: 0; display: block !important; }
          .no-print { display: none !important; }
          @page { margin: 0; size: 80mm auto; }
        }
      `}} />
    </div>
  );
}
