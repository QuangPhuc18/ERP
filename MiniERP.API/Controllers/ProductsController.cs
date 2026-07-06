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
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách Sản phẩm (Kèm theo thông tin Danh mục và Hình ảnh)
        // Lấy danh sách Sản phẩm (Đã tối ưu cắt chuỗi ảnh để tránh nghẽn băng thông)
        // Lấy danh sách Sản phẩm (Trả về chuỗi ảnh nguyên bản để hiển thị không bị vỡ)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _context.Products
                .Where(p => p.IsActive) // 🎯 CHỈ LẤY SẢN PHẨM ĐANG KINH DOANH CHO POS / NHẬP KHO
                .Include(p => p.Category)
                .Select(p => new
                {
                    p.Id,
                    p.ProductCode,
                    p.ProductName,
                    p.Price,
                    p.CostPrice,
                    p.Quantity,
                    p.CategoryId,
                    p.ImageUrl, // 🎯 SỬA TẠI ĐÂY: Trả lại p.ImageUrl nguyên bản, không dùng Substring cắt chuỗi nữa
                    CategoryName = p.Category != null ? p.Category.Name : "Không có"
                })
                .ToListAsync();

            return Ok(products);
        }
        // Lấy danh sách Sản phẩm có phân trang từ Server
        [HttpGet("paginated")]
        public async Task<IActionResult> GetPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 10;

            // 1. Tính tổng số sản phẩm trước khi phân trang để Frontend biết đường tính TotalPages
            var totalRecords = await _context.Products.CountAsync();

            // 2. Dùng Skip và Take để chỉ lấy đúng số lượng cần thiết dưới DB
            var products = await _context.Products
                .Include(p => p.Category)
                .OrderBy(p => p.Id)
                .Skip((page - 1) * pageSize) // Bỏ qua các hàng của trang trước
                .Take(pageSize)              // Lấy đúng số hàng của trang hiện tại
                .Select(p => new
                {
                    p.Id,
                    p.ProductCode,
                    p.ProductName,
                    p.Price,
                    p.CostPrice,
                    p.Quantity,
                    p.CategoryId,
                    p.IsActive, // 🎯 Trả về trạng thái để hiển thị cho Admin
                    p.ImageUrl,
                    CategoryName = p.Category != null ? p.Category.Name : "Không có"
                })
                .ToListAsync();

            // 3. Trả về cả dữ liệu và thông tin phân trang
            return Ok(new
            {
                TotalRecords = totalRecords,
                CurrentPage = page,
                PageSize = pageSize,
                Data = products
            });
        }

        // Thêm Sản phẩm (CHỈ ADMIN)
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create([FromBody] ProductDTO dto)
        {
            // Kiểm tra Category có tồn tại không
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
            if (!categoryExists) return BadRequest("Danh mục không tồn tại!");

            var product = new Product
            {
                ProductCode = dto.ProductCode,
                ProductName = dto.ProductName,
                Price = dto.Price,
                CostPrice = dto.CostPrice,
                Quantity = dto.Quantity,
                CategoryId = dto.CategoryId,
                ImageUrl = dto.ImageUrl // 🎯 Map chuỗi ảnh Base64 từ DTO vào Entity để lưu xuống SQL Server
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(product);
        }

        // Sửa Sản phẩm (CHỈ ADMIN)
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductDTO dto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound("Không tìm thấy sản phẩm này!");

            // Kiểm tra xem ID Danh mục mới có hợp lệ không
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
            if (!categoryExists) return BadRequest("Danh mục không tồn tại!");

            product.ProductCode = dto.ProductCode;
            product.ProductName = dto.ProductName;
            product.Price = dto.Price;
            product.CostPrice = dto.CostPrice;
            product.Quantity = dto.Quantity;
            product.CategoryId = dto.CategoryId;
            product.ImageUrl = dto.ImageUrl; // 🎯 Cập nhật lại ảnh mới (hoặc chuỗi rỗng nếu gỡ ảnh)

            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            return Ok(product);
        }

        // Xóa Sản phẩm (CHỈ ADMIN)
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound("Không tìm thấy sản phẩm này!");

            // 🎯 KIỂM TRA RÀNG BUỘC: Nếu sản phẩm đã có trong hóa đơn bán lẻ hoặc đơn nhập, không cho xóa bừa bãi
            bool hasOrderDetails = await _context.OrderDetails.AnyAsync(od => od.ProductId == id);
            if (hasOrderDetails)
            {
                return BadRequest("Không thể xóa sản phẩm này vì lịch sử giao dịch bán hàng đã được lưu trữ trên hệ thống! Hãy dùng tính năng Ngừng Kinh Doanh.");
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok("Xóa sản phẩm thành công!");
        }

        // 🎯 [NEW] BẬT / TẮT TRẠNG THÁI KINH DOANH
        [HttpPut("{id}/toggle-status")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound("Không tìm thấy sản phẩm này!");

            product.IsActive = !product.IsActive; // Đảo ngược trạng thái
            _context.Products.Update(product);
            await _context.SaveChangesAsync();

            string message = product.IsActive ? "Đã MỞ KHÓA sản phẩm!" : "Đã KHÓA (Ngừng kinh doanh) sản phẩm!";
            return Ok(new { Message = message, IsActive = product.IsActive });
        }
    }
}