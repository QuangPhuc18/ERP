"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "../../CartContext";
import httpAxios from "../../../services/httpAxios";
import Link from "next/link";

interface Product {
  id: number;
  productName: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  quantity: number;
  productCode: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (id) {
      httpAxios.get(`/Storefront/products/${id}`)
        .then((res) => setProduct(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen px-5 md:px-16 max-w-7xl mx-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sf-secondary-fixed border-t-sf-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-5 md:px-16 py-20 text-center max-w-7xl mx-auto">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
        <h2 className="text-2xl font-bold mb-4 font-sf-display text-sf-on-surface">Không tìm thấy sản phẩm</h2>
        <button onClick={() => router.push("/storefront")} className="text-sf-primary hover:underline font-sf-body font-semibold">
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.productName,
      price: product.price,
      imageUrl: product.imageUrl || "",
      quantity: qty
    });
    // Hiển thị thông báo hoặc chuyển hướng
    alert(`Đã thêm ${qty} ${product.productName} vào giỏ hàng!`);
  };

  return (
    <div className="px-5 md:px-16 max-w-7xl mx-auto w-full">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center text-sm font-sf-body text-sf-on-surface-variant">
        <Link href="/storefront" className="hover:text-sf-primary">Storefront</Link>
        <span className="mx-2 material-symbols-outlined text-sm">chevron_right</span>
        <span className="hover:text-sf-primary cursor-pointer">{product.categoryName || "Danh mục"}</span>
        <span className="mx-2 material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-sf-primary font-medium">{product.productName}</span>
      </div>

      {/* Product Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Left Column: Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="bg-sf-surface-container-lowest border border-sf-outline-variant rounded-xl overflow-hidden aspect-square flex items-center justify-center p-8">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={product.productName} 
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="material-symbols-outlined text-8xl text-sf-surface-dim">image</span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            <button className="bg-sf-surface-container-lowest border-2 border-sf-primary rounded-lg overflow-hidden aspect-square p-2">
              {product.imageUrl ? (
                <img src={product.imageUrl} className="w-full h-full object-cover rounded" alt="thumb" />
              ) : (
                <span className="material-symbols-outlined text-2xl text-sf-surface-dim">image</span>
              )}
            </button>
            <button className="bg-sf-surface-container-lowest border border-sf-outline-variant rounded-lg overflow-hidden aspect-square p-2 opacity-60 hover:opacity-100 transition-opacity flex justify-center items-center">
              <span className="material-symbols-outlined text-2xl text-sf-surface-dim">image</span>
            </button>
            <button className="bg-sf-surface-container-lowest border border-sf-outline-variant rounded-lg overflow-hidden aspect-square p-2 opacity-60 hover:opacity-100 transition-opacity flex justify-center items-center">
               <span className="material-symbols-outlined text-2xl text-sf-surface-dim">image</span>
            </button>
          </div>
        </div>

        {/* Right Column: Product Details */}
        <div className="flex flex-col justify-center lg:pl-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-sf-surface-container px-3 py-1 rounded-full font-sf-body text-xs font-semibold text-sf-on-surface-variant uppercase tracking-widest">
              {product.categoryName}
            </span>
            <span className="bg-sf-surface-container px-3 py-1 rounded-full font-sf-body text-xs font-semibold text-sf-on-surface-variant uppercase tracking-widest">
              SKU: {product.productCode}
            </span>
          </div>
          <h1 className="font-sf-display text-4xl md:text-5xl font-extrabold text-sf-primary mb-2">
            {product.productName}
          </h1>
          <p className="font-sf-body text-lg text-sf-on-surface-variant mb-6">
            Sản phẩm chính hãng chất lượng cao. Đảm bảo nguồn gốc xuất xứ rõ ràng và được kiểm định nghiêm ngặt trước khi đến tay người tiêu dùng.
          </p>
          <div className="flex items-end gap-2 mb-8">
            <span className="font-sf-display text-3xl font-bold text-sf-primary">
              {product.price.toLocaleString("vi-VN")} ₫
            </span>
            <span className="font-sf-body text-base text-sf-on-surface-variant pb-1">/ cái</span>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-6 mb-8 border-t border-b border-sf-surface-variant py-6">
            <div className="flex items-center border border-sf-outline-variant rounded-full p-1 bg-sf-surface-container-lowest">
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Decrease quantity" 
                className="w-10 h-10 flex items-center justify-center text-sf-on-surface-variant hover:text-sf-primary transition-colors"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="w-12 text-center font-sf-body text-lg text-sf-primary font-medium">
                {qty}
              </span>
              <button 
                onClick={() => setQty(qty + 1)}
                aria-label="Increase quantity" 
                className="w-10 h-10 flex items-center justify-center text-sf-on-surface-variant hover:text-sf-primary transition-colors"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="flex-grow bg-[#E67E22] text-white py-4 px-8 rounded-full font-sf-display text-lg font-bold hover:bg-[#D35400] transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">shopping_bag</span>
              Add to Cart
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-sf-on-surface-variant font-sf-body text-base">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sf-primary-container">local_shipping</span> 
              Giao hàng hỏa tốc trong 2h
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sf-on-surface-variant font-sf-body text-base">
             <span className="flex items-center gap-1">
               <span className="material-symbols-outlined text-sf-primary-container">verified</span> 
               Bảo hành chính hãng 12 tháng
             </span>
          </div>
        </div>
      </section>

      {/* Product Tabs Section */}
      <section className="mb-12">
        <div className="border-b border-sf-surface-variant mb-8 flex gap-8">
          <button 
            onClick={() => setActiveTab("details")}
            className={`font-sf-display text-2xl font-bold pb-4 transition-colors ${activeTab === "details" ? "text-sf-primary border-b-2 border-sf-primary" : "text-sf-on-surface-variant hover:text-sf-primary"}`}
          >
            Chi tiết
          </button>
          <button 
            onClick={() => setActiveTab("specs")}
            className={`font-sf-display text-2xl font-bold pb-4 transition-colors ${activeTab === "specs" ? "text-sf-primary border-b-2 border-sf-primary" : "text-sf-on-surface-variant hover:text-sf-primary"}`}
          >
            Thông số
          </button>
          <button 
            onClick={() => setActiveTab("warranty")}
            className={`font-sf-display text-2xl font-bold pb-4 transition-colors ${activeTab === "warranty" ? "text-sf-primary border-b-2 border-sf-primary" : "text-sf-on-surface-variant hover:text-sf-primary"}`}
          >
            Bảo hành
          </button>
        </div>
        
        <div className="font-sf-body text-lg text-sf-on-surface-variant max-w-3xl leading-relaxed">
          {activeTab === "details" && (
            <>
              <p className="mb-4">
                Sản phẩm {product.productName} mang đến trải nghiệm tuyệt vời cho người sử dụng với thiết kế hiện đại, độ bền cao và các tính năng ưu việt.
              </p>
              <ul className="space-y-2 mt-6">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sf-primary-container mt-1">check_circle</span>
                  <span>Chất liệu an toàn, thân thiện với môi trường.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sf-primary-container mt-1">check_circle</span>
                  <span>Thiết kế tối giản, phù hợp với mọi không gian nội thất.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sf-primary-container mt-1">check_circle</span>
                  <span>Dễ dàng vệ sinh và bảo quản.</span>
                </li>
              </ul>
            </>
          )}
          {activeTab === "specs" && (
            <div className="bg-sf-surface-container-lowest border border-sf-outline-variant rounded-lg p-6">
              <table className="w-full text-left">
                <tbody>
                  <tr className="border-b border-sf-surface-variant">
                    <td className="py-3 font-semibold text-sf-on-surface w-1/3">Mã sản phẩm</td>
                    <td className="py-3">{product.productCode}</td>
                  </tr>
                  <tr className="border-b border-sf-surface-variant">
                    <td className="py-3 font-semibold text-sf-on-surface w-1/3">Danh mục</td>
                    <td className="py-3">{product.categoryName}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-semibold text-sf-on-surface w-1/3">Trạng thái kho</td>
                    <td className="py-3">{product.quantity > 0 ? `Còn hàng (${product.quantity})` : "Hết hàng"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "warranty" && (
            <>
              <p className="mb-4">
                Chính sách bảo hành áp dụng cho tất cả các sản phẩm mua tại MiniERP. 
              </p>
              <ul className="space-y-2 mt-6">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sf-primary-container mt-1">info</span>
                  <span>1 đổi 1 trong vòng 30 ngày nếu có lỗi từ nhà sản xuất.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sf-primary-container mt-1">info</span>
                  <span>Bảo hành phần cứng 12 tháng tại các trung tâm uỷ quyền.</span>
                </li>
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
