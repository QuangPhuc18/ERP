using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context) => _context = context;

        // 1. Lấy danh sách Hóa đơn
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.Employee)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Select(o => new {
                    o.Id,
                    CustomerName = o.Customer != null ? o.Customer.FullName : "Khách vãng lai",
                    EmployeeName = o.Employee != null ? o.Employee.FullName : "System",
                    o.OrderDate,
                    o.TotalAmount,
                    o.AmountPaid,
                    o.PaymentMethod,
                    o.Note,
                    o.Status,
                    Details = o.OrderDetails.Select(od => new {
                        ProductName = od.Product != null ? od.Product.ProductName : "SP đã xóa",
                        od.Quantity,
                        od.UnitPrice,
                        SubTotal = od.Quantity * od.UnitPrice
                    })
                })
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return Ok(orders);
        }

        // 1.5 Lấy danh sách hóa đơn trong ca làm việc HIỆN TẠI của nhân viên
        [HttpGet("CurrentShift")]
        public async Task<IActionResult> GetCurrentShiftOrders()
        {
            var empIdClaim = User.FindFirst("EmployeeId")?.Value;
            if (!int.TryParse(empIdClaim, out int empId)) return BadRequest("Không tìm thấy thông tin nhân viên trong Token!");

            var currentShift = await _context.WorkShifts
                .Where(s => s.EmployeeId == empId && s.Status == "Open")
                .OrderByDescending(s => s.StartTime)
                .FirstOrDefaultAsync();

            if (currentShift == null)
            {
                return Ok(new List<object>()); // Trả về list rỗng nếu chưa mở ca
            }

            var orders = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Where(o => o.WorkShiftId == currentShift.Id)
                .Select(o => new {
                    o.Id,
                    CustomerName = o.Customer != null ? o.Customer.FullName : "Khách vãng lai",
                    o.OrderDate,
                    o.TotalAmount,
                    o.AmountPaid,
                    o.PaymentMethod,
                    o.Note,
                    o.Status,
                    Details = o.OrderDetails.Select(od => new {
                        ProductName = od.Product != null ? od.Product.ProductName : "SP đã xóa",
                        od.Quantity,
                        od.UnitPrice,
                        SubTotal = od.Quantity * od.UnitPrice
                    })
                })
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return Ok(orders);
        }

        // 2. Tạo Hóa đơn & Trừ tồn kho (BÁN HÀNG POS)
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDTO dto)
        {
            if (dto.Details == null || !dto.Details.Any())
                return BadRequest("Đơn hàng phải có ít nhất 1 sản phẩm!");

            // Nếu có gửi CustomerId lên thì mới kiểm tra xem khách đó có tồn tại không
            if (dto.CustomerId.HasValue)
            {
                var customerExists = await _context.Customers.AnyAsync(c => c.Id == dto.CustomerId.Value);
                if (!customerExists) return BadRequest("Khách hàng không tồn tại!");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Lấy EmployeeId từ Token
                var employeeIdClaim = User.FindFirst("EmployeeId")?.Value;
                int? employeeId = null;
                if (int.TryParse(employeeIdClaim, out int empId))
                {
                    employeeId = empId;
                }

                var order = new Order
                {
                    CustomerId = dto.CustomerId,
                    EmployeeId = employeeId,
                    WorkShiftId = dto.WorkShiftId,
                    OrderDate = DateTime.Now,
                    AmountPaid = dto.AmountPaid,
                    PaymentMethod = dto.PaymentMethod,
                    Note = dto.Note,
                    Status = "Completed", // Sẽ được kiểm tra lại ở dưới
                    TotalAmount = 0 // Sẽ được tính lại ở dưới để đảm bảo bảo mật
                };

                foreach (var item in dto.Details)
                {
                    var product = await _context.Products
                        .Include(p => p.ProductUoMs)
                        .FirstOrDefaultAsync(p => p.Id == item.ProductId);
                        
                    if (product == null)
                        throw new Exception($"Sản phẩm ID {item.ProductId} không tồn tại!");

                    int conversionFactor = 1;
                    decimal actualPrice = product.Price;
                    string? unitName = null;

                    // Nếu khách hàng mua bằng một Đơn vị quy đổi (Ví dụ: Thùng)
                    if (item.UnitId.HasValue && item.UnitId.Value != product.UnitId)
                    {
                        var uom = product.ProductUoMs.FirstOrDefault(u => u.UnitId == item.UnitId.Value);
                        if (uom != null)
                        {
                            conversionFactor = uom.ConversionFactor;
                            actualPrice = uom.Price;
                            var unit = await _context.Units.FindAsync(uom.UnitId);
                            if (unit != null) unitName = unit.Name;
                        }
                    }

                    int totalDeductedQuantity = item.Quantity * conversionFactor;

                    if (product.Quantity < totalDeductedQuantity)
                        throw new Exception($"'{product.ProductName}' không đủ hàng (Tồn: {product.Quantity}, Yêu cầu: {totalDeductedQuantity}).");

                    // Trừ tồn kho (Theo đơn vị cơ bản)
                    product.Quantity -= totalDeductedQuantity;

                    // Lấy giá thực tế từ Database để chống hack giá từ Frontend
                    var orderDetail = new OrderDetail
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = actualPrice,
                        UnitCost = product.CostPrice * conversionFactor,
                        ConversionFactor = conversionFactor,
                        UnitName = unitName
                    };

                    order.TotalAmount += (item.Quantity * actualPrice);
                    order.OrderDetails.Add(orderDetail);
                }

                // Xác định trạng thái công nợ
                if (order.AmountPaid < order.TotalAmount)
                {
                    order.Status = "Debt"; // Ghi nợ nếu trả chưa đủ
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Ghi nhận lịch sử xuất kho (SALE)
                foreach (var item in dto.Details)
                {
                    int conversionFactor = 1;
                    if (item.UnitId.HasValue)
                    {
                        var productUoMs = _context.ProductUoMs.Where(u => u.ProductId == item.ProductId).ToList();
                        var uom = productUoMs.FirstOrDefault(u => u.UnitId == item.UnitId.Value);
                        if (uom != null) conversionFactor = uom.ConversionFactor;
                    }

                    _context.InventoryTransactions.Add(new InventoryTransaction
                    {
                        TransactionDate = DateTime.Now,
                        ProductId = item.ProductId,
                        TransactionType = "SALE",
                        Quantity = - (item.Quantity * conversionFactor),
                        ReferenceId = order.Id,
                        Note = "Xuất kho bán hàng POS"
                    });
                }
                await _context.SaveChangesAsync();
                
                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = "Tạo đơn hàng thành công!",
                    OrderId = order.Id,
                    TotalAmount = order.TotalAmount
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        // 3. Hủy hóa đơn & Hoàn kho
        [HttpPut("{id}/cancel")]
        [Authorize(Roles = "admin,Admin")]
        public async Task<IActionResult> CancelOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound("Không tìm thấy hóa đơn này!");
            if (order.Status == "Cancelled") return BadRequest("Đơn hàng này đã bị hủy từ trước!");

            order.Status = "Cancelled";

            foreach (var detail in order.OrderDetails)
            {
                var product = await _context.Products.FindAsync(detail.ProductId);
                if (product != null)
                {
                    int baseQuantity = detail.Quantity * (detail.ConversionFactor > 0 ? detail.ConversionFactor : 1);
                    product.Quantity += baseQuantity; // Trả lại kho chính xác theo đơn vị quy đổi

                    // Ghi nhận lịch sử nhập lại kho (CANCEL)
                    _context.InventoryTransactions.Add(new InventoryTransaction
                    {
                        TransactionDate = DateTime.Now,
                        ProductId = product.Id,
                        TransactionType = "CANCEL_SALE",
                        Quantity = baseQuantity,
                        ReferenceId = order.Id,
                        Note = $"Hoàn kho do hủy đơn bán hàng ({detail.Quantity} {detail.UnitName ?? "Đơn vị cơ bản"})"
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Hủy đơn và hoàn kho thành công!" });
        }
    }
}