using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("full-stats")]
        public async Task<IActionResult> GetFullStats()
        {
            var now = DateTime.Now;
            var firstDayOfMonth = new DateTime(now.Year, now.Month, 1);
            var sixMonthsAgo = new DateTime(now.Year, now.Month, 1).AddMonths(-5);

            // 1. KPI Cards
            var totalProducts = await _context.Products.CountAsync();
            var totalOrders = await _context.Orders.CountAsync();
            var totalCustomers = await _context.Customers.CountAsync();
            var monthlyRevenue = await _context.Orders
                .Where(o => o.OrderDate >= firstDayOfMonth && o.Status != "Cancelled")
                .SumAsync(o => o.TotalAmount);

            // 2. Doanh thu 6 tháng gần nhất
            var sixMonthOrders = await _context.Orders
                .Where(o => o.OrderDate >= sixMonthsAgo && o.Status != "Cancelled")
                .ToListAsync();

            var revenueByMonth = sixMonthOrders
                .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                .Select(g => new {
                    Month = $"T{g.Key.Month}",
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .ToList();

            // 3. Top sản phẩm bán chạy
            var topProducts = await _context.OrderDetails
                .Include(od => od.Product)
                .Where(od => od.Order.Status != "Cancelled")
                .GroupBy(od => od.ProductId)
                .Select(g => new {
                    ProductName = g.First().Product != null ? g.First().Product.ProductName : "Sản phẩm đã xóa",
                    SoldQuantity = g.Sum(od => od.Quantity)
                })
                .OrderByDescending(x => x.SoldQuantity)
                .Take(5)
                .ToListAsync();

            // 4. Thống kê đơn hàng theo trạng thái
            var orderStats = await _context.Orders
                .GroupBy(o => o.Status)
                .Select(g => new {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            // 5. Thống kê tồn kho (Sắp hết hàng)
            var lowStockProducts = await _context.Products
                .Where(p => p.Quantity <= 5)
                .Select(p => new {
                    p.ProductName,
                    p.Quantity
                })
                .OrderBy(p => p.Quantity)
                .Take(5)
                .ToListAsync();

            // 6. Doanh thu theo danh mục
            var categoryRevenue = await _context.OrderDetails
                .Include(od => od.Product)
                .ThenInclude(p => p.Category)
                .Where(od => od.Order.Status != "Cancelled")
                .GroupBy(od => od.Product.Category != null ? od.Product.Category.Name : "Chưa phân loại")
                .Select(g => new {
                    CategoryName = g.Key,
                    Revenue = g.Sum(od => od.Quantity * od.UnitPrice)
                })
                .ToListAsync();

            // 7. Khách hàng mua nhiều nhất
            var topCustomers = await _context.Orders
                .Include(o => o.Customer)
                .Where(o => o.CustomerId != null && o.Status != "Cancelled")
                .GroupBy(o => o.CustomerId)
                .Select(g => new {
                    CustomerName = g.First().Customer != null ? g.First().Customer.FullName : "Khách ẩn danh",
                    TotalSpent = g.Sum(o => o.TotalAmount)
                })
                .OrderByDescending(x => x.TotalSpent)
                .Take(5)
                .ToListAsync();

            return Ok(new
            {
                Kpis = new { totalProducts, totalOrders, totalCustomers, monthlyRevenue },
                RevenueByMonth = revenueByMonth,
                TopProducts = topProducts,
                OrderStats = orderStats,
                LowStockProducts = lowStockProducts,
                CategoryRevenue = categoryRevenue,
                TopCustomers = topCustomers
            });
        }
    }
}