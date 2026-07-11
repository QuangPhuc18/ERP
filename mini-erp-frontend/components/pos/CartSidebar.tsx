import React from "react";
import { IClose, IPlus, IUser, IChevron, IMinus, ISpin, ICheck } from "../shared/Icons";
import { CartItem, PosTab, Customer } from "../../types/pos.types";

interface CartSidebarProps {
  isMobileCartOpen: boolean;
  setIsMobileCartOpen: (val: boolean) => void;
  cart: CartItem[];
  tabs: PosTab[];
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  tabsContainerRef: React.RefObject<HTMLDivElement | null>;
  setTabs: React.Dispatch<React.SetStateAction<PosTab[]>>;
  tabCounter: number;
  setTabCounter: React.Dispatch<React.SetStateAction<number>>;
  orderNum: number;
  setShowCustModal: (val: boolean) => void;
  selectedCustomer: Customer | null;
  updateQty: (id: number, delta: number, unitId?: number | null) => void;
  updateUnit: (id: number, oldUnitId: number | null | undefined, newUnitId: number) => void;
  removeItem: (id: number, unitId?: number | null) => void;
  subtotal: number;
  totalAmount: number;
  handleOpenCheckout: () => void;
  isProcessing: boolean;
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

export const CartSidebar: React.FC<CartSidebarProps> = ({
  isMobileCartOpen, setIsMobileCartOpen, cart, tabs, activeTabId, setActiveTabId,
  tabsContainerRef, setTabs, tabCounter, setTabCounter, orderNum, setShowCustModal,
  selectedCustomer, updateQty, updateUnit, removeItem, subtotal, totalAmount, handleOpenCheckout, isProcessing
}) => {
  const handleTabScroll = (e: React.WheelEvent) => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <>
      {!isMobileCartOpen && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-30">
          <button onClick={() => setIsMobileCartOpen(true)} className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-2xl shadow-orange-500/40 flex items-center justify-between px-6 font-black transition-all">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">shopping_cart</span>
              <span>{cart.length} món</span>
            </div>
            <span className="text-xl">{fmt(totalAmount)}</span>
          </button>
        </div>
      )}

