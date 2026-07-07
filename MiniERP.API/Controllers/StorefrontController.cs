using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.Entities;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous] // Cho phép tất cả khách hàng truy cập
    public class StorefrontController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StorefrontController(AppDbContext context)
        {
            _context = context;
        }

        // 🎯 [NEW] Lấy Banner đang kích hoạt cho Storefront
        [HttpGet("banners/active")]
        public async Task<IActionResult> GetActiveBanner()
        {
            var banner = await _context.Banners
                .Where(b => b.IsActive)
                .OrderByDescending(b => b.CreatedAt)
                .FirstOrDefaultAsync();

            if (banner == null) return NotFound("No active banner");

            return Ok(banner);
        }

        // 🎯 [NEW] Lấy danh sách danh mục hàng hóa hiển thị lên trang chủ
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.ImageUrl
                })
                .ToListAsync();

            return Ok(categories);
        }

        // Lấy danh sách sản phẩm hiển thị trên Web (chỉ lấy SP đang kinh doanh và còn tồn kho)
        [HttpGet("products")]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive)
                .Select(p => new
                {
                    p.Id,
                    p.ProductCode,
                    p.ProductName,
                    p.Price,
                    p.ImageUrl,
                    p.ViewCount,
                    p.IsNew,
                    p.Description,
                    CategoryName = p.Category != null ? p.Category.Name : "Không có"
                })
                .ToListAsync();

            return Ok(products);
        }

        // Lấy chi tiết 1 sản phẩm
        [HttpGet("products/{id}")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.IsActive && p.Id == id)
                .Select(p => new
                {
                    p.Id,
                    p.ProductCode,
                    p.ProductName,
                    p.Price,
                    p.Quantity,
                    p.ImageUrl,
                    p.ViewCount,
                    p.IsNew,
                    p.Description,
                    CategoryName = p.Category != null ? p.Category.Name : "Không có"
                })
                .FirstOrDefaultAsync();

            if (product == null) return NotFound("Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.");

            return Ok(product);
        }

        // Khách hàng đặt đơn
        public class OnlineOrderRequest
        {
            public string FullName { get; set; } = null!;
            public string Phone { get; set; } = null!;
            public string Address { get; set; } = null!;
            public string? Note { get; set; }
            public string PaymentMethod { get; set; } = "COD";
            public string? ShippingMethod { get; set; }
            public decimal ShippingFee { get; set; } = 0;
            public List<OnlineOrderDetail> Details { get; set; } = new();
        }

        public class OnlineOrderDetail
        {
            public int ProductId { get; set; }
            public int Quantity { get; set; }
        }

        [HttpPost("orders")]
        public async Task<IActionResult> CreateOrder([FromBody] OnlineOrderRequest request)
        {
            if (request.Details == null || !request.Details.Any())
                return BadRequest("Giỏ hàng trống!");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Tìm hoặc tạo Khách hàng dựa vào Số điện thoại
                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Phone == request.Phone);
                if (customer == null)
                {
                    customer = new Customer
                    {
                        CustomerCode = "CUS_" + DateTime.Now.Ticks.ToString().Substring(8),
                        FullName = request.FullName,
                        Phone = request.Phone,
                        Address = request.Address
                    };
                    _context.Customers.Add(customer);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Cập nhật tên và địa chỉ mới nếu họ thay đổi
                    customer.FullName = request.FullName;
                    customer.Address = request.Address;
                    _context.Customers.Update(customer);
                    await _context.SaveChangesAsync();
                }

                // 2. Tạo Đơn hàng mới
                var order = new Order
                {
                    CustomerId = customer.Id,
                    EmployeeId = null, // Đơn online không có nhân viên xử lý ban đầu
                    WorkShiftId = null,
                    OrderDate = DateTime.Now,
                    AmountPaid = 0,
                    PaymentMethod = request.PaymentMethod,
                    ShippingMethod = request.ShippingMethod,
                    ShippingAddress = request.Address,
                    ShippingFee = request.ShippingFee,
                    Note = "Đơn Online: " + request.Note,
                    Status = "Pending", // Trạng thái chờ duyệt
                    TotalAmount = request.ShippingFee // Cộng dồn tiền hàng sau
                };

                // 3. Xử lý Chi tiết Đơn hàng & Tồn kho
                foreach (var item in request.Details)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null) throw new Exception($"Sản phẩm ID {item.ProductId} không tồn tại!");
                    
                    if (product.Quantity < item.Quantity)
                        throw new Exception($"'{product.ProductName}' chỉ còn {product.Quantity} sản phẩm trong kho.");

                    // Tạm thời trừ tồn kho để giữ hàng
                    product.Quantity -= item.Quantity;

                    var orderDetail = new OrderDetail
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = product.Price,
                        UnitCost = product.CostPrice
                    };

                    order.TotalAmount += (item.Quantity * product.Price);
                    order.OrderDetails.Add(orderDetail);
                }

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // Ghi nhận lịch sử xuất kho
                foreach (var detail in order.OrderDetails)
                {
                    _context.InventoryTransactions.Add(new InventoryTransaction
                    {
                        TransactionDate = DateTime.Now,
                        ProductId = detail.ProductId,
                        TransactionType = "SALE",
                        Quantity = -detail.Quantity,
                        ReferenceId = order.Id,
                        Note = "Xuất kho tạm cho đơn Online"
                    });
                }
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new { Message = "Đặt hàng thành công", OrderId = order.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        // Lấy danh sách bài viết Journal
        [HttpGet("posts")]
        public async Task<IActionResult> GetPosts()
        {
            var posts = await _context.Posts
                .OrderByDescending(p => p.PublishDate)
                .ToListAsync();
            return Ok(posts);
        }

        // Lấy chi tiết bài viết Journal
        [HttpGet("posts/{id}")]
        public async Task<IActionResult> GetPostById(int id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound("Bài viết không tồn tại.");
            return Ok(post);
        }
    }
}
