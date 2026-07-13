using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;

namespace MiniERP.API.Repositories
{
    public class PayrollRepository : IPayrollRepository
    {
        private readonly AppDbContext _context;

        public PayrollRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task SubmitTimesheetAsync(SubmitTimesheetDTO dto)
        {
            double totalHours = 0;
            if (dto.CheckOutTime.HasValue)
            {
                totalHours = (dto.CheckOutTime.Value - dto.CheckInTime).TotalHours - dto.BreakHours;
                if (totalHours < 0) totalHours = 0; // Đảm bảo không bị âm
            }

            var timesheet = new Timesheet
            {
                EmployeeId = dto.EmployeeId,
                Date = dto.Date,
                CheckInTime = dto.CheckInTime,
                CheckOutTime = dto.CheckOutTime,
                TotalHours = totalHours,
                Note = dto.Note
            };
            _context.Timesheets.Add(timesheet);
            await _context.SaveChangesAsync();
        }

        public async Task<List<TimesheetSummaryDTO>> GetTimesheetsSummaryAsync(int month, int year)
        {
            var employees = await _context.Employees.ToListAsync();
            var manualTimesheets = await _context.Timesheets
                .Where(t => t.Date.Month == month && t.Date.Year == year)
                .ToListAsync();
            
            var posShifts = await _context.WorkShifts
                .Where(ws => ws.Status == "Closed" && ws.StartTime.Month == month && ws.StartTime.Year == year)
                .ToListAsync();

            var schedules = await _context.EmployeeSchedules
                .Where(s => s.Date.Month == month && s.Date.Year == year)
                .ToListAsync();

            var result = new List<TimesheetSummaryDTO>();
            foreach (var emp in employees)
            {
                var manualHours = manualTimesheets.Where(t => t.EmployeeId == emp.Id).Sum(t => t.TotalHours);
                
                double posHours = 0;
                double scheduledHours = 0;

                var empSchedules = schedules.Where(s => s.EmployeeId == emp.Id).ToList();
                foreach(var sch in empSchedules)
                {
                    scheduledHours += (sch.EndTime - sch.StartTime).TotalHours;
                }

                var empShifts = posShifts.Where(ws => ws.EmployeeId == emp.Id).ToList();
                foreach (var shift in empShifts)
                {
                    if (shift.EndTime.HasValue)
                    {
                        var shiftDate = shift.StartTime.Date;
                        var dailySchedule = empSchedules.FirstOrDefault(s => s.Date.Date == shiftDate);
                        
                        if(dailySchedule != null)
                        {
                            var scheduledStart = dailySchedule.Date.Add(dailySchedule.StartTime);
                            var scheduledEnd = dailySchedule.Date.Add(dailySchedule.EndTime);
                            
                            var effectiveStart = shift.StartTime > scheduledStart ? shift.StartTime : scheduledStart;
                            var effectiveEnd = shift.EndTime.Value < scheduledEnd ? shift.EndTime.Value : scheduledEnd;
                            
                            var paidTime = (effectiveEnd - effectiveStart).TotalHours;
                            if(paidTime > 0)
                            {
                                posHours += paidTime;
                            }
                        }
                    }
                }

                if (manualHours > 0 || posHours > 0 || scheduledHours > 0)
                {
                    result.Add(new TimesheetSummaryDTO
                    {
                        EmployeeId = emp.Id,
                        EmployeeName = emp.FullName,
                        ScheduledHours = Math.Round(scheduledHours, 2),
                        ManualHours = Math.Round(manualHours, 2),
                        PosHours = Math.Round(posHours, 2)
                    });
                }
            }

            return result;
        }

        public async Task<List<TimesheetLogDTO>> GetEmployeeTimesheetLogsAsync(int employeeId, int month, int year)
        {
            var logs = new List<TimesheetLogDTO>();

            // Lấy từ POS (WorkShifts)
            var shifts = await _context.WorkShifts
                .Where(ws => ws.EmployeeId == employeeId && ws.Status == "Closed" && ws.StartTime.Month == month && ws.StartTime.Year == year)
                .ToListAsync();

            foreach(var shift in shifts)
            {
                if(shift.EndTime.HasValue)
                {
                    logs.Add(new TimesheetLogDTO
                    {
                        Date = shift.StartTime.Date,
                        Source = "Tự động từ POS",
                        Hours = Math.Round((shift.EndTime.Value - shift.StartTime).TotalHours, 2),
                        Details = $"{shift.StartTime:HH:mm} - {shift.EndTime.Value:HH:mm}"
                    });
                }
            }

            // Lấy từ Bù giờ thủ công (Timesheets)
            var manualTimesheets = await _context.Timesheets
                .Where(t => t.EmployeeId == employeeId && t.Date.Month == month && t.Date.Year == year)
                .ToListAsync();

            foreach(var manual in manualTimesheets)
            {
                logs.Add(new TimesheetLogDTO
                {
                    Date = manual.Date,
                    Source = "Chấm công tay (Bù giờ)",
                    Hours = manual.TotalHours,
                    Details = manual.Note ?? "Không có ghi chú"
                });
            }

            // Sắp xếp theo ngày
            return logs.OrderByDescending(l => l.Date).ToList();
        }

        public async Task<SalaryAdvance> CreateAdvanceAsync(CreateSalaryAdvanceDTO dto)
        {
            var advance = new SalaryAdvance
            {
                EmployeeId = dto.EmployeeId,
                Amount = dto.Amount,
                AdvanceDate = dto.AdvanceDate,
                Reason = dto.Reason,
                IsDeducted = false
            };

            _context.SalaryAdvances.Add(advance);
            await _context.SaveChangesAsync();
            return advance;
        }

