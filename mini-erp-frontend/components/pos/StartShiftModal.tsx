import React, { useState } from "react";
import WorkShiftService from "../../app/services/WorkShiftService";

interface StartShiftModalProps {
  onShiftStarted: (shift: any) => void;
  employeeName: string;
}

export default function StartShiftModal({ onShiftStarted, employeeName }: StartShiftModalProps) {
  const [startingCash, setStartingCash] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartShift = async () => {
    try {
      setLoading(true);
      setError("");
      const cashValue = parseFloat(startingCash.replace(/,/g, '')) || 0;
      const shift = await WorkShiftService.openShift(cashValue);
      onShiftStarted(shift);
    } catch (err: any) {
      setError(err.response?.data || "Lỗi khi mở ca!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-orange-500 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl">store</span>
          </div>
          <h2 className="text-2xl font-black">Bắt Đầu Ca Làm Việc</h2>
          <p className="text-orange-100 mt-1">Xin chào, {employeeName}!</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">
            Vui lòng nhập số tiền mặt có sẵn trong két sắt đầu ca.
          </p>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tiền mặt đầu ca (VNĐ)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  payments
                </span>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all text-xl font-bold text-gray-900"
                  value={startingCash}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val) {
                      setStartingCash(parseInt(val, 10).toLocaleString("en-US"));
                    } else {
                      setStartingCash("0");
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleStartShift}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 rounded-xl mt-8 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Mở Két & Bắt Đầu Bán Hàng"}
            {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
