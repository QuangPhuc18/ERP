"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProductService, { ProductDTO } from "../../services/ProductService";
import CategoryService, { CategoryDTO } from "../../services/CategoryService";
import { useCart } from "../CartContext";

export default function ShopPage() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<"all" | "under50" | "50to200" | "over200">("all");
  const [sortBy, setSortBy] = useState<"none" | "price_asc" | "price_desc">("none");

  const { addToCart } = useCart();

  useEffect(() => {
    // Read URL params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      const search = params.get("search");
      
      if (cat) setSelectedCategory(parseInt(cat));
      if (search) setSearchQuery(search);
    }
    
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        ProductService.getAll(),
        CategoryService.getAll()
      ]);
      setProducts(productsData.filter(p => p.isActive !== false));
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory) {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.productName.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q));
    }

    if (priceRange !== "all") {
      result = result.filter(p => {
        if (priceRange === "under50") return p.price < 50000;
        if (priceRange === "50to200") return p.price >= 50000 && p.price <= 200000;
        if (priceRange === "over200") return p.price > 200000;
        return true;
      });
    }

    if (sortBy === "price_asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, searchQuery, priceRange, sortBy]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-sf-surface dark:bg-sf-inverse-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sf-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-sf-inverse-surface pt-28 pb-16 font-sf-body">
      <div className="max-w-7xl mx-auto px-5 md:px-16 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-8">
          <div>
            <h3 className="font-sf-display font-bold text-xl text-sf-on-surface mb-4">Tìm kiếm</h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-sf-outline">search</span>
              <input 
                className="w-full bg-sf-surface-container-low border border-sf-outline-variant rounded-lg focus:border-sf-primary focus:ring-0 focus:outline-none pl-10 pr-4 py-2 text-sf-on-surface transition-colors" 
                placeholder="Tên sản phẩm..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <h3 className="font-sf-display font-bold text-xl text-sf-on-surface mb-4">Danh mục</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={`text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === null ? "bg-sf-primary/10 text-sf-primary font-semibold" : "text-sf-on-surface-variant hover:bg-sf-surface-container"}`}
              >
                Tất cả sản phẩm
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.id ? "bg-sf-primary/10 text-sf-primary font-semibold" : "text-sf-on-surface-variant hover:bg-sf-surface-container"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-sf-display font-bold text-xl text-sf-on-surface mb-4">Mức giá</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="price" className="w-4 h-4 text-sf-primary focus:ring-sf-primary border-gray-300" checked={priceRange === "all"} onChange={() => setPriceRange("all")} />
                <span className="text-sf-on-surface-variant group-hover:text-sf-on-surface">Tất cả mức giá</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="price" className="w-4 h-4 text-sf-primary focus:ring-sf-primary border-gray-300" checked={priceRange === "under50"} onChange={() => setPriceRange("under50")} />
                <span className="text-sf-on-surface-variant group-hover:text-sf-on-surface">Dưới 50.000đ</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="price" className="w-4 h-4 text-sf-primary focus:ring-sf-primary border-gray-300" checked={priceRange === "50to200"} onChange={() => setPriceRange("50to200")} />
                <span className="text-sf-on-surface-variant group-hover:text-sf-on-surface">50.000đ - 200.000đ</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="radio" name="price" className="w-4 h-4 text-sf-primary focus:ring-sf-primary border-gray-300" checked={priceRange === "over200"} onChange={() => setPriceRange("over200")} />
                <span className="text-sf-on-surface-variant group-hover:text-sf-on-surface">Trên 200.000đ</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h1 className="font-sf-display font-extrabold text-3xl text-sf-on-surface">
              {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "Tất cả sản phẩm"}
              <span className="text-sf-outline ml-3 text-lg font-medium">({filteredProducts.length} kết quả)</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-sf-on-surface-variant">Sắp xếp:</span>
              <select 
                className="bg-transparent border border-sf-outline-variant rounded-lg px-3 py-1.5 text-sf-on-surface text-sm focus:outline-none focus:border-sf-primary"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="none">Mặc định</option>
                <option value="price_asc">Giá: Thấp đến Cao</option>
                <option value="price_desc">Giá: Cao xuống Thấp</option>
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-sf-surface-container-low rounded-2xl border border-sf-outline-variant border-dashed">
              <span className="material-symbols-outlined text-4xl text-sf-outline mb-2">inventory_2</span>
              <h3 className="text-lg font-semibold text-sf-on-surface">Không tìm thấy sản phẩm nào</h3>
              <p className="text-sf-on-surface-variant">Thử điều chỉnh lại bộ lọc hoặc từ khóa tìm kiếm</p>
              <button 
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchQuery("");
                  setPriceRange("all");
                }}
                className="mt-4 px-4 py-2 bg-sf-primary text-white rounded-full text-sm font-semibold hover:bg-sf-primary/90 transition"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group flex flex-col bg-sf-surface dark:bg-sf-surface-container rounded-2xl border border-sf-outline-variant overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <Link href={`/storefront/product-detail/${product.id}`} className="aspect-[4/3] bg-sf-surface-container-lowest overflow-hidden relative block">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                      </div>
                    )}
                    {product.quantity <= 0 && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="bg-gray-900 text-white font-sf-body text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">Hết hàng</span>
                      </div>
                    )}
                    {product.isNew && product.quantity > 0 && (
                      <span className="absolute top-3 left-3 bg-sf-primary text-sf-on-primary text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wider shadow-sm z-20">
                        New
                      </span>
                    )}
                  </Link>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-xs font-semibold text-sf-primary uppercase tracking-wider mb-1">
                      {product.categoryName || "Khác"}
                    </span>
                    <Link href={`/storefront/product-detail/${product.id}`} className="flex-1">
                      <h3 className="font-sf-display font-bold text-sf-on-surface text-lg leading-tight mb-2 hover:text-sf-primary transition-colors line-clamp-2">
                        {product.productName}
                      </h3>
                    </Link>
                    
                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-sf-outline-variant">
                      <div className="flex flex-col">
                        <span className="font-sans font-semibold text-gray-900 text-base">
                          {product.price.toLocaleString('vi-VN')}đ
                        </span>
                        {product.unitName && (
                          <span className="text-xs text-sf-outline font-medium">
                            / {product.unitName}
                          </span>
                        )}
                      </div>
                      <button 
                        disabled={product.quantity <= 0}
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart({
                            productId: product.id,
                            productName: product.productName,
                            price: product.price,
                            imageUrl: product.imageUrl || "",
                            categoryName: product.categoryName
                          });
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                          product.quantity <= 0 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-sf-primary/10 text-sf-primary hover:bg-sf-primary hover:text-sf-on-primary'
                        }`}
                        title={product.quantity <= 0 ? "Hết hàng" : "Thêm vào giỏ"}
                      >
                        <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
