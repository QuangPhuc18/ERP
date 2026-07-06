"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartContext";
import httpAxios from "../services/httpAxios";

interface Product {
  id: number;
  productName: string;
  price: number;
  imageUrl: string;
  categoryName: string;
}

export default function StorefrontHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    httpAxios.get("/Storefront/products")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Lỗi lấy sản phẩm:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero/Intro (Magazine Style) */}
      <section className="max-w-7xl mx-auto px-5 md:px-16 py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center min-h-[70vh]">
        <div className="lg:col-span-5 flex flex-col gap-6 z-10">
          <h1 className="font-sf-display text-5xl font-extrabold text-sf-on-surface leading-tight tracking-tight">
            Curated freshness, delivered daily.
          </h1>
          <p className="font-sf-body text-lg text-sf-on-surface-variant max-w-md">
            Experience the season best produce, hand-selected for culinary enthusiasts. Authenticity in every bite.
          </p>
          <div className="mt-4">
            <Link 
              href="#essentials"
              className="inline-flex items-center justify-center px-8 py-4 bg-sf-primary text-sf-on-primary hover:bg-sf-on-primary-fixed-variant transition-colors rounded font-sf-body text-xs font-semibold uppercase tracking-widest"
            >
              Shop the Season
            </Link>
          </div>
        </div>
        <div className="lg:col-span-7 relative h-[50vh] lg:h-[80vh] w-full">
          <div 
            className="absolute inset-0 bg-cover bg-center rounded-lg sf-card-level-1 overflow-hidden" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuANM2a5DVdVMMGYD9AtGBRcW9tlYHIL3EsqFMwMsv0egU9eP37voXuYJT5JXjuygApgmUVyx0cT7fuLc0WKnWw9u6Elkb4c7Lv8s15CRbWedlzSK2cjDwAMJl3B6RZdPH37zI1U5XPGc770Z4g-650in60zuhkBH1kTGxQt3MUaoti87mFJOypbADAvxMDbncjYYk5lbj-JMWwi6RHjD8Lmv6PkGyPRvntubrb52ccQWfKGUsus0J8A')" }}
          ></div>
        </div>
      </section>

      {/* Category Grid (Bento/Asymmetrical) */}
      <section className="max-w-7xl mx-auto px-5 md:px-16 py-12">
        <h2 className="font-sf-display text-2xl font-bold mb-8">Aisles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
          {/* Category 1: Rau củ */}
          <Link href="#" className="md:col-span-2 lg:col-span-2 row-span-2 relative group overflow-hidden sf-card-level-1 rounded-lg">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACDvDgLMnBa76KcoMT-DS7OpHGP3QeEv30Ug0RRxSypHsH-IgQCgoSfsALLBn9SJKR40qhuYuasfxOIff8PS_mFQnXFBPM5wBASoRb2dowDbZwdcUC4UqGSJWn5d8IXBnKGlKKmb3l-KsriRFLDfWvnskhc59ptmbTNO07HYstTO1L1Oks21OaGaoQ5ELxaoiY1rUHkcK2UbYa0MDZm-b1qbdMCP4eHUNqIga2Tp__3UJmvKBnoiLN')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <h3 className="font-sf-display text-2xl font-bold text-white">Rau củ</h3>
            </div>
          </Link>
          {/* Category 2: Thịt cá */}
          <Link href="#" className="md:col-span-1 lg:col-span-2 row-span-1 relative group overflow-hidden sf-card-level-1 rounded-lg">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBCV8VArRIg0UI_NY27vGB9_jvgms17ls8vOV7bs99Mag4ljgoiybOoYsHaTb4OkQ5BxPu0qxczs_M6iAwFYFzQjYS8clSegrz12aUmqbUr4WfwzJpUOsOnLpKiQburHJk7nOmzSQqJvAxl1pHFxH8vS0wcIZOW1CBn1O3Dunx2B14HzboDAmhKb2NdQjORsoUtMxwr9HcoxVtPesgcDVixteCvo8hlh_uazSzT7KLEfGBmHCQT9cQw')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center p-6">
              <h3 className="font-sf-display text-2xl font-bold text-white">Thịt cá</h3>
            </div>
          </Link>
          {/* Category 3: Gia vị */}
          <Link href="#" className="md:col-span-1 lg:col-span-1 row-span-1 relative group overflow-hidden sf-card-level-1 rounded-lg">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBtW4zkdLla7IimAheT5Xp0Bdise4-dXsPBTicAtFvcZhP5kf8jtYe8a_aVXAdBSCOwT4HX4P50b0afzHG4o1Vr1FQuh25r-8Ej7XZoOZX56eKmCD7gpRseKl-gU1g6-xKCzBPvNuLLUv6ytjR7FcXTNDaL7tZuMrylNYUO0zU80wneHJ-QnVAPzoXkHcV3Wm77DnM1fNo1GFdcW8cwC5fJ_dikYa0wJPrmn_QpLy77LxmDw9cwc-bH')" }}
            ></div>
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
              <h3 className="font-sf-display text-2xl font-bold text-white bg-black/40 px-4 py-2 backdrop-blur-sm rounded-sm">Gia vị</h3>
            </div>
          </Link>
          {/* Category 4: Đồ uống */}
          <Link href="#" className="md:col-span-1 lg:col-span-1 row-span-1 relative group overflow-hidden sf-card-level-1 rounded-lg bg-sf-surface-container-low flex flex-col items-center justify-center p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-sf-primary mb-4">local_cafe</span>
            <h3 className="font-sf-display text-2xl font-bold text-sf-on-surface">Đồ uống</h3>
            <p className="text-sm mt-2 text-sf-on-surface-variant font-sf-body">Artisanal coffees & teas</p>
          </Link>
        </div>
      </section>

      {/* Promo/Deals Highlight */}
      <section className="max-w-7xl mx-auto px-5 md:px-16 py-12">
        <div className="relative bg-sf-secondary-fixed rounded-lg overflow-hidden flex flex-col md:flex-row items-center justify-between p-8 md:p-12">
          <div className="z-10 max-w-lg mb-8 md:mb-0">
            <span className="font-sf-body text-xs font-semibold text-sf-on-secondary-fixed uppercase tracking-widest mb-4 block">Weekend Harvest</span>
            <h2 className="font-sf-display text-4xl font-extrabold text-sf-on-secondary-fixed mb-4">20% off all Organic Citrus</h2>
            <p className="font-sf-body text-lg text-sf-on-secondary-fixed-variant mb-6">Brighten your morning with our hand-picked selection of oranges, grapefruits, and lemons.</p>
            <Link 
              href="#essentials" 
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
                </Link>
                <div className="flex-1 flex flex-col">
                  <span className="font-sf-body text-xs font-semibold text-sf-on-surface-variant mb-1 uppercase tracking-widest line-clamp-1">
                    {product.categoryName}
                  </span>
                  <Link href={`/storefront/product-detail/${product.id}`}>
                    <h3 className="font-sf-body text-base font-semibold text-sf-on-surface mb-2 line-clamp-2 hover:text-sf-primary transition-colors">
                      {product.productName}
                    </h3>
                  </Link>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-sf-body text-lg text-sf-on-surface font-bold">
                      {product.price.toLocaleString("vi-VN")} ₫
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                          productId: product.id,
                          productName: product.productName,
                          price: product.price,
                          imageUrl: product.imageUrl || ""
                        });
                      }}
                      className="w-8 h-8 rounded-full border border-sf-primary text-sf-primary flex items-center justify-center hover:bg-sf-primary hover:text-sf-on-primary transition-colors"
                      title="Thêm vào giỏ"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>
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
          {/* Article 1 */}
          <article className="group cursor-pointer">
            <div className="w-full aspect-[4/3] mb-6 overflow-hidden rounded-lg bg-sf-surface-container-low">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTfr_ApjbRCbuBNf9coFpKqhTqn0S1bninvhlXaOjL2VE8YlSCgNykrVSG4qeGHOIcg1oVZCBr1U_qnv4HXXBBqkdYt17rooswDvgN2wmLSFYcIqhLQ-_2KS1jVeO5ZGWxP4j6LdQV0--RbiDchjcKTryeBJrnW_xvXfXn7ORmogUQu0ukDalP_ewjLmHV4mEIAzwJmepD2MqaiduOT0MMKBQlTssX4rNL3Tgm9IXwDDPf-F5cqdww" 
                alt="Farmer hands" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
              />
            </div>
            <span className="font-sf-body text-xs font-semibold text-sf-primary uppercase tracking-widest mb-2 block">Growers</span>
            <h3 className="font-sf-display text-2xl font-bold text-sf-on-surface mb-3 group-hover:text-sf-primary transition-colors">
              Rooted in Tradition: Meet the Smiths
            </h3>
            <p className="font-sf-body text-base text-sf-on-surface-variant">
              A deep dive into the sustainable practices of our oldest root vegetable supplier.
            </p>
          </article>
          {/* Article 2 */}
          <article className="group cursor-pointer">
            <div className="w-full aspect-[4/3] mb-6 overflow-hidden rounded-lg bg-sf-surface-container-low">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuIZOBEK8PyaA9josViZ6GIKHClc5JGCjw8ViP04VMytCq1uHQ5dfiB3jq5I5_gVafzUPulIet2QvZKEq1ux2IIUP4To97Q83O793kFrB4eGFZU6IIF06mMspT6y9lnOaDAzetGa9Itgp2FYuCVnHtrtq_KH93IhB7GvZnMjlAb_xOPmFvssDmN6WA5xuYXL0yXZHHgPBdU9tkCh38fCo50Zal_LEDbh8FZ3mARtllQshc3O95zV5P" 
                alt="Minimalist salad" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
              />
            </div>
            <span className="font-sf-body text-xs font-semibold text-sf-primary uppercase tracking-widest mb-2 block">Recipes</span>
            <h3 className="font-sf-display text-2xl font-bold text-sf-on-surface mb-3 group-hover:text-sf-primary transition-colors">
              The Art of the Minimalist Salad
            </h3>
            <p className="font-sf-body text-base text-sf-on-surface-variant">
              Letting high-quality, seasonal ingredients speak for themselves with three simple steps.
            </p>
          </article>
        </div>
      </section>
    </>
  );
}
