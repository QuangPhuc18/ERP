using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;
using Microsoft.AspNetCore.SignalR;
using MiniERP.API.Hubs;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<AppHub> _hubContext;

        public OrdersController(AppDbContext context, IHubContext<AppHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

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
            Customer? customer = null;
            if (dto.CustomerId.HasValue)
            {
                customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == dto.CustomerId.Value);
                if (customer == null) return BadRequest("Khách hàng không tồn tại!");
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
                    AmountPaid = dto.PaymentMethod == "Transfer" ? 0 : dto.AmountPaid,
                    PaymentMethod = dto.PaymentMethod,
                    Note = dto.Note,
                    Status = dto.PaymentMethod == "Transfer" ? "PendingPayment" : "Completed", // Sẽ được kiểm tra lại ở dưới
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

                // 🎯 XỬ LÝ ĐIỂM (LOYALTY POINTS) CHO KHÁCH HÀNG (NẾU CÓ)
                if (customer != null)
                {
                    if (dto.PointsUsed > 0)
                    {
                        if (customer.RewardPoints < dto.PointsUsed)
                            throw new Exception("Điểm tích lũy của khách hàng không đủ!");

                        // Trừ điểm và tính tiền giảm (1 điểm = 1đ)
                        customer.RewardPoints -= dto.PointsUsed;
                        order.RewardPointsUsed = dto.PointsUsed;
                        order.DiscountFromPoints = dto.PointsUsed;

                        // Giảm tổng tiền
                        order.TotalAmount -= order.DiscountFromPoints;
                        if (order.TotalAmount < 0) order.TotalAmount = 0;
                    }

                    // Tích điểm mới: 1% tổng tiền sau giảm (1đ = 1 điểm)
                    order.RewardPointsEarned = (int)Math.Floor(order.TotalAmount * 0.01m);
                    customer.RewardPoints += order.RewardPointsEarned;
                    
                    _context.Customers.Update(customer);
                }
                else if (dto.PointsUsed > 0)
                {
                    throw new Exception("Không thể dùng điểm nếu không có thông tin khách hàng!");
                }

                // Xác định trạng thái công nợ
                if (order.PaymentMethod != "Transfer" && order.AmountPaid < order.TotalAmount)
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

                // Bắn thông báo Realtime để cập nhật tồn kho cho các máy POS khác
                await _hubContext.Clients.All.SendAsync("InventoryUpdated");

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
        [Authorize(Roles = "admin,Admin,cashier,Cashier")]
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

        // 4. Lấy chi tiết đơn hàng
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();

            return Ok(new {
                order.Id,
                order.Status,
                order.TotalAmount,
                order.AmountPaid,
                order.PaymentMethod
            });
        }

        // 5. Xác nhận thanh toán thủ công (Dự phòng)
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> ManualConfirmOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound("Không tìm thấy đơn hàng");
            if (order.Status == "Completed") return BadRequest("Đơn hàng đã hoàn thành trước đó");

            order.Status = "Completed";
            order.AmountPaid = order.TotalAmount; // Đã trả đủ
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xác nhận thanh toán thành công!" });
        }

        // 6. Webhook nhận tiền từ SePay / VietQR
        [HttpPost("webhook/sepay")]
        public async Task<IActionResult> SePayWebhook([FromBody] SePayWebhookDTO dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.content))
                return BadRequest("Dữ liệu webhook không hợp lệ");

            if (dto.transferType != "in")
                return Ok(new { Message = "Bỏ qua giao dịch tiền ra" });

            // Trích xuất mã đơn hàng. Regex tìm "DH105" -> id = 105
            var match = System.Text.RegularExpressions.Regex.Match(dto.content, @"DH(\d+)");
            if (match.Success)
            {
                int orderId = int.Parse(match.Groups[1].Value);
                var order = await _context.Orders.FindAsync(orderId);
                
                if (order != null && order.Status == "PendingPayment")
                {
                    order.AmountPaid += dto.transferAmount;
                    
                    if (order.AmountPaid >= order.TotalAmount)
                    {
                        order.Status = "Completed";
                    }
                    
                    await _context.SaveChangesAsync();
                    
                    // Phát thông báo Realtime cho các máy POS
                    await _hubContext.Clients.All.SendAsync("PaymentReceived", orderId, dto.transferAmount);
                    
                    return Ok(new { Message = $"Đã cập nhật trạng thái đơn hàng {orderId}" });
                }
            }

            return Ok(new { Message = "Không khớp được đơn hàng nào" });
        }

        // Cập nhật trạng thái đơn hàng (Đặc biệt cho đơn Online)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "admin,Admin,cashier,Cashier")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] string newStatus)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails) // Lấy kèm chi tiết để phòng trường hợp hoàn kho
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound("Không tìm thấy đơn hàng");

            // Nếu đơn hàng bị HỦY và trạng thái trước đó chưa bị HỦY
            if (newStatus == "Cancelled" && order.Status != "Cancelled")
            {
                foreach (var detail in order.OrderDetails)
                {
                    // Trả lại số lượng vào kho
                    var product = await _context.Products.FindAsync(detail.ProductId);
                    if (product != null)
                    {
                        product.Quantity += detail.Quantity;
                        
                        // Ghi nhận lịch sử hoàn kho
                        _context.InventoryTransactions.Add(new InventoryTransaction
                        {
                            TransactionDate = DateTime.Now,
                            ProductId = detail.ProductId,
                            Quantity = detail.Quantity,
                            TransactionType = "IMPORT", // Hoàn kho coi như nhập
                            ReferenceId = order.Id,
                            Note = $"Hoàn kho do Hủy đơn Online #{order.Id}"
                        });
                    }
                }
                
                // Bắn SignalR cập nhật tồn kho cho web
                await _hubContext.Clients.All.SendAsync("InventoryUpdated");
            }

            order.Status = newStatus;
            await _context.SaveChangesAsync();
            
            // Bắn tín hiệu Realtime cập nhật trạng thái
            await _hubContext.Clients.All.SendAsync("OrderStatusChanged", id, newStatus);
            
            return Ok(new { Message = "Đã cập nhật trạng thái đơn hàng thành công" });
        }
    }
}