import React, { useState } from 'react';
import { EmployeeDTO } from '../../app/services/EmployeeService';
import ScheduleService from '../../app/services/ScheduleService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Props {
  employee: EmployeeDTO;
  date: Date;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScheduleModal: React.FC<Props> = ({ employee, date, onClose, onSuccess }) => {
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("11:00");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedShifts = [
    { label: "Ca Sáng (06:00 - 14:00)", start: "06:00", end: "14:00" },
    { label: "Ca Chiều (14:00 - 22:00)", start: "14:00", end: "22:00" },
    { label: "Ca Đêm (22:00 - 06:00)", start: "22:00", end: "06:00" },
    { label: "Part-time Sáng (07:00 - 11:00)", start: "07:00", end: "11:00" },
    { label: "Part-time Tối (18:00 - 22:00)", start: "18:00", end: "22:00" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await ScheduleService.createSchedule({
        employeeId: employee.id!,
        date: format(date, "yyyy-MM-dd"),
        startTime,
        endTime,
        notes
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Lỗi khi xếp ca. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[24px] max-w-md w-full overflow-hidden shadow-2xl">
        <div className="p-6 bg-[#F5F6FA] border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-gray-900">Xếp ca làm việc</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold transition-all shadow-sm">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Nhân viên</div>
            <div className="font-bold text-gray-900">{employee.fullName}</div>
            <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1 mt-3">Ngày làm việc</div>
            <div className="font-bold text-gray-900 capitalize">{format(date, "EEEE, dd/MM/yyyy", { locale: vi })}</div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Chọn ca mẫu (Gợi ý)</label>
            <div className="grid grid-cols-2 gap-2">
              {predefinedShifts.map((shift, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setStartTime(shift.start); setEndTime(shift.end); }}
                  className="px-3 py-2 text-xs font-bold border border-gray-200 rounded-lg text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all text-left"
                >
                  {shift.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Giờ bắt đầu</label>
              <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Giờ kết thúc</label>
              <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú (Tùy chọn)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="VD: Trực quầy thu ngân" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-3 font-bold text-white bg-gray-900 hover:bg-black disabled:bg-gray-300 rounded-xl transition-all flex items-center gap-2 shadow-lg">
              {isSubmitting ? "Đang xử lý..." : "Lưu lịch làm việc"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
