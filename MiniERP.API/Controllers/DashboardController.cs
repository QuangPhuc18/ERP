using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using System;
using System.Linq;
using System.Threading.Tasks;

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
            
            // Mặc định lấy 6 tháng, nhưng GIỚI HẠN không lấy trước tháng 7/2026
            var sixMonthsAgo = new DateTime(now.Year, now.Month, 1).AddMonths(-5);
            var startOfT7 = new DateTime(2026, 7, 1);
            if (sixMonthsAgo < startOfT7)
            {
                sixMonthsAgo = startOfT7;
            }

            // 1. KPI Cards
            var totalProducts = await _context.Products.CountAsync();
            var totalOrders = await _context.Orders.CountAsync();
            var totalCustomers = await _context.Customers.CountAsync();
            var monthlyRevenue = await _context.Orders
                .Where(o => o.OrderDate >= firstDayOfMonth && o.Status != "Cancelled")
                .SumAsync(o => (double?)o.TotalAmount) ?? 0;

            // 2. Doanh thu 6 tháng gần nhất
            var sixMonthOrders = await _context.Orders
                .Where(o => o.OrderDate >= sixMonthsAgo && o.Status != "Cancelled")
                .ToListAsync();

            var revenueByMonth = sixMonthOrders
                .GroupBy(o => new { o.OrderDate.Year, o.OrderDate.Month })
                .Select(g => new {
                    month = $"T{g.Key.Month}", // 🎯 Sửa thành chữ thường đầu để khớp React
                    revenue = g.Sum(o => o.TotalAmount)
                })
                .ToList();

            // 3. Top sản phẩm bán chạy
            var topProducts = await _context.OrderDetails
                .Include(od => od.Product)
                .Where(od => od.Order.Status != "Cancelled")
                .GroupBy(od => od.ProductId)
                .Select(g => new {
                    productName = g.First().Product != null ? g.First().Product.ProductName : "Sản phẩm đã xóa",
                    soldQuantity = g.Sum(od => od.Quantity)
                })
                .OrderByDescending(x => x.soldQuantity)
                .Take(5)
                .ToListAsync();

            // 4. Thống kê đơn hàng theo trạng thái
            var orderStats = await _context.Orders
                .GroupBy(o => o.Status)
                .Select(g => new {
                    status = g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            // 5. Thống kê tồn kho (Sắp hết hàng)
            var lowStockProducts = await _context.Products
                .Where(p => p.Quantity <= 5)
                .Select(p => new {
                    productName = p.ProductName,
                    quantity = p.Quantity
                })
                .OrderBy(p => p.quantity)
                .Take(5)
                .ToListAsync();

            // 6. Doanh thu theo danh mục
            var categoryRevenue = await _context.OrderDetails
                .Include(od => od.Product)
                .ThenInclude(p => p.Category)
                .Where(od => od.Order.Status != "Cancelled")
                .GroupBy(od => od.Product.Category != null ? od.Product.Category.Name : "Chưa phân loại")
                .Select(g => new {
                    categoryName = g.Key,
                    revenue = g.Sum(od => od.Quantity * od.UnitPrice)
                })
                .ToListAsync();

            // 7. Khách hàng mua nhiều nhất
            var topCustomers = await _context.Orders
                .Include(o => o.Customer)
                .Where(o => o.CustomerId != null && o.Status != "Cancelled")
                .GroupBy(o => o.CustomerId)
                .Select(g => new {
                    customerName = g.First().Customer != null ? g.First().Customer.FullName : "Khách ẩn danh",
                    totalSpent = g.Sum(o => o.TotalAmount)
                })
                .OrderByDescending(x => x.totalSpent)
                .Take(5)
                .ToListAsync();

            // 🎯 8. BỔ SUNG QUY TRÌNH: Tính toán biến động hàng hóa (Nhập - Xuất - Tồn) tháng này
            var monthlyProductFlow = await _context.Products
                .Select(p => new {
                    productName = p.ProductName,

                    // Tổng số lượng nhập kho qua các phiếu PO từ đầu tháng đến nay
                    importedQuantity = _context.PurchaseOrderDetails
                        .Where(pod => pod.ProductId == p.Id && pod.PurchaseOrder.OrderDate >= firstDayOfMonth)
                        .Sum(pod => (int?)pod.Quantity) ?? 0,

                    // Tổng số lượng xuất bán qua các đơn hàng POS từ đầu tháng đến nay
                    soldQuantity = _context.OrderDetails
                        .Where(od => od.ProductId == p.Id && od.Order.OrderDate >= firstDayOfMonth && od.Order.Status != "Cancelled")
                        .Sum(od => (int?)od.Quantity) ?? 0,

                    // Số lượng thực tế còn lại trong kho hiện tại
                    currentStock = p.Quantity
                })
                .ToListAsync();

            // Đóng gói trả ra Client với cấu trúc camelCase chuẩn chỉ 100%
            return Ok(new
            {
                kpis = new { totalProducts, totalOrders, totalCustomers, monthlyRevenue },
                revenueByMonth = revenueByMonth,
                topProducts = topProducts,
                orderStats = orderStats,
                lowStockProducts = lowStockProducts,
                categoryRevenue = categoryRevenue,
                topCustomers = topCustomers,
                monthlyProductFlow = monthlyProductFlow // 🎯 Trả về cục data này cho bảng
            });
        }
    }
}