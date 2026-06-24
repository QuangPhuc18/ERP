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

  return (
    <div className="flex h-screen bg-[#F5F6FA] overflow-hidden relative">
      
      {/* ════════ LEFT: PRODUCT AREA ════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar 
          currentTime={state.currentTime}
          searchQuery={state.searchQuery}
          setSearchQuery={state.setSearchQuery}
          setShowEndShiftModal={state.setShowEndShiftModal}
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

      {/* ════════ RIGHT: CART AREA ════════ */}
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
        removeItem={state.removeItem}
        subtotal={state.subtotal}
        totalAmount={state.totalAmount}
        handleOpenCheckout={state.handleOpenCheckout}
        isProcessing={state.isProcessing}
      />

      {/* ════════ MODALS ════════ */}
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
        handleCheckout={state.handleCheckout}
        isProcessing={state.isProcessing}
        completedOrder={state.completedOrder}
        setCompletedOrder={state.setCompletedOrder}
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
          employeeName={typeof window !== "undefined" ? localStorage.getItem("user_name") || "Nhân viên" : "Nhân viên"}
          onShiftStarted={(shift) => {
            state.setCurrentShift(shift);
            state.setShowStartShiftModal(false);
          }}
        />
      )}

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