      {isMobileCartOpen && (<div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setIsMobileCartOpen(false)} />)}

      <div className={`fixed inset-y-0 right-0 z-50 w-full lg:w-[360px] bg-white border-l border-gray-200 flex flex-col shadow-2xl lg:shadow-xl transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        <div className="lg:hidden h-14 bg-white border-b border-gray-100 flex items-center px-2 shrink-0">
          <button onClick={() => setIsMobileCartOpen(false)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><span className="material-symbols-outlined text-[24px]">arrow_back</span></button>
          <span className="font-black text-gray-800 text-lg ml-2">Giỏ hàng</span>
        </div>

        <div className="flex bg-[#F5F6FA] shrink-0 border-b border-gray-100 p-2 gap-2">
          <div ref={tabsContainerRef} onWheel={handleTabScroll} className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden flex gap-2 scroll-smooth">
            {tabs.map((tab) => (
              <div key={tab.id} data-active={activeTabId === tab.id} onClick={() => setActiveTabId(tab.id)} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-bold cursor-pointer transition-all duration-300 whitespace-nowrap select-none ${activeTabId === tab.id ? "bg-white text-gray-900 shadow-sm border border-gray-200/60" : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-700"}`}>
                Hóa đơn {tab.id}
                {tabs.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); const newTabs = tabs.filter(t => t.id !== tab.id); setTabs(newTabs); if (activeTabId === tab.id) setActiveTabId(newTabs[newTabs.length - 1].id); }} className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"><IClose /></button>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => { const newId = String(tabCounter); setTabs([...tabs, { id: newId, cart: [], discountValue: "", discountType: "pct", note: "", selectedCustomer: null }]); setActiveTabId(newId); setTabCounter(c => c + 1); }} className="flex items-center justify-center w-9 h-9 shrink-0 rounded-[14px] bg-white border border-gray-200/60 text-gray-500 hover:text-orange-600 hover:border-orange-300 hover:shadow-sm transition-all"><IPlus /></button>
        </div>

        <div className="h-16 px-6 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white z-10 shadow-sm">
          <span className="text-sm font-black text-gray-900 flex items-center gap-2 tracking-tight">
            <span className="material-symbols-outlined text-orange-500 text-[20px]">receipt_long</span> 
            Đơn <span className="text-orange-500">#{`POS01-${String(new Date().getDate()).padStart(2, '0')}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(orderNum).padStart(4, "0")}`}</span>
          </span>
          <button onClick={() => setShowCustModal(true)} className={`flex items-center gap-1.5 text-[13px] font-bold bg-gray-50/80 border shadow-sm px-3 py-2 rounded-xl transition-all duration-300 ${selectedCustomer ? 'border-emerald-400 text-emerald-700 hover:bg-emerald-50' : 'border-gray-200/60 text-gray-600 hover:border-gray-300 hover:bg-white'}`}>
            <IUser /> <span className="max-w-[120px] truncate">{selectedCustomer ? selectedCustomer.fullName : "Khách lẻ"}</span> <IChevron />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 bg-[#F5F6FA] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400"><div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-gray-300">shopping_cart</span></div><p className="text-sm font-semibold tracking-wide">Giỏ hàng trống</p></div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 px-4 py-4 rounded-[20px] border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all group">
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-gray-900 truncate tracking-tight">{item.productName}</p>
                    <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{item.productCode}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center bg-gray-50/50 border border-gray-200/60 rounded-xl overflow-hidden p-0.5">
                        <button onClick={() => updateQty(item.id, -1, item.selectedUnitId)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"><IMinus /></button>
                        <span className="text-[13px] font-black text-gray-900 w-8 text-center flex items-center justify-center tabular-nums">{item.cartQuantity}</span>
                        <button onClick={() => updateQty(item.id, 1, item.selectedUnitId)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"><IPlus /></button>
                      </div>
                      
                      {/* Unit Selection Dropdown */}
                      {((item.productUoMs && item.productUoMs.length > 0) || item.unitId) && (
                        <select 
                          className="h-9 px-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 outline-none"
                          value={item.selectedUnitId || item.unitId || ""}
                          onChange={(e) => updateUnit(item.id, item.selectedUnitId || undefined, Number(e.target.value))}
                        >
                          <option value={item.unitId || ""}>{item.unitName || "ĐV Cơ bản"}</option>
                          {item.productUoMs?.map(u => (
                            <option key={u.unitId} value={u.unitId}>{u.unitName}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between"><button onClick={() => removeItem(item.id, item.selectedUnitId)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><IClose /></button><span className="text-[16px] font-black text-gray-900 tracking-tight">{fmt((item.selectedPrice ?? item.price) * item.cartQuantity)}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-6 bg-white shrink-0 z-20 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
          <div className="space-y-3 text-sm bg-gray-50/80 p-5 rounded-2xl border border-gray-100 mb-5">
            <div className="flex justify-between"><span className="text-gray-500 font-semibold tracking-wide">Tổng hàng</span><span className="text-gray-900 font-bold">{fmt(Math.round(subtotal))}</span></div>
            <div className="flex justify-between items-center pt-4 mt-3 border-t border-dashed border-gray-200"><span className="text-[13px] font-bold text-gray-500 tracking-widest uppercase">Tổng cộng</span><span className="text-2xl font-black text-orange-500 tracking-tight">{fmt(totalAmount)}</span></div>
          </div>
          <button onClick={handleOpenCheckout} disabled={cart.length === 0 || isProcessing} className="w-full h-14 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] disabled:bg-gray-100 disabled:text-gray-400 disabled:scale-100 text-white rounded-2xl text-[15px] font-black flex items-center justify-center gap-2 transition-all duration-300 shadow-xl shadow-orange-500/20 disabled:shadow-none tracking-wide">{isProcessing ? <><ISpin /> ĐANG XỬ LÝ...</> : <><ICheck /> THANH TOÁN</>}</button>
        </div>
      </div>
    </>
  );
};
