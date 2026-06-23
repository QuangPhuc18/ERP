"use client";

import React, { useState, useEffect, useCallback } from "react";
import httpAxios from "../../services/httpAxios";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface Product {
  id: number;
  productCode: string;
  productName: string;
  price: number;
  quantity: number;
  categoryName?: string;
  imageUrl?: string;
}

interface CartItem extends Product {
  cartQuantity: number;
}

interface Customer {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
}

type DiscountType = "pct" | "amt";
type PaymentMethod = "cash" | "transfer" | "card";

interface PosTab {
  id: string;
  cart: CartItem[];
  discountValue: string;
  discountType: DiscountType;
  note: string;
  selectedCustomer: Customer | null;
}

// ─────────────────────────────────────────────
// HELPERS & ICONS
// ─────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d={d} /></svg>
);
const ISearch   = () => <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />;
const IPlus     = () => <Icon d="M12 4v16m8-8H4" size={14} />;
const IMinus    = () => <Icon d="M20 12H4" size={12} />;
const IClose    = () => <Icon d="M6 18L18 6M6 6l12 12" size={12} />;
const IBag      = () => <Icon d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" size={40} />;
const ICheck    = () => <Icon d="M5 13l4 4L19 7" />;
const IUser     = () => <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" size={14} />;
const IChevron  = () => <Icon d="M19 9l-7 7-7-7" size={12} />;
const ISpin     = () => (
  <svg className="animate-spin" width={16} height={16} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function POSPage() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  // Quản lý Tabs
  const [tabs, setTabs] = useState<PosTab[]>([{
    id: "1", cart: [], discountValue: "", discountType: "pct", note: "", selectedCustomer: null
  }]);
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const [tabCounter, setTabCounter] = useState(2);
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeEl = tabsContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTabId, tabs.length]);

  const handleTabScroll = (e: React.WheelEvent) => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const { cart, discountValue, discountType, note, selectedCustomer } = activeTab;

  const updateActiveTab = (updates: Partial<PosTab>) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  const setCart = (action: React.SetStateAction<CartItem[]>) => {
    setTabs(prevTabs => prevTabs.map(t => {
      if (t.id === activeTabId) {
        const newCart = typeof action === 'function' ? (action as Function)(t.cart) : action;
        return { ...t, cart: newCart };
      }
      return t;
    }));
  };

  const setDiscountValue = (val: string) => updateActiveTab({ discountValue: val });
  const setDiscountType = (val: DiscountType) => updateActiveTab({ discountType: val });
  const setNote = (val: string) => updateActiveTab({ note: val });
  const setSelectedCustomer = (val: Customer | null) => updateActiveTab({ selectedCustomer: val });
  
  // Lọc & Phân trang
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6; 

  const [currentTime, setCurrentTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [orderNum, setOrderNum]       = useState(1);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [amountPaidStr, setAmountPaidStr] = useState("");
  const [completedOrder, setCompletedOrder] = useState<Record<string, any> | null>(null);

  // Tính năng Đóng ca
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [shiftSummary, setShiftSummary] = useState({
    cash: 0,
    transfer: 0,
    card: 0,
    debt: 0,
    totalItems: 0,
    orderCount: 0
  });

  // Store config (can be updated later by a settings page)
  const storeInfo = {
    name: "Tạp Hóa NexERP",
    address: "123 Đường Bán Lẻ, Quận Trung Tâm, TP.HCM",
    phone: "0909 123 456",
    logo: "storefront" // Material icon name
  };

  // Quản lý Khách hàng
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustModal, setShowCustModal] = useState(false);
  const [custSearchQuery, setCustSearchQuery] = useState("");
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");

  const categories = ["Tất cả", ...Array.from(new Set(products.map(p => p.categoryName).filter(Boolean) as string[]))];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString("vi-VN", { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await httpAxios.get("/Products");
      setProducts(res.data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await httpAxios.get("/Customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Lỗi tải danh sách khách hàng:", err);
    }
  }, []);

  useEffect(() => { 
    fetchProducts(); 
    fetchCustomers();
  }, [fetchProducts, fetchCustomers]);

  useEffect(() => { 
    setCurrentPage(1); 
  }, [searchQuery, activeCategory]);

  const subtotal       = cart.reduce((s, i) => s + i.price * i.cartQuantity, 0);
  const discVal        = parseFloat(discountValue) || 0;
  const discountAmount = discountType === "pct" ? subtotal * (discVal / 100) : Math.min(discVal, subtotal);
  const totalAmount    = Math.round(subtotal - discountAmount);

  const handleOpenCheckout = () => {
    if (!cart.length) return alert("Giỏ hàng đang trống!");
    setAmountPaidStr(totalAmount.toString());
    setShowCheckoutModal(true);
  };

  const handleCheckout = useCallback(async () => {
    setIsProcessing(true);
    const amountPaid = parseInt(amountPaidStr || "0", 10);
    try {
      await httpAxios.post("/Orders", {
        customerId: selectedCustomer ? selectedCustomer.id : null,
        totalAmount,
        amountPaid,
        paymentMethod,
        note,
        details: cart.map((c) => ({
          productId: c.id,
          quantity: c.cartQuantity,
          unitPrice: c.price,
        })),
      });

      const today = new Date();
      const ddmm = String(today.getDate()).padStart(2, '0') + String(today.getMonth() + 1).padStart(2, '0');
      const generatedOrderCode = `POS01-${ddmm}-${String(orderNum).padStart(4, "0")}`;

      // Update shift summary
      setShiftSummary(prev => {
        let { cash, transfer, card, debt } = prev;
        const paid = Math.min(amountPaid, totalAmount);
        const debtAmt = Math.max(0, totalAmount - amountPaid);
        if (paymentMethod === "cash") cash += paid;
        if (paymentMethod === "transfer") transfer += paid;
        if (paymentMethod === "card") card += paid;
        debt += debtAmt;
        const items = cart.reduce((s, i) => s + i.cartQuantity, 0);
        return { cash, transfer, card, debt, totalItems: prev.totalItems + items, orderCount: prev.orderCount + 1 };
      });

      const orderData = {
        orderNum: generatedOrderCode,
        cart: [...cart],
        subtotal,
        discountAmount,
        totalAmount,
        amountPaid,
        customer: selectedCustomer,
        date: new Date().toLocaleString("vi-VN", { hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric' })
      };
      
      setCompletedOrder(orderData);
      
      setTabs(prev => {
        if (prev.length > 1) {
          const nextTabs = prev.filter(t => t.id !== activeTabId);
          setActiveTabId(nextTabs[nextTabs.length - 1].id);
          return nextTabs;
        } else {
          return [{ id: String(tabCounter), cart: [], discountValue: "", discountType: "pct", note: "", selectedCustomer: null }];
        }
      });
      if (tabs.length <= 1) setTabCounter(c => c + 1);

      setAmountPaidStr("");
      setOrderNum((n) => n + 1);
      setShowCheckoutModal(false);
      fetchProducts();
    } catch (error) {
      const err = error as { response?: { data?: string }; message?: string };
      alert(`Lỗi: ${err.response?.data || err.message || "Lỗi không xác định"}`);
    } finally {
      setIsProcessing(false);
    }
  }, [cart, totalAmount, amountPaidStr, paymentMethod, note, selectedCustomer, fetchProducts, orderNum, tabCounter, activeTabId, tabs.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !(e.target as HTMLElement).tagName.match(/INPUT|TEXTAREA/i) && !showCheckoutModal) handleOpenCheckout();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cart, totalAmount, showCheckoutModal]);

  const handleAddQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return alert("Vui lòng điền đủ Tên và Số điện thoại!");

    try {
      const res = await httpAxios.post("/Customers", {
        customerCode: `KH-${newCustPhone}`,
        fullName: newCustName,
        phone: newCustPhone,
        email: `${newCustPhone}@pos.com`,
        address: "Khách đăng ký tại quầy"
      });

      alert("🎉 Đăng ký thẻ thành viên thành công!");
      await fetchCustomers();
      setSelectedCustomer(res.data);
      setNewCustName("");
      setNewCustPhone("");
      setShowCustModal(false);
    } catch (error) {
      const err = error as { response?: { data?: string } };
      alert(`Lỗi đăng ký: ${err.response?.data || "Số điện thoại có thể đã tồn tại!"}`);
    }
  };

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) return alert("Sản phẩm đã hết hàng!");
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.quantity) return prev;
        return prev.map((i) => i.id === product.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
          if (item.id !== id) return item;
          const newQty = item.cartQuantity + delta;
          if (newQty > item.quantity) return item;
          return { ...item, cartQuantity: Math.max(0, newQty) };
        }).filter((item) => item.cartQuantity > 0)
    );
  };

  const removeItem = (id: number) => setCart((prev) => prev.filter((i) => i.id !== id));

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === "Tất cả" || p.categoryName === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchQ = !q || p.productName.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="flex h-screen bg-[#F5F6FA] overflow-hidden -m-6 relative">
      
      {/* ════════ LEFT: PRODUCT AREA ════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Topbar */}
        <div className="h-auto lg:h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 p-5 lg:px-8 shrink-0 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="font-extrabold text-gray-900 text-2xl tracking-tight">NexERP POS</span>
              <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-orange-100/50">Quầy #01</span>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <button onClick={() => setShowEndShiftModal(true)} className="p-2 bg-gray-900 text-white rounded-lg"><span className="material-symbols-outlined text-[18px] block">lock_clock</span></button>
              <span className="text-sm font-semibold text-gray-400 tabular-nums bg-gray-50/50 px-3 py-1.5 rounded-lg border border-gray-100/50">{currentTime}</span>
            </div>
          </div>
          <div className="flex-1 lg:px-12">
            <label className="relative flex w-full max-w-2xl group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors"><ISearch /></span>
              <input 
                type="text" 
                placeholder="Tìm tên sản phẩm, mã SKU..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full h-12 pl-12 pr-4 bg-gray-50/80 border border-gray-200/60 rounded-2xl text-sm font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 transition-all shadow-sm placeholder:text-gray-400" 
              />
            </label>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-500 tabular-nums bg-gray-50/80 px-4 py-2 rounded-xl border border-gray-100">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
              {currentTime}
            </span>
            <button onClick={() => setShowEndShiftModal(true)} className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 tracking-wide">
              <span className="material-symbols-outlined text-[18px]">lock_clock</span> ĐÓNG CA
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 px-6 lg:px-8 py-4 bg-[#F5F6FA] overflow-x-auto shrink-0 z-10 [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeCategory === cat ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25 ring-1 ring-orange-500/50 scale-105" : "bg-white text-gray-500 border border-gray-200/60 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-6 flex flex-col [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded">
          {loading ? (
            <div className="flex-1 flex items-center justify-center gap-2 text-gray-400 text-sm"><ISpin /> Đang tải dữ liệu sản phẩm...</div>
          ) : currentProducts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
              <span className="material-symbols-outlined text-5xl opacity-50">search_off</span>
              <p className="text-sm font-medium">Không tìm thấy sản phẩm nào phù hợp</p>
            </div>
          ) : (
            <>
              {/* 🎯 LƯỚI SẢN PHẨM */}
              <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] 2xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 sm:gap-6">
                {currentProducts.map((p) => {
                  const outOfStock = p.quantity <= 0;
                  return (
                    <div key={p.id} onClick={() => !outOfStock && addToCart(p)} className={`bg-white rounded-[24px] p-3 sm:p-5 flex flex-row sm:flex-col items-center sm:items-stretch gap-4 sm:gap-5 relative transition-all duration-300 select-none group ${outOfStock ? "opacity-50 grayscale cursor-not-allowed border border-gray-100" : "border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 cursor-pointer hover:-translate-y-1"}`}>
                      {outOfStock && <span className="absolute top-3 left-3 text-[10px] font-black bg-gray-900 text-white px-2.5 py-1 rounded-md z-10 shadow-sm tracking-widest">HẾT HÀNG</span>}
                      
                      <div className="w-24 h-24 sm:w-full sm:h-48 shrink-0 bg-gray-50/80 rounded-[18px] flex items-center justify-center overflow-hidden p-3 relative group-hover:bg-orange-50/50 transition-colors">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.productName} className="object-contain h-full w-full group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" />
                        ) : (
                          <span className="material-symbols-outlined text-3xl sm:text-4xl text-gray-300">image</span>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <p className="text-[14px] sm:text-[16px] font-bold text-gray-900 leading-snug line-clamp-2 sm:min-h-[44px] group-hover:text-orange-600 transition-colors tracking-tight">{p.productName}</p>
                        <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1.5 uppercase tracking-widest font-bold">SKU: {p.productCode}</p>
                        
                        <div className="flex items-center justify-between sm:mt-auto sm:pt-4 sm:border-t sm:border-gray-100/50 mt-3">
                          <span className="text-[16px] sm:text-[18px] font-black text-gray-900 tracking-tight">{fmt(p.price)}</span>
                          <button disabled={outOfStock} className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${outOfStock ? "bg-gray-100 text-gray-300" : "bg-gray-50 text-gray-900 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-orange-500/30 group-active:scale-95"}`}><IPlus /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-auto pt-8 pb-2 shrink-0">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-orange-300 hover:text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <div className="flex gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-xl text-sm font-black transition-all shadow-sm ${currentPage === page ? "bg-orange-500 text-white border-orange-500 shadow-orange-200" : "bg-white border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500"}`}>
                        {page}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-orange-300 hover:text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        
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
      </div>

      {/* ════════ RIGHT: CART + CHECKOUT ════════ */}
      {isMobileCartOpen && (<div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setIsMobileCartOpen(false)} />)}

      <div className={`fixed inset-y-0 right-0 z-50 w-full lg:w-[360px] bg-white border-l border-gray-200 flex flex-col shadow-2xl lg:shadow-xl transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        <div className="lg:hidden h-14 bg-white border-b border-gray-100 flex items-center px-2 shrink-0">
          <button onClick={() => setIsMobileCartOpen(false)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><span className="material-symbols-outlined text-[24px]">arrow_back</span></button>
          <span className="font-black text-gray-800 text-lg ml-2">Giỏ hàng</span>
        </div>

        <div className="flex bg-[#F5F6FA] shrink-0 border-b border-gray-100 p-2 gap-2">
          <div ref={tabsContainerRef} onWheel={handleTabScroll} className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden flex gap-2 scroll-smooth">
            {tabs.map((tab) => (
              <div key={tab.id} data-active={activeTabId === tab.id} onClick={() => setActiveTabId(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-bold cursor-pointer transition-all duration-300 whitespace-nowrap select-none ${activeTabId === tab.id ? "bg-white text-gray-900 shadow-sm border border-gray-200/60" : "text-gray-500 hover:bg-gray-200/50 hover:text-gray-700"}`}>
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
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex items-center bg-gray-50/50 border border-gray-200/60 rounded-xl overflow-hidden p-0.5">
                        <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"><IMinus /></button>
                        <span className="text-[13px] font-black text-gray-900 w-8 text-center flex items-center justify-center tabular-nums">{item.cartQuantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"><IPlus /></button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between"><button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><IClose /></button><span className="text-[16px] font-black text-gray-900 tracking-tight">{fmt(item.price * item.cartQuantity)}</span></div>
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
                <div><label className="block text-sm font-bold text-gray-500 mb-3 tracking-wide uppercase">Ghi chú</label><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nhập ghi chú cho nhà bếp hoặc thu ngân..." className="w-full h-32 p-4 bg-white border border-gray-200/60 rounded-[20px] text-[15px] outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all resize-none shadow-sm placeholder:text-gray-400 font-medium"></textarea></div>
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

      {showCustModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-8"><h3 className="font-extrabold text-gray-900 text-2xl tracking-tight flex items-center gap-3"><span className="material-symbols-outlined text-orange-500 text-3xl">how_to_reg</span> Khách hàng</h3><button onClick={() => setShowCustModal(false)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"><IClose /></button></div>
            <div className="relative mb-6"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><ISearch /></span><input type="text" placeholder="Gõ tên hoặc SĐT để tìm..." value={custSearchQuery} onChange={(e) => setCustSearchQuery(e.target.value)} className="w-full h-14 pl-12 pr-4 bg-gray-50/80 border border-gray-200/60 rounded-2xl text-[15px] outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 transition-all shadow-sm font-medium" /></div>
            <div className="flex-1 overflow-y-auto mb-6 border border-gray-100 rounded-[20px] max-h-56 divide-y divide-gray-50 bg-[#F5F6FA]">
              {customers.length === 0 ? <p className="text-center text-gray-400 text-sm py-10 font-semibold tracking-wide">Chưa có dữ liệu</p> : customers.filter(c => c.fullName.toLowerCase().includes(custSearchQuery.toLowerCase()) || c.phone.includes(custSearchQuery)).map(c => <div key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustModal(false); }} className="p-4 mx-2 my-2 bg-white rounded-xl cursor-pointer hover:border-orange-500 border border-transparent shadow-sm hover:shadow-md hover:shadow-orange-500/10 transition-all flex justify-between items-center group"><div><p className="font-bold text-gray-900 text-[15px]">{c.fullName}</p><p className="text-[13px] text-gray-500 mt-1 font-medium"><span className="material-symbols-outlined text-[14px] align-text-bottom mr-1 text-gray-400">call</span>{c.phone}</p></div><span className="text-xs text-orange-600 font-bold opacity-0 group-hover:opacity-100 bg-orange-50 px-3 py-1.5 rounded-lg transition-all">Chọn</span></div>)}
            </div>
            {selectedCustomer && (<button onClick={() => { setSelectedCustomer(null); setShowCustModal(false); }} className="w-full p-3 mb-6 text-sm text-center text-red-500 hover:bg-red-50 font-bold rounded-[16px] border border-red-100 border-dashed transition-colors">✕ Hủy chọn</button>)}
            <div className="flex items-center gap-4 mb-6 opacity-60"><div className="h-px bg-gray-300 flex-1"></div><span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Đăng ký mới</span><div className="h-px bg-gray-300 flex-1"></div></div>
            <form onSubmit={handleAddQuickCustomer} className="space-y-5 bg-white p-6 rounded-[24px] border border-gray-200/60 shadow-sm">
              <div><label className="block text-[11px] font-black text-gray-500 uppercase mb-2 tracking-widest">Tên khách hàng</label><input type="text" placeholder="Nguyễn Văn A" value={newCustName} onChange={(e) => setNewCustName(e.target.value)} className="w-full h-12 px-4 text-[15px] border border-gray-200/60 bg-gray-50/80 rounded-xl outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all" /></div>
              <div><label className="block text-[11px] font-black text-gray-500 uppercase mb-2 tracking-widest">Số điện thoại <span className="text-red-500">*</span></label><input type="text" placeholder="0901234567" value={newCustPhone} onChange={(e) => setNewCustPhone(e.target.value)} className="w-full h-12 px-4 text-[15px] border border-gray-200/60 bg-gray-50/80 rounded-xl outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all" /></div>
              <button type="submit" className="w-full h-14 mt-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-black text-[15px] rounded-[16px] transition-all duration-300 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[20px]">person_add</span> TẠO THẺ & CHỌN</button>
            </form>
          </div>
        </div>
      )}

      {completedOrder && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in no-print">
          <div className="bg-gray-100 rounded-[32px] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl relative">
            <div className="p-6 pb-0 flex flex-col items-center"><div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4"><span className="material-symbols-outlined text-4xl">check_circle</span></div><h2 className="text-xl font-black text-gray-900 mb-2">Thanh toán thành công!</h2><p className="text-sm text-gray-500 font-medium mb-6">Đơn hàng #{completedOrder.orderNum}</p></div>
            <div className="bg-white mx-6 p-6 shadow-sm border border-gray-200/60 rounded-t-2xl border-b-0 relative"><div className="absolute top-0 left-0 w-full h-2 -translate-y-1/2 flex justify-around overflow-hidden">{Array.from({length: 12}).map((_, i) => <div key={i} className="w-2 h-2 bg-gray-100 rounded-full"></div>)}</div><div className="text-center mb-4"><p className="font-bold text-gray-800 text-lg">{storeInfo.name}</p><p className="text-xs text-gray-500">{storeInfo.address}</p></div><div className="border-t border-dashed border-gray-300 py-3 mb-3"><div className="flex justify-between text-sm font-bold"><span className="text-gray-500">Tổng cộng:</span><span>{fmt(completedOrder.totalAmount)}</span></div><div className="flex justify-between text-sm font-bold"><span className="text-gray-500">Khách đưa:</span><span>{fmt(completedOrder.amountPaid)}</span></div></div></div>
            <div className="p-6 bg-white border-t border-gray-100/50 pt-4 flex gap-3"><button onClick={() => window.print()} className="flex-1 py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"><span className="material-symbols-outlined text-[20px]">print</span> IN BILL</button><button onClick={() => setCompletedOrder(null)} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">ĐÓNG</button></div>
          </div>
        </div>
      )}

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
                <div className="w-1/2 pr-1">{item.productName}</div>
                <div className="w-1/4 text-center">{item.cartQuantity}</div>
                <div className="w-1/4 text-right">{fmt(item.price * item.cartQuantity).replace('đ','')}</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] mb-4 border-b border-dashed border-black pb-3 space-y-1"><div className="flex justify-between"><span>Cộng tiền hàng:</span> <span>{fmt(completedOrder.subtotal)}</span></div>{completedOrder.discountAmount > 0 && <div className="flex justify-between"><span>Chiết khấu:</span> <span>-{fmt(completedOrder.discountAmount)}</span></div>}<div className="flex justify-between font-bold text-[14px] mt-1 pt-1 border-t border-black"><span>TỔNG CỘNG:</span> <span>{fmt(completedOrder.totalAmount)}</span></div><div className="flex justify-between mt-2"><span>Khách thanh toán:</span> <span>{fmt(completedOrder.amountPaid)}</span></div><div className="flex justify-between"><span>Tiền thừa/Ghi nợ:</span> <span>{fmt(Math.abs(completedOrder.amountPaid - completedOrder.totalAmount))}</span></div></div>
          <div className="text-center text-[11px] italic">Cảm ơn quý khách và hẹn gặp lại!</div>
        </div>
      )}

      {/* END SHIFT MODAL */}
      {showEndShiftModal && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in no-print">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden flex flex-col shadow-2xl relative">
            <div className="p-8 pb-6 border-b border-gray-100">
              <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400 text-3xl">lock_clock</span> Kết Ca
              </h2>
              <p className="text-sm text-gray-500 font-medium">Xác nhận doanh thu và đóng ca làm việc</p>
            </div>
            
            <div className="p-8 space-y-5 bg-[#F5F6FA]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Số đơn</p>
                  <p className="text-xl font-black text-gray-900">{shiftSummary.orderCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Số SP đã bán</p>
                  <p className="text-xl font-black text-gray-900">{shiftSummary.totalItems}</p>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-gray-200/60 shadow-sm space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500 flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">payments</span>Tiền mặt</span>
                  <span className="text-lg font-black text-emerald-600">{fmt(shiftSummary.cash)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500 flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">account_balance</span>Chuyển khoản</span>
                  <span className="text-lg font-black text-blue-600">{fmt(shiftSummary.transfer)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-500 flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">credit_card</span>Quẹt thẻ</span>
                  <span className="text-lg font-black text-purple-600">{fmt(shiftSummary.card)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-500 flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">history_edu</span>Công nợ</span>
                  <span className="text-lg font-black text-orange-600">{fmt(shiftSummary.debt)}</span>
                </div>
              </div>
              
              <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-sm flex justify-between items-center">
                <span className="text-[13px] font-bold tracking-widest uppercase opacity-80">Tổng doanh thu</span>
                <span className="text-2xl font-black tracking-tight">{fmt(shiftSummary.cash + shiftSummary.transfer + shiftSummary.card + shiftSummary.debt)}</span>
              </div>
            </div>

            <div className="p-6 bg-white flex gap-3">
              <button onClick={() => window.print()} className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20">
                <span className="material-symbols-outlined text-[20px]">print</span> IN & ĐÓNG CA
              </button>
              <button onClick={() => setShowEndShiftModal(false)} className="w-16 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE Z-REPORT */}
      {showEndShiftModal && (
        <div id="printable-zreport" className="hidden print:block w-[80mm] text-black bg-white p-2 font-mono text-[12px] leading-snug mx-auto">
          <div className="text-center mb-4">
            <div className="text-xl font-bold mb-1">{storeInfo.name}</div>
            <div className="text-[11px] mb-1">Đ/c: {storeInfo.address}</div>
            <div className="text-[11px]">SĐT: {storeInfo.phone}</div>
          </div>
          <div className="text-center text-lg font-bold mb-3 border-b border-dashed border-black pb-3">BÁO CÁO KẾT CA</div>
          <div className="text-[11px] mb-3 border-b border-dashed border-black pb-3 space-y-1">
            <div className="flex justify-between"><span>Thời gian in:</span> <span>{new Date().toLocaleString('vi-VN')}</span></div>
            <div className="flex justify-between"><span>Ca/Quầy:</span> <span>Máy #01</span></div>
            <div className="flex justify-between"><span>Tổng số đơn:</span> <span>{shiftSummary.orderCount}</span></div>
            <div className="flex justify-between"><span>Tổng SP đã bán:</span> <span>{shiftSummary.totalItems}</span></div>
          </div>
          <div className="text-[12px] mb-4 border-b border-dashed border-black pb-3 space-y-2">
            <div className="flex justify-between font-bold"><span>Tiền mặt:</span> <span>{fmt(shiftSummary.cash)}</span></div>
            <div className="flex justify-between"><span>Chuyển khoản:</span> <span>{fmt(shiftSummary.transfer)}</span></div>
            <div className="flex justify-between"><span>Quẹt thẻ:</span> <span>{fmt(shiftSummary.card)}</span></div>
            <div className="flex justify-between"><span>Công nợ:</span> <span>{fmt(shiftSummary.debt)}</span></div>
          </div>
          <div className="flex justify-between font-bold text-[14px] mt-1 mb-4 border-b border-dashed border-black pb-3">
            <span>TỔNG DOANH THU:</span> <span>{fmt(shiftSummary.cash + shiftSummary.transfer + shiftSummary.card + shiftSummary.debt)}</span>
          </div>
          <div className="text-center text-[11px] italic">Xác nhận thu ngân nộp đủ tiền<br/><br/><br/>______________________</div>
        </div>
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