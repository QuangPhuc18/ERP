using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;
using System.Security.Claims;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WorkShiftsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WorkShiftsController(AppDbContext context) => _context = context;

        // 1. Lấy trạng thái Ca hiện tại của nhân viên đang đăng nhập
        [HttpGet("Current")]
        public async Task<IActionResult> GetCurrentShift()
        {
            var empIdClaim = User.FindFirst("EmployeeId")?.Value;
            if (!int.TryParse(empIdClaim, out int empId)) return BadRequest("Không tìm thấy thông tin nhân viên trong Token!");

            var shift = await _context.WorkShifts
                .Where(s => s.EmployeeId == empId && s.Status == "Open")
                .OrderByDescending(s => s.StartTime)
                .FirstOrDefaultAsync();

            if (shift == null) return NotFound("Chưa mở ca");
            
            return Ok(shift);
        }

        // 2. Lấy danh sách tất cả các Ca (dành cho Admin/Quản lý)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var shifts = await _context.WorkShifts
                .OrderByDescending(s => s.StartTime)
                .Select(s => new {
                    s.Id,
                    s.EmployeeId,
                    s.EmployeeName,
                    s.StartTime,
                    s.EndTime,
                    s.StartingCash,
                    ExpectedCash = s.Status == "Closed" ? s.ExpectedCash : s.StartingCash + (_context.Orders.Where(o => o.WorkShiftId == s.Id && o.Status != "Cancelled" && o.PaymentMethod == "Cash").Sum(o => (decimal?)o.AmountPaid) ?? 0),
                    ExpectedTransfer = s.Status == "Closed" ? s.ExpectedTransfer : _context.Orders.Where(o => o.WorkShiftId == s.Id && o.Status != "Cancelled" && (o.PaymentMethod == "Transfer" || o.PaymentMethod == "Card")).Sum(o => (decimal?)o.AmountPaid) ?? 0,
                    ExpectedDebt = s.Status == "Closed" ? s.ExpectedDebt : _context.Orders.Where(o => o.WorkShiftId == s.Id && o.Status != "Cancelled" && o.AmountPaid < o.TotalAmount).Sum(o => (decimal?)(o.TotalAmount - o.AmountPaid) ?? 0),
                    s.ActualCash,
                    s.Variance,
                    s.Status,
                    TotalItems = _context.OrderDetails.Where(od => od.Order.WorkShiftId == s.Id && od.Order.Status != "Cancelled").Sum(od => (int?)od.Quantity) ?? 0
                })
                .ToListAsync();

            return Ok(shifts);
        }

        // 3. Mở Ca mới
        [HttpPost("Open")]
        public async Task<IActionResult> OpenShift([FromBody] WorkShiftCreateDTO dto)
        {
            var empIdClaim = User.FindFirst("EmployeeId")?.Value;
            if (!int.TryParse(empIdClaim, out int empId)) return BadRequest("Lỗi xác thực nhân viên!");

            var employee = await _context.Employees.FindAsync(empId);
            var empName = employee?.FullName ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "Unknown";

            // Kiểm tra xem đã có ca nào Open chưa
            var existingShift = await _context.WorkShifts
                .AnyAsync(s => s.EmployeeId == empId && s.Status == "Open");
            
            if (existingShift) return BadRequest("Bạn đang có một ca làm việc chưa đóng. Vui lòng đóng ca trước khi mở ca mới!");

            var shift = new WorkShift
            {
                EmployeeId = empId,
                EmployeeName = empName,
                StartTime = DateTime.Now,
                StartingCash = dto.StartingCash,
                Status = "Open"
            };

            _context.WorkShifts.Add(shift);
            await _context.SaveChangesAsync();

            return Ok(shift);
        }

        // 4. Đóng Ca (Đếm tiền mù)
        [HttpPost("{id}/Close")]
        public async Task<IActionResult> CloseShift(int id, [FromBody] WorkShiftCloseDTO dto)
        {
            var shift = await _context.WorkShifts.FindAsync(id);
            if (shift == null) return NotFound("Không tìm thấy ca làm việc!");
            if (shift.Status == "Closed") return BadRequest("Ca này đã được đóng trước đó!");

            // Tính toán số liệu từ các đơn hàng trong ca
            var orders = await _context.Orders
                .Where(o => o.WorkShiftId == id && o.Status != "Cancelled")
                .ToListAsync();

            decimal expectedCash = shift.StartingCash;
            decimal expectedTransfer = 0;
            decimal expectedDebt = 0;

            foreach (var order in orders)
            {
                if (order.PaymentMethod == "Cash")
                {
                    expectedCash += order.AmountPaid;
                }
                else if (order.PaymentMethod == "Transfer" || order.PaymentMethod == "Card")
                {
                    expectedTransfer += order.AmountPaid;
                }

                // Tiền còn nợ
                if (order.AmountPaid < order.TotalAmount)
                {
                    expectedDebt += (order.TotalAmount - order.AmountPaid);
                }
            }

            shift.ExpectedCash = expectedCash;
            shift.ExpectedTransfer = expectedTransfer;
            shift.ExpectedDebt = expectedDebt;

            shift.ActualCash = dto.ActualCash;
            shift.Variance = shift.ActualCash - shift.ExpectedCash;

            shift.EndTime = DateTime.Now;
            shift.Status = "Closed";

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Chốt ca thành công!",
                Shift = shift
            });
        }
    }
}
