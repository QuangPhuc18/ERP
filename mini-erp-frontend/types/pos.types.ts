export interface ProductUoM {
  unitId: number;
  unitName?: string;
  conversionFactor: number;
  price: number;
}

export interface Product {
  id: number;
  productCode: string;
  productName: string;
  price: number;
  quantity: number;
  categoryName?: string;
  imageUrl?: string;
  unitId?: number | null;
  unitName?: string | null;
  productUoMs?: ProductUoM[];
}

export interface CartItem extends Product {
  cartQuantity: number;
  selectedUnitId?: number | null;
  selectedUnitName?: string | null;
  selectedPrice?: number;
  conversionFactor?: number;
}

export interface Customer {
  id: number;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
}

export type DiscountType = "pct" | "amt";
export type PaymentMethod = "cash" | "transfer" | "card";

export interface PosTab {
  id: string;
  cart: CartItem[];
  discountValue: string;
  discountType: DiscountType;
  note: string;
  selectedCustomer: Customer | null;
}