        public async Task<List<SalaryAdvanceDTO>> GetAdvancesAsync(int month, int year)
        {
            return await _context.SalaryAdvances
                .Include(a => a.Employee)
                .Where(a => a.AdvanceDate.Month == month && a.AdvanceDate.Year == year)
                .Select(a => new SalaryAdvanceDTO
                {
                    Id = a.Id,
                    EmployeeId = a.EmployeeId,
                    EmployeeName = a.Employee!.FullName,
                    Amount = a.Amount,
                    AdvanceDate = a.AdvanceDate,
                    Reason = a.Reason,
                    IsDeducted = a.IsDeducted
                })
                .OrderByDescending(a => a.AdvanceDate)
                .ToListAsync();
        }

        // 🎯 ĐÂY LÀ HÀM SẼ ĐƯỢC CHẠY KHI BẤM NÚT TÍNH LƯƠNG
        public async Task<Salary> CalculateSalaryAsync(PayrollRequestDto request)
        {
            var employee = await _context.Employees.FindAsync(request.EmployeeId);
            if (employee == null) throw new Exception("Không tìm thấy thông tin nhân viên.");

            // Tự động quét bảng Timesheet (Chấm công thủ công)
            var timesheets = await _context.Timesheets
                .Where(t => t.EmployeeId == request.EmployeeId && t.Date.Month == request.Month && t.Date.Year == request.Year)
                .ToListAsync();

            // 🎯 Lấy thêm dữ liệu Mở/Đóng ca từ POS (WorkShifts)
            var workShifts = await _context.WorkShifts
                .Where(ws => ws.EmployeeId == request.EmployeeId 
                             && ws.Status == "Closed" 
                             && ws.StartTime.Month == request.Month 
                             && ws.StartTime.Year == request.Year)
                .ToListAsync();

            double totalWorkDays = 0;
            double totalHours = 0;
            decimal totalAmount = 0;

            // Tính tổng giờ từ chấm công tay
            double timesheetHours = timesheets.Sum(t => t.TotalHours);

            // Tính tổng giờ từ POS (EndTime - StartTime)
            double shiftHours = 0;
            foreach (var shift in workShifts)
            {
                if (shift.EndTime.HasValue)
                {
                    shiftHours += (shift.EndTime.Value - shift.StartTime).TotalHours;
                }
            }

            // Gộp cả 2 nguồn dữ liệu
            totalHours = timesheetHours + shiftHours;

            if (employee.EmployeeType == "PartTime")
            {
                totalAmount = (decimal)totalHours * employee.HourlyRate;
            }
            else // FullTime
            {
                // Một ngày công chuẩn là 8 tiếng. Quy đổi tổng số giờ ra ngày công, làm tròn 2 chữ số.
                totalWorkDays = Math.Round(totalHours / 8.0, 2); 
                totalAmount = (decimal)totalWorkDays * employee.DailySalary;
            }

            // TÌM TỔNG TẠM ỨNG CHƯA KHẤU TRỪ TRONG THÁNG
            var advances = await _context.SalaryAdvances
                .Where(a => a.EmployeeId == request.EmployeeId 
                            && a.AdvanceDate.Month == request.Month 
                            && a.AdvanceDate.Year == request.Year 
                            && !a.IsDeducted)
                .ToListAsync();

            decimal totalAdvance = advances.Sum(a => a.Amount);
            
            // TRỪ ĐI TẠM ỨNG ĐỂ RA THỰC NHẬN
            totalAmount = totalAmount - totalAdvance;
            if (totalAmount < 0) totalAmount = 0; // Đảm bảo không âm (nếu ứng lố)

            var existingSalary = await _context.Salaries
                .FirstOrDefaultAsync(s => s.EmployeeId == request.EmployeeId && s.Month == request.Month && s.Year == request.Year);

            if (existingSalary != null)
            {
                existingSalary.TotalWorkDays = totalWorkDays;
                existingSalary.TotalHours = totalHours;
                existingSalary.TotalAmount = totalAmount;
                existingSalary.AdvanceDeducted = totalAdvance; // Cập nhật số đã khấu trừ
                existingSalary.CalculatedAt = DateTime.Now;
                
                // Đánh dấu các khoản tạm ứng này đã được cấn trừ
                foreach(var advance in advances)
                {
                    advance.IsDeducted = true;
                }

                await _context.SaveChangesAsync();
                return existingSalary;
            }

            var newSalary = new Salary
            {
                EmployeeId = request.EmployeeId,
                Month = request.Month,
                Year = request.Year,
                TotalWorkDays = totalWorkDays,
                TotalHours = totalHours,
                TotalAmount = totalAmount,
                AdvanceDeducted = totalAdvance, // Lưu số đã khấu trừ
                CalculatedAt = DateTime.Now,
                IsPaid = false
            };

            // Đánh dấu các khoản tạm ứng này đã được cấn trừ
            foreach(var advance in advances)
            {
                advance.IsDeducted = true;
            }

            _context.Salaries.Add(newSalary);
            await _context.SaveChangesAsync();
            return newSalary;
        }

        public async Task<bool> MarkAsPaidAsync(int id)
        {
            var salary = await _context.Salaries.FindAsync(id);
            if (salary == null) return false;

            // Đổi trạng thái thành Đã thanh toán
            salary.IsPaid = true;
            await _context.SaveChangesAsync();

            return true;
        }
    }
}