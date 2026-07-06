import React from "react";
import { ISearch } from "../shared/Icons";
import AuthService from "../../app/services/AuthService";

interface TopbarProps {
  currentTime: string;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  setShowEndShiftModal: (val: boolean) => void;
}

export const Topbar: React.FC<TopbarProps> = ({ currentTime, searchQuery, setSearchQuery, setShowEndShiftModal }) => {
  return (
    <div className="h-auto lg:h-20 bg-white/90 backdrop-blur-md border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 p-5 lg:px-8 shrink-0 z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="font-extrabold text-gray-900 text-2xl tracking-tight">NexERP POS</span>
          <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-orange-100/50">Quầy #01</span>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <button onClick={() => setShowEndShiftModal(true)} className="p-2 bg-gray-900 text-white rounded-lg" title="Đóng ca">
            <span className="material-symbols-outlined text-[18px] block">lock_clock</span>
          </button>
          <button onClick={() => AuthService.logout()} className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100" title="Đăng xuất">
            <span className="material-symbols-outlined text-[18px] block">logout</span>
          </button>
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
        <button onClick={() => AuthService.logout()} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 tracking-wide" title="Đăng xuất">
          <span className="material-symbols-outlined text-[18px]">logout</span> ĐĂNG XUẤT
        </button>
      </div>
    </div>
  );
};
