import { useState, useEffect, useCallback, useRef } from "react";
import ProductService from "../app/services/ProductService";
import CustomerService from "../app/services/CustomerService";
import OrderService from "../app/services/OrderService";
import WorkShiftService, { WorkShiftDTO } from "../app/services/WorkShiftService";
import { Product, CartItem, Customer, PosTab, PaymentMethod, DiscountType } from "../types/pos.types";

export const usePosState = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Quản lý Tabs
  const [tabs, setTabs] = useState<PosTab[]>([{
    id: "1", cart: [], discountValue: "", discountType: "pct", note: "", selectedCustomer: null
  }]);
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const [tabCounter, setTabCounter] = useState(2);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

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
  const ITEMS_PER_PAGE = 10;

  const [currentTime, setCurrentTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [orderNum, setOrderNum] = useState(1);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [amountPaidStr, setAmountPaidStr] = useState("");
  const [completedOrder, setCompletedOrder] = useState<Record<string, any> | null>(null);

  // Tính năng Quản lý Ca (WorkShift)
  const [currentShift, setCurrentShift] = useState<WorkShiftDTO | null>(null);
  const [showStartShiftModal, setShowStartShiftModal] = useState(false);
  const [showEndShiftModal, setShowEndShiftModal] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [shiftSummary, setShiftSummary] = useState({
    cash: 0,
    transfer: 0,
    card: 0,
    debt: 0,
    totalItems: 0,
    orderCount: 0
  });

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
      const data = await ProductService.getAll();
      setProducts(data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await CustomerService.getAll();
      setCustomers(data);
    } catch (err) {
      console.error("Lỗi tải danh sách khách hàng:", err);
    }
  }, []);

  const fetchCurrentShift = useCallback(async () => {
    try {
      const shift = await WorkShiftService.getCurrent();
      setCurrentShift(shift);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Chưa mở ca -> Bắt buộc mở
        setShowStartShiftModal(true);
      } else {
        console.error("Lỗi lấy thông tin ca:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    fetchCurrentShift();
  }, [fetchProducts, fetchCustomers, fetchCurrentShift]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  const subtotal = cart.reduce((s, i) => s + (i.selectedPrice ?? i.price) * i.cartQuantity, 0);
  const discVal = parseFloat(discountValue) || 0;
  const discountAmount = discountType === "pct" ? subtotal * (discVal / 100) : Math.min(discVal, subtotal);
  const totalAmount = Math.round(subtotal - discountAmount);

  const handleOpenCheckout = () => {
    if (!cart.length) return alert("Giỏ hàng đang trống!");
    setAmountPaidStr(totalAmount.toString());
    setShowCheckoutModal(true);
  };

  const handleCheckout = useCallback(async () => {
    setIsProcessing(true);
    const amountPaid = parseInt(amountPaidStr || "0", 10);
    try {
      await OrderService.create({
        customerId: selectedCustomer ? selectedCustomer.id : null,
        workShiftId: currentShift?.id || null,
        totalAmount,
        amountPaid,
        paymentMethod: paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1),
        note,
        details: cart.map((c) => ({
          productId: c.id,
          quantity: c.cartQuantity,
          unitPrice: c.selectedPrice ?? c.price,
          unitId: c.selectedUnitId ?? c.unitId // Gửi UnitId lên Backend
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
        date: new Date().toLocaleString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
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

  const handleAddQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return alert("Vui lòng điền đủ Tên và Số điện thoại!");

    try {
      const newCustomer = await CustomerService.create({
        customerCode: `KH-${newCustPhone}`,
        fullName: newCustName,
        phone: newCustPhone,
        email: `${newCustPhone}@pos.com`,
        address: "Khách đăng ký tại quầy"
      });

      alert("🎉 Đăng ký thẻ thành viên thành công!");
      await fetchCustomers();
      setSelectedCustomer(newCustomer);
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
      // 🎯 Kiểm tra xem đã có sản phẩm này với CÙNG MỘT ĐƠN VỊ TÍNH trong giỏ hàng chưa
      const defaultUnitId = product.unitId;
      const existingIndex = prev.findIndex((i) => i.id === product.id && i.selectedUnitId === defaultUnitId);
      
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const currentQty = existing.cartQuantity * (existing.conversionFactor || 1);
        if (currentQty >= product.quantity) {
          alert("Không đủ tồn kho!");
          return prev;
        }
        const updatedCart = [...prev];
        updatedCart[existingIndex] = { ...existing, cartQuantity: existing.cartQuantity + 1 };
        return updatedCart;
      }
      
      return [...prev, { 
        ...product, 
        cartQuantity: 1, 
        selectedUnitId: defaultUnitId, 
        selectedUnitName: product.unitName, 
        selectedPrice: product.price, 
        conversionFactor: 1 
      }];
    });
  };

  const updateQty = (id: number, delta: number, unitId?: number | null) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.selectedUnitId !== unitId) return item;
        const newQty = item.cartQuantity + delta;
        const totalDeducted = newQty * (item.conversionFactor || 1);
        if (totalDeducted > item.quantity) {
          alert("Không đủ tồn kho!");
          return item;
        }
        return { ...item, cartQuantity: Math.max(0, newQty) };
      }).filter((item) => item.cartQuantity > 0)
    );
  };

  const updateUnit = (id: number, oldUnitId: number | null | undefined, newUnitId: number) => {
    setCart((prev) => {
      const itemIndex = prev.findIndex(i => i.id === id && i.selectedUnitId === oldUnitId);
      if (itemIndex === -1) return prev;
      
      const item = prev[itemIndex];
      let newPrice = item.price;
      let newUnitName = item.unitName;
      let newConv = 1;

      if (newUnitId !== item.unitId && item.productUoMs) {
        const uom = item.productUoMs.find(u => u.unitId === newUnitId);
        if (uom) {
          newPrice = uom.price;
          newUnitName = uom.unitName;
          newConv = uom.conversionFactor;
        }
      }

      const totalDeducted = item.cartQuantity * newConv;
      if (totalDeducted > item.quantity) {
        alert("Không đủ tồn kho để chuyển đổi sang đơn vị này!");
        return prev;
      }

      // Check if the new unit already exists in cart for this product
      const existingTargetIndex = prev.findIndex(i => i.id === id && i.selectedUnitId === newUnitId);
      
      const newCart = [...prev];
      if (existingTargetIndex >= 0 && existingTargetIndex !== itemIndex) {
        // Merge
        newCart[existingTargetIndex].cartQuantity += item.cartQuantity;
        newCart.splice(itemIndex, 1);
      } else {
        // Update current
        newCart[itemIndex] = {
          ...item,
          selectedUnitId: newUnitId,
          selectedUnitName: newUnitName,
          selectedPrice: newPrice,
          conversionFactor: newConv
        };
      }
      return newCart;
    });
  };

  const removeItem = (id: number, unitId?: number | null) => setCart((prev) => prev.filter((i) => !(i.id === id && i.selectedUnitId === unitId)));

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === "Tất cả" || p.categoryName === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchQ = !q || p.productName.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return {
    products, loading, isProcessing, isMobileCartOpen, setIsMobileCartOpen,
    tabs, setTabs, activeTabId, setActiveTabId, tabCounter, setTabCounter, tabsContainerRef,
    activeTab, cart, discountValue, discountType, note, selectedCustomer,
    updateActiveTab, setCart, setDiscountValue, setDiscountType, setNote, setSelectedCustomer,
    activeCategory, setActiveCategory, searchQuery, setSearchQuery,
    currentPage, setCurrentPage, ITEMS_PER_PAGE,
    currentTime, paymentMethod, setPaymentMethod, orderNum, setOrderNum,
    showCheckoutModal, setShowCheckoutModal, amountPaidStr, setAmountPaidStr,
    completedOrder, setCompletedOrder,
    showStartShiftModal, setShowStartShiftModal, currentShift, setCurrentShift,
    showEndShiftModal, setShowEndShiftModal, showOrderHistoryModal, setShowOrderHistoryModal, shiftSummary, setShiftSummary,
    customers, setCustomers, showCustModal, setShowCustModal, custSearchQuery, setCustSearchQuery,
    newCustName, setNewCustName, newCustPhone, setNewCustPhone,
    categories, fetchProducts, fetchCustomers,
    subtotal, discVal, discountAmount, totalAmount,
    handleOpenCheckout, handleCheckout, handleAddQuickCustomer,
    addToCart, updateQty, updateUnit, removeItem, filteredProducts, totalPages, currentProducts
  };
};
