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
    public class PurchaseOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PurchaseOrdersController(AppDbContext context)
        {
            _context = context;
        }

        // 1. XEM DANH SÁCH PHIẾU NHẬP KHO (GET: api/PurchaseOrders)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var purchaseOrders = await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.PurchaseOrderDetails)
                    .ThenInclude(pod => pod.Product)
                .OrderByDescending(po => po.Id) // Ưu tiên hiển thị phiếu mới nhập lên đầu
                .Select(po => new {
                    po.Id,
                    SupplierName = po.Supplier != null ? po.Supplier.Name : "Nhà cung cấp đã xóa",
                    po.OrderDate,
                    po.TotalAmount,
                    po.Status,
                    Details = po.PurchaseOrderDetails.Select(pod => new {
                        pod.ProductId,
                        ProductName = pod.Product != null ? pod.Product.ProductName : "Sản phẩm đã xóa",
                        pod.Quantity,
                        pod.UnitPrice,
                        SubTotal = pod.Quantity * pod.UnitPrice
                    })
                })
                .ToListAsync();

            return Ok(purchaseOrders);
        }

        // 2. TẠO PHIẾU NHẬP & TỰ ĐỘNG CỘNG TỒN KHO (POST: api/PurchaseOrders)
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreatePurchaseOrder([FromBody] PurchaseOrderCreateDTO dto)
        {
            if (dto.Details == null || !dto.Details.Any())
                return BadRequest("Phiếu nhập phải có ít nhất 1 mặt hàng sản phẩm!");

            var supplier = await _context.Suppliers.FindAsync(dto.SupplierId);
            if (supplier == null) return BadRequest("Nhà cung cấp lựa chọn không tồn tại!");

            // 🎯 KỸ THUẬT CAO CẤP: Kích hoạt Transaction kiểm soát an toàn dữ liệu kho hàng
            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var purchaseOrder = new PurchaseOrder
                {
                    SupplierId = dto.SupplierId,
                    OrderDate = DateTime.Now,
                    Status = "Completed",
                    TotalAmount = 0,
                    // 🎯 TỐI ƯU: Khởi tạo danh sách trống tường minh để dập tắt hoàn toàn lỗi NullReferenceException
                    PurchaseOrderDetails = new List<PurchaseOrderDetail>()
                };

                foreach (var item in dto.Details)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                        return BadRequest($"Sản phẩm có ID {item.ProductId} không tồn tại trên hệ thống!");

                    // TỰ ĐỘNG CỘNG TỒN KHO
                    product.Quantity += item.Quantity;

                    // Cập nhật lại giá vốn (CostPrice) mới nhất cho sản phẩm
                    product.CostPrice = item.UnitPrice;

                    var detail = new PurchaseOrderDetail
                    {
                        ProductId = item.ProductId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice
                    };

                    purchaseOrder.TotalAmount += (item.Quantity * item.UnitPrice);
                    purchaseOrder.PurchaseOrderDetails.Add(detail);

                    // Đánh dấu thực thể sản phẩm có sự thay đổi để EF cập nhật kho lẻ từng dòng
                    _context.Products.Update(product);
                }

                _context.PurchaseOrders.Add(purchaseOrder);

                // Lưu tất cả thay đổi của PO và Kho sản phẩm xuống SQL Server cùng một lúc
                await _context.SaveChangesAsync();

                // 🎯 Đóng gói Transaction thành công, chính thức ghi nhận dữ liệu vào DB
                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = "Tạo phiếu nhập kho và cộng dồn số lượng tồn kho thành công!",
                    PurchaseOrderId = purchaseOrder.Id,
                    TotalAmount = purchaseOrder.TotalAmount
                });
            }
            catch (Exception ex)
            {
                // 🎯 PHÒNG THỦ: Nếu có bất kỳ lỗi gì xảy ra, lập tức quay xe, khôi phục lại số lượng kho cũ
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi hệ thống khi xử lý nhập kho: {ex.Message}");
            }
        }
    }
}