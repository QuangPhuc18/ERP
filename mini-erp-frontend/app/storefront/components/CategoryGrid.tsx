"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import httpAxios from "../../services/httpAxios";

interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpAxios.get("/Storefront/categories")
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        console.error("Lỗi lấy danh mục:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null; // Hoặc một skeleton loader

  return (
    <section className="max-w-7xl mx-auto px-5 md:px-16 py-12">
      <h2 className="font-sf-display text-2xl font-bold mb-8">Aisles</h2>
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">
          {categories.map((cat, index) => {
            // Cấu trúc layout động dựa trên thứ tự index
            let colSpanClass = "md:col-span-1 lg:col-span-1 row-span-1";
            let contentClass = "bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors";
            let textClass = "font-sf-display text-2xl font-bold text-white bg-black/40 px-4 py-2 backdrop-blur-sm rounded-sm";
            let textPosition = "center";

            if (index === 0) {
              // Ô to nhất
              colSpanClass = "md:col-span-2 lg:col-span-2 row-span-2";
              contentClass = "bg-gradient-to-t from-black/60 to-transparent flex items-end p-6";
              textClass = "font-sf-display text-2xl font-bold text-white";
              textPosition = "bottom";
            } else if (index === 1) {
              // Ô ngang dài
              colSpanClass = "md:col-span-1 lg:col-span-2 row-span-1";
              contentClass = "bg-gradient-to-r from-black/50 to-transparent flex items-center p-6";
              textClass = "font-sf-display text-2xl font-bold text-white";
              textPosition = "left";
            } else if (index === 3 || (!cat.imageUrl && index % 2 !== 0)) {
              // Style dạng card không ảnh hoặc ô đặc biệt
              return (
                <Link key={cat.id} href={`#category-${cat.id}`} className={`${colSpanClass} relative group overflow-hidden sf-card-level-1 rounded-lg bg-sf-surface-container-low flex flex-col items-center justify-center p-6 text-center hover:bg-sf-surface-container-high transition-colors`}>
                  <span className="material-symbols-outlined text-4xl text-sf-primary mb-4">category</span>
                  <h3 className="font-sf-display text-2xl font-bold text-sf-on-surface">{cat.name}</h3>
                  {cat.description && <p className="text-sm mt-2 text-sf-on-surface-variant font-sf-body">{cat.description}</p>}
                </Link>
              );
            }

            return (
              <Link key={cat.id} href={`#category-${cat.id}`} className={`${colSpanClass} relative group overflow-hidden sf-card-level-1 rounded-lg`}>
                {cat.imageUrl ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                    style={{ backgroundImage: `url('${cat.imageUrl}')` }}
                  ></div>
                ) : (
                  <div className="absolute inset-0 bg-emerald-100 flex items-center justify-center">
                     <span className="material-symbols-outlined text-emerald-300 text-6xl">image</span>
                  </div>
                )}
                
                <div className={`absolute inset-0 ${contentClass}`}>
                  <h3 className={textClass}>{cat.name}</h3>
                  {cat.description && textPosition === "bottom" && (
                      <p className="text-white/80 mt-2 ml-2 block w-full text-sm">{cat.description}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
         <p className="text-gray-500">Chưa có danh mục nào.</p>
      )}
    </section>
  );
}
