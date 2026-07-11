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
                .Include(p => p.Unit)
                .Include(p => p.ProductUoMs)
                .ThenInclude(pu => pu.Unit)
                .Select(p => new
                {
                    p.Id,
                    p.ProductCode,
                    p.ProductName,
                    p.Price,
                    p.CostPrice,
                    p.Quantity,
                    p.CategoryId,
                    p.UnitId,
                    UnitName = p.Unit != null ? p.Unit.Name : null,
                    p.ImageUrl, // 🎯 SỬA TẠI ĐÂY: Trả lại p.ImageUrl nguyên bản, không dùng Substring cắt chuỗi nữa
                    CategoryName = p.Category != null ? p.Category.Name : "Không có",
                    ProductUoMs = p.ProductUoMs.Select(pu => new {
                        pu.Id,
                        pu.UnitId,
                        UnitName = pu.Unit != null ? pu.Unit.Name : null,
                        pu.ConversionFactor,
                        pu.Price
                    }).ToList()
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
                .Include(p => p.Unit)
                .Include(p => p.ProductUoMs)
                .ThenInclude(pu => pu.Unit)
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
                    p.IsNew,
                    p.Description,
                    p.ImageUrl,
                    p.UnitId,
                    UnitName = p.Unit != null ? p.Unit.Name : null,
                    CategoryName = p.Category != null ? p.Category.Name : "Không có",
                    ProductUoMs = p.ProductUoMs.Select(pu => new {
                        pu.Id,
                        pu.UnitId,
                        UnitName = pu.Unit != null ? pu.Unit.Name : null,
                        pu.ConversionFactor,
                        pu.Price
                    }).ToList()
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
                ImageUrl = dto.ImageUrl, // 🎯 Map chuỗi ảnh Base64 từ DTO vào Entity để lưu xuống SQL Server
                Description = dto.Description,
                IsNew = dto.IsNew,
                UnitId = dto.UnitId
            };

            if (dto.ProductUoMs != null && dto.ProductUoMs.Any())
            {
                foreach (var uomDto in dto.ProductUoMs)
                {
                    product.ProductUoMs.Add(new ProductUoM
                    {
                        UnitId = uomDto.UnitId,
                        ConversionFactor = uomDto.ConversionFactor,
                        Price = uomDto.Price
                    });
                }
            }

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
            product.Description = dto.Description;
            product.IsNew = dto.IsNew;
            product.UnitId = dto.UnitId;

            // Xóa hết ProductUoM cũ
            var existingUoMs = await _context.ProductUoMs.Where(p => p.ProductId == id).ToListAsync();
            _context.ProductUoMs.RemoveRange(existingUoMs);

            // Thêm lại ProductUoM mới
            if (dto.ProductUoMs != null && dto.ProductUoMs.Any())
            {
                foreach (var uomDto in dto.ProductUoMs)
                {
                    product.ProductUoMs.Add(new ProductUoM
                    {
                        UnitId = uomDto.UnitId,
                        ConversionFactor = uomDto.ConversionFactor,
                        Price = uomDto.Price
                    });
                }
            }

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

        // 🎯 [NEW] IMPORT EXCEL/CSV (HÀNG LOẠT)
        [HttpPost("import")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ImportExcel([FromBody] List<ProductImportDTO> importList)
        {
            if (importList == null || !importList.Any())
                return BadRequest("Danh sách sản phẩm trống!");

            int successCount = 0;
            var errorList = new List<string>();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var item in importList)
                {
                    // Validate
                    if (string.IsNullOrWhiteSpace(item.ProductName) || string.IsNullOrWhiteSpace(item.ProductCode))
                    {
                        errorList.Add($"Sản phẩm '{item.ProductName}' bị thiếu Mã hoặc Tên.");
                        continue;
                    }

                    // Check duplicate
                    if (await _context.Products.AnyAsync(p => p.ProductCode == item.ProductCode))
                    {
                        errorList.Add($"Mã SP '{item.ProductCode}' đã tồn tại.");
                        continue;
                    }

                    // Resolve Category
                    var category = await GetOrCreateCategory(string.IsNullOrWhiteSpace(item.CategoryName) ? "Chung" : item.CategoryName.Trim());
                    
                    // Resolve Base Unit
                    var baseUnit = await GetOrCreateUnit(string.IsNullOrWhiteSpace(item.UnitName) ? "Cái" : item.UnitName.Trim());

                    var product = new Product
                    {
                        ProductCode = item.ProductCode.Trim(),
                        ProductName = item.ProductName.Trim(),
                        Price = item.Price,
                        CostPrice = item.CostPrice,
                        Quantity = item.Quantity,
                        CategoryId = category.Id,
                        UnitId = baseUnit.Id,
                        ImageUrl = item.ImageUrl,
                        IsNew = true,
                        IsActive = true
                    };

                    // Insert Product
                    _context.Products.Add(product);
                    await _context.SaveChangesAsync(); // Cần save để lấy Product.Id

                    // Resolve UoMs
                    if (item.ProductUoMs != null && item.ProductUoMs.Any())
                    {
                        foreach (var uomItem in item.ProductUoMs)
                        {
                            if (string.IsNullOrWhiteSpace(uomItem.UnitName) || uomItem.ConversionFactor <= 1) continue;

                            var subUnit = await GetOrCreateUnit(uomItem.UnitName.Trim());
                            
                            // Check if duplicate UoM for this product
                            if (!await _context.ProductUoMs.AnyAsync(pu => pu.ProductId == product.Id && pu.UnitId == subUnit.Id))
                            {
                                _context.ProductUoMs.Add(new ProductUoM
                                {
                                    ProductId = product.Id,
                                    UnitId = subUnit.Id,
                                    ConversionFactor = uomItem.ConversionFactor,
                                    Price = uomItem.Price > 0 ? uomItem.Price : product.Price * uomItem.ConversionFactor
                                });
                            }
                        }
                        await _context.SaveChangesAsync();
                    }
                    successCount++;
                }

                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = $"Đã nhập thành công {successCount} sản phẩm.",
                    Errors = errorList
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest($"Lỗi trong quá trình import: {ex.Message}");
            }
        }

        private async Task<Category> GetOrCreateCategory(string name)
        {
            var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Name == name);
            if (cat == null)
            {
                cat = new Category { Name = name, Description = "Auto Imported" };
                _context.Categories.Add(cat);
                await _context.SaveChangesAsync();
            }
            return cat;
        }

        private async Task<Unit> GetOrCreateUnit(string name)
        {
            var unit = await _context.Units.FirstOrDefaultAsync(u => u.Name == name);
            if (unit == null)
            {
                unit = new Unit { Name = name, Description = "Auto Imported" };
                _context.Units.Add(unit);
                await _context.SaveChangesAsync();
            }
            return unit;
        }
    }
}