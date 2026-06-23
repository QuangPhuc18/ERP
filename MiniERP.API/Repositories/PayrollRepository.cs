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

        // 🎯 ĐÂY LÀ HÀM SẼ ĐƯỢC CHẠY KHI BẤM NÚT TÍNH LƯƠNG
        public async Task<Salary> CalculateSalaryAsync(PayrollRequestDto request)
        {
            var employee = await _context.Employees.FindAsync(request.EmployeeId);
            if (employee == null) throw new Exception("Không tìm thấy thông tin nhân viên.");

            // Tự động quét bảng Timesheet thay vì tin tưởng WorkDays từ Frontend
            var timesheets = await _context.Timesheets
                .Where(t => t.EmployeeId == request.EmployeeId && t.Date.Month == request.Month && t.Date.Year == request.Year)
                .ToListAsync();

            double totalWorkDays = 0;
            double totalHours = 0;
            decimal totalAmount = 0;

            if (employee.EmployeeType == "PartTime")
            {
                totalHours = timesheets.Sum(t => t.TotalHours);
                totalAmount = (decimal)totalHours * employee.HourlyRate;
            }
            else // FullTime
            {
                totalHours = timesheets.Sum(t => t.TotalHours);
                // Một ngày công chuẩn là 8 tiếng. Quy đổi tổng số giờ ra ngày công, làm tròn 2 chữ số.
                totalWorkDays = Math.Round(totalHours / 8.0, 2); 
                totalAmount = (decimal)totalWorkDays * employee.DailySalary;
            }

            var existingSalary = await _context.Salaries
                .FirstOrDefaultAsync(s => s.EmployeeId == request.EmployeeId && s.Month == request.Month && s.Year == request.Year);

            if (existingSalary != null)
            {
                existingSalary.TotalWorkDays = totalWorkDays;
                existingSalary.TotalHours = totalHours;
                existingSalary.TotalAmount = totalAmount;
                existingSalary.CalculatedAt = DateTime.Now;
                await _context.SaveChangesAsync();
                return existingSalary;
            }
            else
            {
                var newSalary = new Salary
                {
                    EmployeeId = request.EmployeeId,
                    Month = request.Month,
                    Year = request.Year,
                    TotalWorkDays = totalWorkDays,
                    TotalHours = totalHours,
                    TotalAmount = totalAmount,
                    CalculatedAt = DateTime.Now
                };
                _context.Salaries.Add(newSalary);
                await _context.SaveChangesAsync();
                return newSalary;
            }
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