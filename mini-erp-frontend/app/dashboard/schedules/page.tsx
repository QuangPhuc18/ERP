"use client";
import React, { useEffect, useState } from "react";
import ScheduleService, { EmployeeSchedule } from "../../services/ScheduleService";
import EmployeeService, { EmployeeDTO } from "../../services/EmployeeService";
import { ScheduleModal } from "../../../components/hr/ScheduleModal";
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";
import { vi } from "date-fns/locale";

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDTO | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentWeekStart]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const [scheds, emps] = await Promise.all([
        ScheduleService.getSchedules(format(currentWeekStart, "yyyy-MM-dd"), format(weekEnd, "yyyy-MM-dd")),
        EmployeeService.getAll()
      ]);
      setSchedules(scheds);
      setEmployees(emps);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInWeek = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  };

  const handleCellClick = (emp: EmployeeDTO, date: Date) => {
    setSelectedEmployee(emp);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Xóa ca làm việc này?")) {
      await ScheduleService.deleteSchedule(id);
      fetchData();
    }
  };

  const weekDays = getDaysInWeek();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Xếp lịch làm việc</h1>
          <p className="text-gray-500">Quản lý ca làm việc (Roster) của nhân sự</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))} className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 font-bold">{"<"} Tuần trước</button>
          <span className="font-bold text-gray-700">Tuần {format(currentWeekStart, "dd/MM")} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "dd/MM/yyyy")}</span>
          <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))} className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 font-bold">Tuần sau {">"}</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">Đang tải lịch...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-bold text-gray-600 min-w-[200px]">Nhân viên</th>
                  {weekDays.map((date, idx) => (
                    <th key={idx} className="p-4 font-bold text-gray-600 text-center min-w-[120px] capitalize">
                      {format(date, "EEEE", { locale: vi })}
                      <div className="text-xs font-normal text-gray-400 mt-1">{format(date, "dd/MM/yyyy")}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{emp.fullName}</div>
                      <div className="text-xs text-gray-500">{emp.employeeType === 'PartTime' ? 'Part-time' : 'Full-time'}</div>
                    </td>
                    {weekDays.map((date, idx) => {
                      const daySchedules = schedules.filter(s => s.employeeId === emp.id && isSameDay(new Date(s.date), date));
                      return (
                        <td key={idx} className="p-2 border-l border-gray-100 relative group align-top h-24">
                          <div className="w-full h-full flex flex-col gap-2 p-1">
                            {daySchedules.map(sched => (
                              <div key={sched.id} className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs relative group/item">
                                <div className="font-bold text-blue-800">{sched.startTime} - {sched.endTime}</div>
                                {sched.notes && <div className="text-blue-600 truncate mt-0.5">{sched.notes}</div>}
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(sched.id); }} className="absolute -top-2 -right-2 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-sm">×</button>
                              </div>
                            ))}
                            <button onClick={() => handleCellClick(emp, date)} className="w-full h-full min-h-[40px] border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              + Thêm ca
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedEmployee && selectedDate && (
        <ScheduleModal
          employee={selectedEmployee}
          date={selectedDate}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchData(); }}
        />
      )}
    </div>
  );
}
