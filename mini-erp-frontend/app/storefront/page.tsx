"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import httpAxios from "../services/httpAxios";
import HeroBanner from "./components/HeroBanner";
import CategoryGrid from "./components/CategoryGrid";

interface Product {
  id: number;
  productName: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  quantity: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export default function StorefrontHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    // Tách riêng fetch products để không bị chờ fetch posts
    httpAxios.get("/Storefront/products")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Lỗi lấy dữ liệu sản phẩm:", err);
      })
      .finally(() => setLoading(false));

    // Fetch posts chạy ngầm
    httpAxios.get("/Storefront/posts")
      .then((res) => {
        setPosts(res.data.slice(0, 2));
      })
      .catch((err) => {
        console.error("Lỗi lấy bài viết:", err);
      });
  }, []);

  return (
    <>
      {/* Hero/Intro (Magazine Style) Đã được tách riêng để load tự động từ Database */}
      <HeroBanner />

      {/* Category Grid (Bento/Asymmetrical) */}
      <CategoryGrid />

      {/* Promo/Deals Highlight */}
      <section className="max-w-7xl mx-auto px-5 md:px-16 py-12">
        <div className="relative bg-sf-secondary-fixed rounded-lg overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-12">
          <div className="z-10 max-w-lg mb-8 md:mb-0">
            <span className="font-sf-body text-xs font-semibold text-sf-on-secondary-fixed uppercase tracking-widest mb-4 block">Weekend Harvest</span>
            <h2 className="font-sf-display text-4xl font-extrabold text-sf-on-secondary-fixed mb-4">20% off all Organic Citrus</h2>
            <p className="font-sf-body text-lg text-sf-on-secondary-fixed-variant mb-6">Brighten your morning with our hand-picked selection of oranges, grapefruits, and lemons.</p>
            <Link 
              href="/storefront/shop" 
              className="inline-flex items-center justify-center px-6 py-3 bg-sf-secondary text-sf-on-secondary hover:bg-sf-secondary-container hover:text-sf-on-secondary-container transition-colors rounded font-sf-body text-xs font-semibold uppercase tracking-widest"
            >
              Claim Offer
            </Link>
          </div>
          <div className="relative w-full md:w-1/2 h-64 md:h-full min-h-[300px]">
            <div 
              className="absolute inset-0 bg-cover bg-center rounded-lg shadow-sm" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD2uugxpcpfgNGP9ymorhYgMQrfZu6fCI0M_gqlDGv1Stp7tY3V9mTXwBycl8-BPeq0oEhXIFl3VBSS6GILiljR49JeEvMXRef1oOrHKMOesHdcEByJPoT7NXMfTK6IvGYSehmQscOvPnZsvnT60wGtHaLSZFkhCkqfxq9nmFf8hc5xAHWJw7Q-243wi5JHxchQcxIsWK9B2YOSeJqAJ3t9Rn6lnXAxcWh3_uhyOPWs5pYm4rm4TbeJ')" }}
            ></div>
          </div>
        </div>
      </section>

      {/* Best Sellers (Essentials - Dynamic Product List) */}
      <section className="max-w-7xl mx-auto px-5 md:px-16 py-12" id="essentials">
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-sf-display text-2xl font-bold">Essentials</h2>
          <Link href="#" className="font-sf-body text-xs font-semibold text-sf-primary hover:underline underline-offset-4 uppercase tracking-widest">
            View All
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-sf-secondary-fixed border-t-sf-primary"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-sf-surface-container-low">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">inventory_2</span>
            <h3 className="text-lg font-medium text-gray-900">Chưa có sản phẩm</h3>
            <p className="text-gray-500 mt-2">Cửa hàng đang cập nhật sản phẩm. Vui lòng quay lại sau.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="sf-card-level-1 rounded-lg p-4 flex flex-col relative group">
                <Link href={`/storefront/product-detail/${product.id}`} className="aspect-square w-full mb-4 relative overflow-hidden bg-sf-surface-container-low rounded-md">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.productName} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined text-5xl">image</span>
                    </div>
                  )}
                  {product.quantity <= 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <span className="bg-gray-900 text-white font-sf-body text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">Hết hàng</span>
                    </div>
                  )}
                </Link>
                <div className="flex-1 flex flex-col">
                  <span className="font-sf-body text-xs font-semibold text-sf-on-surface-variant mb-1 uppercase tracking-widest line-clamp-1">
                    {product.categoryName}
                  </span>
                  <div className="flex flex-col mb-4">
                    <h3 className="font-sf-display font-bold text-sf-on-surface text-lg leading-tight mb-2 truncate">
                      {product.productName}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-sans font-semibold text-gray-900 text-base">
                        {product.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                  <button
                    disabled={product.quantity <= 0}
                    onClick={() => addToCart({
                      productId: product.id,
                      productName: product.productName,
                      price: product.price,
                      imageUrl: product.imageUrl || "",
                      categoryName: product.categoryName
                    })}
                    className={`mt-auto w-full py-2 flex items-center justify-center gap-2 rounded bg-sf-surface-container hover:bg-sf-primary hover:text-sf-on-primary text-sf-primary transition-colors font-sf-body font-semibold text-sm group-hover:shadow-sm ${
                        product.quantity <= 0 
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                          : 'border-sf-primary text-sf-primary hover:bg-sf-primary hover:text-sf-on-primary'
                      }`}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Editorial/Blog */}
      <section className="max-w-7xl mx-auto px-5 md:px-16 py-12 border-t border-sf-surface-variant">
        <h2 className="font-sf-display text-2xl font-bold mb-12 text-center">The Journal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {posts.length > 0 ? (
            posts.map(post => (
              <Link key={post.id} href={`/storefront/journal/${post.id}`} className="group cursor-pointer block">
                <div className="w-full aspect-[4/3] mb-6 overflow-hidden rounded-lg bg-sf-surface-container-low">
                  {post.imageUrl ? (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="material-symbols-outlined text-4xl text-gray-300">article</span>
                    </div>
                  )}
                </div>
                <span className="font-sf-body text-xs font-semibold text-sf-primary uppercase tracking-widest mb-2 block">
                  {post.topic || "Blog"}
                </span>
                <h3 className="font-sf-display text-2xl font-bold text-sf-on-surface mb-3 group-hover:text-sf-primary transition-colors">
                  {post.title}
                </h3>
                <p className="font-sf-body text-base text-sf-on-surface-variant">
                  {new Date(post.publishDate).toLocaleDateString("vi-VN")}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-center col-span-1 md:col-span-2 text-gray-500">Chưa có bài viết nào.</p>
          )}
        </div>
      </section>
    </>
  );
}
