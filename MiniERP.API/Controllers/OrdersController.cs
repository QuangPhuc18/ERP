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
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Product)
                .Select(o => new {
                    o.Id,
                    CustomerName = o.Customer != null ? o.Customer.FullName : "Khách vãng lai",
                    o.OrderDate,
                    o.TotalAmount,
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
                var order = new Order
                {
                    CustomerId = dto.CustomerId,
                    OrderDate = DateTime.Now,
                    Status = "Completed",
                    TotalAmount = 0 // Sẽ được tính lại ở dưới để đảm bảo bảo mật
                };

                foreach (var item in dto.Details)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                        throw new Exception($"Sản phẩm ID {item.ProductId} không tồn tại!");

                    if (product.Quantity < item.Quantity)
                        throw new Exception($"'{product.ProductName}' không đủ hàng (Tồn: {product.Quantity}).");

                    // Trừ tồn kho
                    product.Quantity -= item.Quantity;

                    // Lấy giá thực tế từ Database để chống hack giá từ Frontend
                    var orderDetail = new OrderDetail
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price
                    };

                    order.TotalAmount += (item.Quantity * product.Price);
                    order.OrderDetails.Add(orderDetail);
                }

                _context.Orders.Add(order);
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
                    product.Quantity += detail.Quantity; // Trả lại kho
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Hủy đơn và hoàn kho thành công!" });
        }
    }
}