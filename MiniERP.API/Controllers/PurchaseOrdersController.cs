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
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] int? month = null, [FromQuery] int? year = null)
        {
            var query = _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.PurchaseOrderDetails)
                    .ThenInclude(pod => pod.Product)
                .AsQueryable();

            if (month.HasValue && year.HasValue)
            {
                query = query.Where(po => po.OrderDate.Month == month.Value && po.OrderDate.Year == year.Value);
            }

            int totalItems = await query.CountAsync();

            var purchaseOrders = await query
                .OrderByDescending(po => po.Id) // Ưu tiên hiển thị phiếu mới nhập lên đầu
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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

            return Ok(new PagedResult<object>(purchaseOrders.Cast<object>().ToList(), totalItems, page, pageSize));
        }

        // 2. BƯỚC 1: LẬP PHIẾU NHÁP (POST: api/PurchaseOrders) - LƯU VÀO TRẠNG THÁI PENDING, CHƯA CỘNG KHO
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreatePurchaseOrder([FromBody] PurchaseOrderCreateDTO dto)
        {
            if (dto.Details == null || !dto.Details.Any())
                return BadRequest("Phiếu nhập phải có ít nhất 1 mặt hàng sản phẩm!");

            var supplier = await _context.Suppliers.FindAsync(dto.SupplierId);
            if (supplier == null) return BadRequest("Nhà cung cấp lựa chọn không tồn tại!");

            var purchaseOrder = new PurchaseOrder
            {
                SupplierId = dto.SupplierId,
                OrderDate = DateTime.Now,
                Status = "Pending", // 🎯 Trạng thái chờ duyệt
                TotalAmount = 0,
                PurchaseOrderDetails = new List<PurchaseOrderDetail>()
            };

            foreach (var item in dto.Details)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null)
                    return BadRequest($"Sản phẩm có ID {item.ProductId} không tồn tại trên hệ thống!");

                var detail = new PurchaseOrderDetail
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                };

                purchaseOrder.TotalAmount += (item.Quantity * item.UnitPrice);
                purchaseOrder.PurchaseOrderDetails.Add(detail);
            }

            _context.PurchaseOrders.Add(purchaseOrder);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Tạo bản nháp phiếu nhập kho thành công. Vui lòng kiểm tra hàng và Duyệt phiếu để chính thức nhập kho!",
                PurchaseOrderId = purchaseOrder.Id,
                TotalAmount = purchaseOrder.TotalAmount
            });
        }

        // [NEW] API CHỈNH SỬA PHIẾU NHÁP (PUT: api/PurchaseOrders/{id})
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdatePurchaseOrder(int id, [FromBody] PurchaseOrderCreateDTO dto)
        {
            if (dto.Details == null || !dto.Details.Any())
                return BadRequest("Phiếu nhập phải có ít nhất 1 mặt hàng sản phẩm!");

            var po = await _context.PurchaseOrders
                .Include(p => p.PurchaseOrderDetails)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (po == null) return NotFound("Không tìm thấy Phiếu Nhập Kho!");
            
            // Khóa bảo vệ: Chỉ cho sửa phiếu ở trạng thái Pending
            if (po.Status != "Pending") 
                return BadRequest("Không thể sửa phiếu này vì nó đã được Duyệt hoặc Hủy!");

            var supplier = await _context.Suppliers.FindAsync(dto.SupplierId);
            if (supplier == null) return BadRequest("Nhà cung cấp lựa chọn không tồn tại!");

            // 1. Cập nhật thông tin chung
            po.SupplierId = dto.SupplierId;
            po.TotalAmount = 0;

            // 2. Xóa các chi tiết cũ
            _context.PurchaseOrderDetails.RemoveRange(po.PurchaseOrderDetails);

            // 3. Thêm chi tiết mới
            foreach (var item in dto.Details)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null)
                    return BadRequest($"Sản phẩm có ID {item.ProductId} không tồn tại trên hệ thống!");

                var detail = new PurchaseOrderDetail
                {
                    PurchaseOrderId = po.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice
                };

                po.TotalAmount += (item.Quantity * item.UnitPrice);
                po.PurchaseOrderDetails.Add(detail);
            }

            _context.PurchaseOrders.Update(po);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đã cập nhật Phiếu Nhập Kho thành công!",
                TotalAmount = po.TotalAmount
            });
        }

        // 3. BƯỚC 2: QUẢN LÝ DUYỆT PHIẾU NHẬP (POST: api/PurchaseOrders/{id}/Confirm)
        [HttpPost("{id}/Confirm")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ConfirmPurchaseOrder(int id)
        {
            var po = await _context.PurchaseOrders
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseOrderDetails)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (po == null) return NotFound("Không tìm thấy Phiếu Nhập Kho!");
            if (po.Status == "Completed") return BadRequest("Phiếu này đã được duyệt và cộng tồn kho từ trước!");

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                foreach (var detail in po.PurchaseOrderDetails)
                {
                    var product = await _context.Products.FindAsync(detail.ProductId);
                    if (product != null)
                    {
                        // 🎯 KẾT HỢP NGHIỆP VỤ KẾ TOÁN: TÍNH GIÁ VỐN BÌNH QUÂN GIA QUYỀN (MAC)
                        int totalNewQuantity = product.Quantity + detail.Quantity;
                        
                        if (totalNewQuantity > 0)
                        {
                            decimal totalOldValue = product.Quantity * product.CostPrice;
                            decimal totalNewValue = detail.Quantity * detail.UnitPrice;
                            
                            product.CostPrice = (totalOldValue + totalNewValue) / totalNewQuantity;
                        }
                        else
                        {
                            product.CostPrice = detail.UnitPrice;
                        }

                        // 🎯 CỘNG DỒN SỐ LƯỢNG KHO THỰC TẾ
                        product.Quantity += detail.Quantity;
                        _context.Products.Update(product);

                        // 🎯 Ghi nhật ký tồn kho (IMPORT)
                        _context.InventoryTransactions.Add(new InventoryTransaction
                        {
                            TransactionDate = DateTime.Now,
                            ProductId = product.Id,
                            TransactionType = "IMPORT",
                            Quantity = detail.Quantity,
                            ReferenceId = po.Id,
                            Note = $"Duyệt Nhập kho từ NCC {po.Supplier?.Name}"
                        });
                    }
                }

                // Cập nhật trạng thái phiếu
                po.Status = "Completed";
                po.PaymentStatus = "Unpaid";
                po.PaidAmount = 0;
                _context.PurchaseOrders.Update(po);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Đã duyệt Phiếu Nhập Hàng thành công! Tồn kho đã được cập nhật." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi hệ thống khi duyệt phiếu: {ex.Message}");
            }
        }
        // 4. LẤY DANH SÁCH CÔNG NỢ (GET: api/PurchaseOrders/Unpaid)
        [HttpGet("Unpaid")]
        public async Task<IActionResult> GetUnpaidPurchaseOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] int? month = null, [FromQuery] int? year = null)
        {
            var query = _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Where(po => po.Status == "Completed" && po.PaymentStatus != "Paid")
                .AsQueryable();

            if (month.HasValue && year.HasValue)
            {
                query = query.Where(po => po.OrderDate.Month == month.Value && po.OrderDate.Year == year.Value);
            }

            int totalItems = await query.CountAsync();

            var purchaseOrders = await query
                .OrderBy(po => po.OrderDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(po => new {
                    po.Id,
                    SupplierName = po.Supplier != null ? po.Supplier.Name : "Nhà cung cấp đã xóa",
                    po.OrderDate,
                    po.TotalAmount,
                    po.PaidAmount,
                    RemainingAmount = po.TotalAmount - po.PaidAmount,
                    po.PaymentStatus
                })
                .ToListAsync();

            return Ok(new PagedResult<object>(purchaseOrders.Cast<object>().ToList(), totalItems, page, pageSize));
        }

        // 5. THANH TOÁN CÔNG NỢ TỪNG PHẦN (POST: api/PurchaseOrders/{id}/Pay)
        [HttpPost("{id}/Pay")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> PayPurchaseOrder(int id, [FromBody] decimal amountToPay)
        {
            if (amountToPay <= 0) return BadRequest("Số tiền thanh toán phải lớn hơn 0.");

            var po = await _context.PurchaseOrders.FindAsync(id);
            if (po == null) return NotFound("Không tìm thấy Phiếu Nhập Kho!");
            if (po.Status != "Completed") return BadRequest("Chỉ có thể thanh toán công nợ cho Phiếu Nhập đã hoàn tất.");
            if (po.PaymentStatus == "Paid") return BadRequest("Phiếu này đã thanh toán xong!");

            var remainingDebt = po.TotalAmount - po.PaidAmount;
            if (amountToPay > remainingDebt)
                return BadRequest($"Số tiền thanh toán ({amountToPay}) không được lớn hơn số nợ còn lại ({remainingDebt}).");

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Ghi nhận lịch sử thanh toán
                var payment = new SupplierPayment
                {
                    PurchaseOrderId = po.Id,
                    SupplierId = po.SupplierId,
                    Amount = amountToPay,
                    PaymentDate = DateTime.Now,
                    Note = $"Thanh toán công nợ đợt {(po.PaidAmount > 0 ? "tiếp theo" : "1")}"
                };
                _context.SupplierPayments.Add(payment);

                // 2. Cập nhật số tiền đã trả
                po.PaidAmount += amountToPay;

                // 3. Cập nhật Trạng thái thanh toán
                if (po.PaidAmount >= po.TotalAmount)
                {
                    po.PaymentStatus = "Paid";
                }
                else
                {
                    po.PaymentStatus = "Partial";
                }

                _context.PurchaseOrders.Update(po);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { 
                    Message = "Thanh toán thành công!", 
                    PaidAmount = po.PaidAmount,
                    RemainingAmount = po.TotalAmount - po.PaidAmount,
                    PaymentStatus = po.PaymentStatus
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Lỗi hệ thống khi thanh toán: {ex.Message}");
            }
        }


        // 6. LẤY LỊCH SỬ THANH TOÁN (GET: api/PurchaseOrders/History)
        [HttpGet("History")]
        public async Task<IActionResult> GetPaymentHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] int? month = null, [FromQuery] int? year = null)
        {
            var query = _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.SupplierPayments)
                .Where(po => po.Status == "Completed" && po.SupplierPayments.Any())
                .AsQueryable();

            if (month.HasValue && year.HasValue)
            {
                query = query.Where(po => po.OrderDate.Month == month.Value && po.OrderDate.Year == year.Value);
            }

            int totalItems = await query.CountAsync();

            var historyData = await query
                .OrderByDescending(po => po.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var history = historyData.Select(po => new {
                po.Id,
                SupplierName = po.Supplier != null ? po.Supplier.Name : "Nhà cung cấp đã xóa",
                po.OrderDate,
                po.TotalAmount,
                po.PaidAmount,
                RemainingAmount = po.TotalAmount - po.PaidAmount,
                po.PaymentStatus,
                Payments = po.SupplierPayments != null ? po.SupplierPayments.OrderByDescending(p => p.PaymentDate).Select(p => new {
                    p.Id,
                    p.Amount,
                    p.PaymentDate,
                    p.Note
                }).ToList() : null
            }).ToList();

            return Ok(new PagedResult<object>(history.Cast<object>().ToList(), totalItems, page, pageSize));
        }
    }
}