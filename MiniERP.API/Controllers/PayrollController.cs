using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.DTOs;
using MiniERP.API.Repositories;
using MiniERP.API.Data;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,admin")]
    public class PayrollController : ControllerBase
    {
        private readonly IPayrollRepository _repository;
        private readonly AppDbContext _context;

        public PayrollController(IPayrollRepository repository, AppDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        // 🎯 API LẤY DANH SÁCH BẢNG CÔNG
        [HttpGet("timesheets-summary")]
        public async Task<IActionResult> GetTimesheetsSummary([FromQuery] int month, [FromQuery] int year)
        {
            var summary = await _repository.GetTimesheetsSummaryAsync(month, year);
            return Ok(summary);
        }

        [HttpGet("timesheet-logs")]
        public async Task<IActionResult> GetTimesheetLogs([FromQuery] int employeeId, [FromQuery] int month, [FromQuery] int year)
        {
            var logs = await _repository.GetEmployeeTimesheetLogsAsync(employeeId, month, year);
            return Ok(logs);
        }

        // 🎯 API LẤY DANH SÁCH LƯƠNG ĐÃ TÍNH
        [HttpGet("list")]
        public async Task<IActionResult> GetPayrollList([FromQuery] int month, [FromQuery] int year)
        {
            var list = await _context.Salaries
                .Include(s => s.Employee)
                .Where(s => s.Month == month && s.Year == year)
                .Select(s => new {
                    Id = s.Id,
                    EmployeeName = s.Employee.FullName,
                    TotalWorkDays = s.TotalWorkDays,
                    TotalAmount = s.TotalAmount,
                    CalculatedAt = s.CalculatedAt,
                    IsPaid = s.IsPaid // 🎯 THÊM DÒNG NÀY ĐỂ FRONTEND BIẾT TRẠNG THÁI
                })
                .OrderByDescending(s => s.CalculatedAt)
                .ToListAsync();

            return Ok(list);
        }

        [HttpPost("timesheet")]
        public async Task<IActionResult> SubmitTimesheet([FromBody] SubmitTimesheetDTO dto)
        {
            if (dto.CheckInTime == default)
                return BadRequest("Giờ Check-in không hợp lệ.");

            if (dto.CheckOutTime.HasValue && dto.CheckOutTime <= dto.CheckInTime)
                return BadRequest("Giờ Check-out phải lớn hơn giờ Check-in.");

            await _repository.SubmitTimesheetAsync(dto);
            return Ok("Ghi nhận chấm công thành công!");
        }

        [HttpPost("calculate")]
        public async Task<IActionResult> CalculateSalary([FromBody] PayrollRequestDto request)
        {
            if (request.Month < 1 || request.Month > 12)
            {
                return BadRequest($"Tháng không hợp lệ! Bạn gửi lên giá trị: {request.Month}");
            }

            try
            {
                // 🎯 GỌI ĐÚNG HÀM VÀ TRUYỀN TOÀN BỘ REQUEST VÀO
                var salary = await _repository.CalculateSalaryAsync(request);

                return Ok(new
                {
                    Message = "Tính lương thành công!",
                    Data = salary
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpPut("{id}/pay")]
        public async Task<IActionResult> MarkAsPaid(int id)
        {
            var success = await _repository.MarkAsPaidAsync(id);
            if (!success) return NotFound("Không tìm thấy phiếu lương này.");

            return Ok(new { Message = "Đã cập nhật trạng thái thành Đã chi trả!" });
        }

        // 🎯 API LẤY DANH SÁCH TẠM ỨNG
        [HttpGet("advances")]
        public async Task<IActionResult> GetAdvances([FromQuery] int month, [FromQuery] int year)
        {
            var advances = await _repository.GetAdvancesAsync(month, year);
            return Ok(advances);
        }

        // 🎯 API TẠO MỚI TẠM ỨNG
        [HttpPost("advances")]
        public async Task<IActionResult> CreateAdvance([FromBody] CreateSalaryAdvanceDTO dto)
        {
            if (dto.Amount <= 0) return BadRequest("Số tiền tạm ứng phải lớn hơn 0.");
            if (dto.EmployeeId <= 0) return BadRequest("Nhân viên không hợp lệ.");

            var advance = await _repository.CreateAdvanceAsync(dto);
            return Ok(new { Message = "Tạo tạm ứng thành công!", Data = advance });
        }
    }

   
}