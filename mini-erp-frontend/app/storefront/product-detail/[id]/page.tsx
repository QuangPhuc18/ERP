"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "../../CartContext";
import httpAxios from "../../../services/httpAxios";
import signalRService from "../../../services/SignalRService";
import Link from "next/link";

interface Product {
  id: number;
  productName: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  categoryId?: number;
  quantity: number;
  productCode: string;
  description?: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchProductDetails = () => {
      if (id) {
        httpAxios.get(`/Storefront/products/${id}`)
          .then((res) => {
            setProduct(res.data);
            // Tải danh sách tất cả sản phẩm để lọc sản phẩm liên quan
            return httpAxios.get(`/Storefront/products`).then((allRes) => {
              const allProducts: Product[] = allRes.data;
              const related = allProducts
                .filter((p) => {
                  const isSameCategory = p.categoryId 
                    ? p.categoryId === res.data.categoryId 
                    : p.categoryName === res.data.categoryName;
                  return isSameCategory && p.id !== res.data.id;
                })
                .slice(0, 4);
              setRelatedProducts(related);
            });
          })
          .catch((err) => console.error(err))
          .finally(() => setLoading(false));
      }
    };

    fetchProductDetails();

    // Kết nối Websocket (Real-time Inventory Sync)
    signalRService.startConnection("");
    const handleInventoryUpdate = () => {
      console.log("⚡ [Real-time] Cập nhật tồn kho sản phẩm chi tiết!");
      fetchProductDetails();
    };

    signalRService.on("InventoryUpdated", handleInventoryUpdate);

    return () => {
      signalRService.off("InventoryUpdated", handleInventoryUpdate);
    };
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
      categoryName: product.categoryName
    }, qty);
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
          <p className="font-sf-body text-lg text-sf-on-surface-variant mb-6 whitespace-pre-line">
            {product.description || "Sản phẩm chính hãng chất lượng cao. Đảm bảo nguồn gốc xuất xứ rõ ràng và được kiểm định nghiêm ngặt trước khi đến tay người tiêu dùng."}
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
              disabled={product.quantity <= 0}
              onClick={handleAddToCart}
              className={`flex-grow py-4 px-8 rounded-full font-sf-display text-lg font-bold transition-colors flex items-center justify-center gap-2 ${
                product.quantity <= 0 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-[#E67E22] text-white hover:bg-[#D35400]'
              }`}
            >
              <span className="material-symbols-outlined">
                {product.quantity <= 0 ? 'remove_shopping_cart' : 'shopping_bag'}
              </span>
              {product.quantity <= 0 ? 'Tạm Hết Hàng' : 'Thêm Vào Giỏ'}
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
               Đảm bảo chất lượng & Vệ sinh ATTP
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
            onClick={() => setActiveTab("storage")}
            className={`font-sf-display text-2xl font-bold pb-4 transition-colors ${activeTab === "storage" ? "text-sf-primary border-b-2 border-sf-primary" : "text-sf-on-surface-variant hover:text-sf-primary"}`}
          >
            Bảo quản
          </button>
        </div>
        
        <div className="font-sf-body text-lg text-sf-on-surface-variant max-w-3xl leading-relaxed">
          {activeTab === "details" && (
            <>
              <p className="mb-4 whitespace-pre-line">
                {product.description || `Sản phẩm ${product.productName} là sự lựa chọn hoàn hảo cho bữa ăn gia đình. Được sản xuất và đóng gói theo quy trình khép kín, đảm bảo giữ trọn hương vị tự nhiên và giá trị dinh dưỡng cao.`}
              </p>
              <ul className="space-y-2 mt-6">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sf-primary-container mt-1">check_circle</span>
                  <span>Cam kết hàng chính hãng, rõ nguồn gốc xuất xứ.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sf-primary-container mt-1">check_circle</span>
                  <span>Đạt tiêu chuẩn chất lượng và Vệ sinh an toàn thực phẩm.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sf-primary-container mt-1">check_circle</span>
                  <span>Bao bì đóng gói cẩn thận, dễ dàng sử dụng.</span>
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
          {activeTab === "storage" && (
            <>
              <p className="mb-4">
                Để đảm bảo chất lượng sản phẩm tốt nhất, vui lòng lưu ý các thông tin bảo quản dưới đây:
              </p>
              <ul className="space-y-2 mt-6">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sf-primary-container mt-1">info</span>
                  <span>Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sf-primary-container mt-1">info</span>
                  <span>Sau khi mở bao bì, nên bảo quản trong tủ lạnh (nếu là thực phẩm dễ hỏng) hoặc đậy kín.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sf-primary-container mt-1">info</span>
                  <span>Lưu ý hạn sử dụng in trên bao bì sản phẩm.</span>
                </li>
              </ul>
            </>
          )}
        </div>
      </section>

      {/* Sản phẩm liên quan */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-16 py-12 mb-16 border-t border-sf-surface-variant">
          <h2 className="font-sf-display text-2xl font-bold mb-8 text-sf-on-surface">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="group flex flex-col bg-sf-surface dark:bg-sf-surface-container rounded-2xl border border-sf-outline-variant overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Link href={`/storefront/product-detail/${p.id}`} className="aspect-[4/3] bg-sf-surface-container-lowest overflow-hidden relative block">
                  {p.imageUrl ? (
                    <img 
                      src={p.imageUrl} 
                      alt={p.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                    </div>
                  )}
                  {p.quantity <= 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <span className="bg-gray-900 text-white font-sf-body text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">Hết hàng</span>
                    </div>
                  )}
                </Link>
                
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-sf-primary uppercase tracking-wider mb-1">
                    {p.categoryName || "Khác"}
                  </span>
                  <Link href={`/storefront/product-detail/${p.id}`} className="flex-1">
                    <h3 className="font-sf-display font-bold text-sf-on-surface text-base leading-tight mb-2 hover:text-sf-primary transition-colors line-clamp-2">
                      {p.productName}
                    </h3>
                  </Link>
                  
                  <div className="flex items-end justify-between mt-auto pt-4 border-t border-sf-outline-variant">
                    <div className="flex flex-col">
                      <span className="font-sans font-semibold text-gray-900 text-base">
                        {p.price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <button 
                      disabled={p.quantity <= 0}
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                          productId: p.id,
                          productName: p.productName,
                          price: p.price,
                          imageUrl: p.imageUrl || "",
                          categoryName: p.categoryName
                        });
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                        p.quantity <= 0 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-sf-primary/10 text-sf-primary hover:bg-sf-primary hover:text-sf-on-primary'
                      }`}
                      title={p.quantity <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
                    >
                      <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
