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
            var timesheet = new Timesheet
            {
                EmployeeId = dto.EmployeeId,
                Date = dto.Date,
                Status = dto.Status,
                Note = dto.Note
            };
            _context.Timesheets.Add(timesheet);
            await _context.SaveChangesAsync();
        }

        // 🎯 ĐÂY LÀ HÀM SẼ ĐƯỢC CHẠY KHI BẤM NÚT TÍNH LƯƠNG
        public async Task<Salary> CalculateSalaryAsync(PayrollRequestDto request)
        {
            // 1. Tìm nhân viên để lấy mức lương ngày
            var employee = await _context.Employees.FindAsync(request.EmployeeId);
            if (employee == null) throw new Exception("Không tìm thấy thông tin nhân viên.");

            // 2. Tính lương = Ngày công x Lương cơ bản
            decimal totalAmount = (decimal)request.WorkDays * employee.DailySalary;

            // 3. Kiểm tra xem đã tính lương tháng này chưa
            var existingSalary = await _context.Salaries
                .FirstOrDefaultAsync(s => s.EmployeeId == request.EmployeeId && s.Month == request.Month && s.Year == request.Year);

            if (existingSalary != null)
            {
                // Nếu có rồi thì cập nhật lại số tiền và ngày công
                existingSalary.TotalWorkDays = request.WorkDays;
                existingSalary.TotalAmount = totalAmount;
                existingSalary.CalculatedAt = DateTime.Now;
                await _context.SaveChangesAsync();
                return existingSalary;
            }
            else
            {
                // Nếu chưa có thì tạo mới phiếu lương
                var newSalary = new Salary
                {
                    EmployeeId = request.EmployeeId,
                    Month = request.Month,
                    Year = request.Year,
                    TotalWorkDays = request.WorkDays,
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