import React from "react";
import { ISpin, IPlus } from "../shared/Icons";
import { Product } from "../../types/pos.types";

interface ProductGridProps {
  loading: boolean;
  categories: string[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  currentProducts: Product[];
  addToCart: (product: Product) => void;
  totalPages: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

export const ProductGrid: React.FC<ProductGridProps> = ({
  loading, categories, activeCategory, setActiveCategory,
  currentProducts, addToCart, totalPages, currentPage, setCurrentPage
}) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
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
            <div className="flex flex-col sm:grid sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] 2xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] sm:gap-6 bg-white sm:bg-transparent rounded-2xl sm:rounded-none overflow-hidden sm:overflow-visible shadow-sm sm:shadow-none border border-gray-100 sm:border-none">
              {currentProducts.map((p) => {
                const outOfStock = p.quantity <= 0;
                return (
                  <div key={p.id} onClick={() => !outOfStock && addToCart(p)} className={`sm:bg-white sm:rounded-[24px] px-4 py-3 sm:p-5 flex flex-row sm:flex-col items-center sm:items-stretch gap-3 sm:gap-5 relative transition-all duration-300 select-none group border-b last:border-b-0 sm:border-b-0 sm:border border-gray-100 sm:shadow-sm hover:bg-gray-50/50 sm:hover:bg-white sm:hover:shadow-xl sm:hover:shadow-gray-200/50 cursor-pointer sm:hover:-translate-y-1 ${outOfStock ? "opacity-50 grayscale cursor-not-allowed" : ""}`}>
                    {outOfStock && <span className="hidden sm:block absolute top-3 left-3 text-[10px] font-black bg-gray-900 text-white px-2.5 py-1 rounded-md z-10 shadow-sm tracking-widest">HẾT HÀNG</span>}
                    
                    <div className="w-12 h-12 sm:w-full sm:h-48 shrink-0 bg-gray-50/80 rounded-full sm:rounded-[18px] flex items-center justify-center overflow-hidden sm:p-3 relative group-hover:bg-orange-50/50 transition-colors">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.productName} className="object-cover sm:object-contain h-full w-full group-hover:scale-110 transition-transform duration-500 mix-blend-multiply" />
                      ) : (
                        <span className="material-symbols-outlined text-2xl sm:text-4xl text-gray-300">image</span>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-center min-w-0">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[13px] sm:text-[16px] font-medium sm:font-bold text-gray-800 sm:text-gray-900 leading-snug line-clamp-1 sm:line-clamp-2 sm:min-h-[44px] group-hover:text-orange-600 transition-colors sm:tracking-tight">{p.productName} {outOfStock && <span className="sm:hidden text-red-500 text-[10px] ml-1">(Hết)</span>}</p>
                        <p className="hidden sm:block text-[11px] text-gray-400 mt-1.5 uppercase tracking-widest font-bold">SKU: {p.productCode}</p>
                      </div>
                      
                      <div className="flex items-center justify-end sm:justify-between sm:w-full sm:mt-auto sm:pt-4 sm:border-t sm:border-gray-100/50">
                        <span className="text-[13px] sm:text-[18px] text-gray-600 sm:text-gray-900 font-medium sm:font-black tracking-tight whitespace-nowrap">{fmt(p.price)}</span>
                        <button disabled={outOfStock} className={`hidden sm:flex w-10 h-10 rounded-full items-center justify-center transition-all duration-300 ${outOfStock ? "bg-gray-100 text-gray-300" : "bg-gray-50 text-gray-900 group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-orange-500/30 group-active:scale-95"}`}><IPlus /></button>
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
    </div>
  );
};
