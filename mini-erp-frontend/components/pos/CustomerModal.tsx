import React from "react";
import { IClose, ISearch } from "../shared/Icons";
import { Customer } from "../../types/pos.types";

interface CustomerModalProps {
  showCustModal: boolean;
  setShowCustModal: (val: boolean) => void;
  custSearchQuery: string;
  setCustSearchQuery: (val: string) => void;
  customers: Customer[];
  setSelectedCustomer: (val: Customer | null) => void;
  selectedCustomer: Customer | null;
  newCustName: string;
  setNewCustName: (val: string) => void;
  newCustPhone: string;
  setNewCustPhone: (val: string) => void;
  handleAddQuickCustomer: (e: React.FormEvent) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  showCustModal, setShowCustModal, custSearchQuery, setCustSearchQuery,
  customers, setSelectedCustomer, selectedCustomer, newCustName, setNewCustName,
  newCustPhone, setNewCustPhone, handleAddQuickCustomer
}) => {
  if (!showCustModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[32px] max-w-md w-full p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-extrabold text-gray-900 text-2xl tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-orange-500 text-3xl">how_to_reg</span> Khách hàng
          </h3>
          <button onClick={() => setShowCustModal(false)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors">
            <IClose />
          </button>
        </div>
        
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><ISearch /></span>
          <input 
            type="text" 
            placeholder="Gõ tên hoặc SĐT để tìm..." 
            value={custSearchQuery} 
            onChange={(e) => setCustSearchQuery(e.target.value)} 
            className="w-full h-14 pl-12 pr-4 bg-gray-50/80 border border-gray-200/60 rounded-2xl text-[15px] outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 transition-all shadow-sm font-medium" 
          />
        </div>
        
        <div className="flex-1 overflow-y-auto mb-6 border border-gray-100 rounded-[20px] min-h-[250px] divide-y divide-gray-50 bg-[#F5F6FA] shadow-inner">
          {customers.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10 font-semibold tracking-wide">Chưa có dữ liệu</p>
          ) : (
            customers.filter(c => c.fullName.toLowerCase().includes(custSearchQuery.toLowerCase()) || c.phone.includes(custSearchQuery)).map(c => (
              <div key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustModal(false); }} className="p-4 mx-2 my-2 bg-white rounded-xl cursor-pointer hover:border-orange-500 border border-transparent shadow-sm hover:shadow-md hover:shadow-orange-500/10 transition-all flex justify-between items-center group">
                <div>
                  <p className="font-bold text-gray-900 text-[15px]">{c.fullName}</p>
                  <p className="text-[13px] text-gray-500 mt-1 font-medium"><span className="material-symbols-outlined text-[14px] align-text-bottom mr-1 text-gray-400">call</span>{c.phone}</p>
                  <p className="text-[13px] text-orange-500 mt-1 font-bold"><span className="material-symbols-outlined text-[14px] align-text-bottom mr-1">stars</span>{(c.rewardPoints || 0).toLocaleString("vi-VN")} điểm</p>
                </div>
                <span className="text-xs text-orange-600 font-bold opacity-0 group-hover:opacity-100 bg-orange-50 px-3 py-1.5 rounded-lg transition-all">Chọn</span>
              </div>
            ))
          )}
        </div>
        
        {selectedCustomer && (
          <button onClick={() => { setSelectedCustomer(null); setShowCustModal(false); }} className="w-full p-3 mb-6 text-sm text-center text-red-500 hover:bg-red-50 font-bold rounded-[16px] border border-red-100 border-dashed transition-colors">
            ✕ Hủy chọn
          </button>
        )}
        
        <div className="flex items-center gap-4 mb-6 opacity-60">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Đăng ký mới</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>
        
        <form onSubmit={handleAddQuickCustomer} className="space-y-5 bg-white p-6 rounded-[24px] border border-gray-200/60 shadow-sm">
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase mb-2 tracking-widest">Tên khách hàng</label>
            <input type="text" placeholder="Nguyễn Văn A" value={newCustName} onChange={(e) => setNewCustName(e.target.value)} className="w-full h-12 px-4 text-[15px] border border-gray-200/60 bg-gray-50/80 rounded-xl outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all" />
          </div>
          <div>
            <label className="block text-[11px] font-black text-gray-500 uppercase mb-2 tracking-widest">Số điện thoại <span className="text-red-500">*</span></label>
            <input type="text" placeholder="0901234567" value={newCustPhone} onChange={(e) => setNewCustPhone(e.target.value)} className="w-full h-12 px-4 text-[15px] border border-gray-200/60 bg-gray-50/80 rounded-xl outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-50 transition-all" />
          </div>
          <button type="submit" className="w-full h-14 mt-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-black text-[15px] rounded-[16px] transition-all duration-300 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">person_add</span> TẠO THẺ & CHỌN
          </button>
        </form>
      </div>
    </div>
  );
};
