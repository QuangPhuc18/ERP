import React, { useState } from "react";
import WorkShiftService, { WorkShiftDTO } from "../../app/services/WorkShiftService";

interface EndShiftModalProps {
  showEndShiftModal: boolean;
  setShowEndShiftModal: (val: boolean) => void;
  shiftSummary: {
    cash: number;
    transfer: number;
    card: number;
    debt: number;
    totalItems: number;
    orderCount: number;
  };
  storeInfo: { name: string; address: string; phone: string; logo: string; };
  currentShift: WorkShiftDTO | null;
  setCurrentShift: (val: WorkShiftDTO | null) => void;
}

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

export const EndShiftModal: React.FC<EndShiftModalProps> = ({
  showEndShiftModal, setShowEndShiftModal, shiftSummary, storeInfo, currentShift, setCurrentShift
}) => {
  const [actualCashStr, setActualCashStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClosed, setIsClosed] = useState(false); // Đã đóng thành công và đang in

  if (!showEndShiftModal) return null;

  const handleCloseShift = async () => {
    if (!currentShift) {
      alert("Lỗi: Không tìm thấy ca làm việc hiện tại!");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const actualCash = parseFloat(actualCashStr.replace(/,/g, '')) || 0;
      
      const response = await WorkShiftService.closeShift(currentShift.id, actualCash);
      setIsClosed(true);
      setCurrentShift(null);
      
      // In report
      setTimeout(() => {
        window.print();
        setShowEndShiftModal(false);
        // 🎯 FIX: Đẩy về Dashboard để nhân viên biết ca đã đóng thành công, thay vì kẹt lại POS
        window.location.href = "/dashboard";
      }, 500);

    } catch (err: any) {
      setError(err.response?.data || "Lỗi khi chốt ca!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in no-print">
        <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden flex flex-col shadow-2xl relative">
          <div className="p-8 pb-6 border-b border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-3">
              <span className="material-symbols-outlined text-gray-400 text-3xl">lock_clock</span> Kết Ca
            </h2>
            <p className="text-sm text-gray-500 font-medium">Báo cáo đếm mù (Blind Count)</p>
          </div>
          
          <div className="p-8 space-y-5 bg-[#F5F6FA]">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium text-center">
                {error}
              </div>
            )}
            
            <p className="text-gray-600 text-[14px]">
              Để đảm bảo minh bạch, vui lòng đếm tổng số tiền mặt hiện có trong két (bao gồm cả tiền lẻ đầu ca) và nhập vào ô bên dưới.
            </p>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tiền mặt thực tế đếm được (VNĐ)</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">payments</span>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-xl font-bold text-gray-900"
                  value={actualCashStr}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val) setActualCashStr(parseInt(val, 10).toLocaleString("en-US"));
                    else setActualCashStr("");
                  }}
                  disabled={isClosed}
                  autoFocus
                />
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100/60 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-bold text-orange-600 uppercase">Chuyển khoản (Hệ thống)</span>
                <span className="text-lg font-black text-orange-700">{fmt(shiftSummary.transfer + shiftSummary.card)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white flex gap-3">
            <button 
              onClick={handleCloseShift} 
              disabled={loading || isClosed}
              className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 disabled:opacity-50"
            >
              {loading ? "ĐANG XỬ LÝ..." : <><span className="material-symbols-outlined text-[20px]">print</span> XÁC NHẬN & IN KẾT CA</>}
            </button>
            <button 
              onClick={() => setShowEndShiftModal(false)} 
              disabled={loading || isClosed}
              className="w-16 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center disabled:opacity-50"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      </div>

      <div id="printable-zreport" className="hidden print:block w-[80mm] text-black bg-white p-2 font-mono text-[12px] leading-snug mx-auto">
        <div className="text-center mb-4">
          <div className="text-xl font-bold mb-1">{storeInfo.name}</div>
          <div className="text-[11px] mb-1">Đ/c: {storeInfo.address}</div>
          <div className="text-[11px]">SĐT: {storeInfo.phone}</div>
        </div>
        <div className="text-center text-lg font-bold mb-3 border-b border-dashed border-black pb-3">BÁO CÁO KẾT CA</div>
        <div className="text-[11px] mb-3 border-b border-dashed border-black pb-3 space-y-1">
          <div className="flex justify-between"><span>Thời gian in:</span> <span>{new Date().toLocaleString('vi-VN')}</span></div>
          <div className="flex justify-between"><span>Ca/Quầy:</span> <span>Máy #01</span></div>
          <div className="flex justify-between"><span>Tổng số đơn:</span> <span>{shiftSummary.orderCount}</span></div>
          <div className="flex justify-between"><span>Tổng SP đã bán:</span> <span>{shiftSummary.totalItems}</span></div>
        </div>
        <div className="text-[12px] mb-4 border-b border-dashed border-black pb-3 space-y-2">
          <div className="flex justify-between font-bold"><span>Tiền mặt:</span> <span>{fmt(shiftSummary.cash)}</span></div>
          <div className="flex justify-between"><span>Chuyển khoản:</span> <span>{fmt(shiftSummary.transfer)}</span></div>
          <div className="flex justify-between"><span>Quẹt thẻ:</span> <span>{fmt(shiftSummary.card)}</span></div>
          <div className="flex justify-between"><span>Công nợ:</span> <span>{fmt(shiftSummary.debt)}</span></div>
        </div>
        <div className="flex justify-between font-bold text-[14px] mt-1 mb-4 border-b border-dashed border-black pb-3">
          <span>TỔNG DOANH THU:</span> <span>{fmt(shiftSummary.cash + shiftSummary.transfer + shiftSummary.card + shiftSummary.debt)}</span>
        </div>
        <div className="text-center text-[11px] italic">Xác nhận thu ngân nộp đủ tiền<br/><br/><br/>______________________</div>
      </div>
    </>
  );
};
