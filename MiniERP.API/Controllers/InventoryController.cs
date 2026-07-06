using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.Entities;
using System.Linq;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InventoryController(AppDbContext context)
        {
            _context = context;
        }

        // 1. LẤY NHẬT KÝ TỒN KHO (TỐI ƯU HÓA PHÂN TRANG VÀ LỌC SERVER-SIDE)
        [HttpGet("Transactions")]
        public async Task<IActionResult> GetTransactions(
            [FromQuery] string filterType = "ALL", 
            [FromQuery] string dateFilter = "ALL", 
            [FromQuery] string? startDate = null, 
            [FromQuery] string? endDate = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 15)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 15;

            var query = _context.InventoryTransactions.AsQueryable();

            // Lọc theo Loại Giao Dịch
            if (filterType != "ALL")
            {
                if (filterType == "NO_SALES")
                    query = query.Where(t => t.TransactionType != "SALE");
                else
                    query = query.Where(t => t.TransactionType == filterType);
            }

            // Lọc theo Ngày tháng
            var now = DateTime.Now;
            if (dateFilter == "TODAY")
            {
                var today = now.Date;
                query = query.Where(t => t.TransactionDate >= today && t.TransactionDate < today.AddDays(1));
            }
            else if (dateFilter == "THIS_WEEK")
            {
                var firstDayOfWeek = now.Date.AddDays(-(int)now.DayOfWeek + (int)DayOfWeek.Monday); // Thứ 2
                query = query.Where(t => t.TransactionDate >= firstDayOfWeek);
            }
            else if (dateFilter == "THIS_MONTH")
            {
                var firstDayOfMonth = new DateTime(now.Year, now.Month, 1);
                query = query.Where(t => t.TransactionDate >= firstDayOfMonth);
            }
            else if (dateFilter == "CUSTOM")
            {
                if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out var parsedStart))
                {
                    query = query.Where(t => t.TransactionDate >= parsedStart.Date);
                }
                if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out var parsedEnd))
                {
                    var endOfDay = parsedEnd.Date.AddDays(1).AddTicks(-1);
                    query = query.Where(t => t.TransactionDate <= endOfDay);
                }
            }

            // Đếm tổng số bản ghi TRƯỚC KHI phân trang
            var totalRecords = await query.CountAsync();

            // Thực hiện Lấy dữ liệu theo Trang
            var transactions = await query
                .Include(t => t.Product)
                .OrderByDescending(t => t.TransactionDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new {
                    t.Id,
                    t.TransactionDate,
                    t.ProductId,
                    ProductName = t.Product != null ? t.Product.ProductName : "Sản phẩm đã xóa",
                    t.TransactionType,
                    t.Quantity,
                    t.ReferenceId,
                    t.Note
                })
                .ToListAsync();

            return Ok(new
            {
                TotalRecords = totalRecords,
                CurrentPage = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalRecords / pageSize),
                Data = transactions
            });
        }

        // 2. LẤY DANH SÁCH SẢN PHẨM ĐỂ KIỂM KHO
        [HttpGet("Check")]
        public async Task<IActionResult> GetInventoryForCheck()
        {
            var products = await _context.Products
                .Where(p => p.IsActive) // 🎯 CHỈ LẤY SẢN PHẨM ĐANG KINH DOANH
                .ToListAsync();
            
            var result = products.Select(p => new {
                p.Id,
                p.ProductCode,
                p.ProductName,
                SystemStock = p.Quantity
            });

            return Ok(result);
        }

        // --- MỚI: PHIẾU KIỂM KHO (STOCK TAKE) ---

        public class StockTakeItemRequest
        {
            public int ProductId { get; set; }
            public int SystemStock { get; set; }
            public int ActualStock { get; set; }
            public string? Reason { get; set; }
        }

        public class StockTakeRequest
        {
            public string? Note { get; set; }
            public List<StockTakeItemRequest> Items { get; set; } = new();
        }

        // Lấy danh sách Phiếu Kiểm Kho
        [HttpGet("StockTakes")]
        public async Task<IActionResult> GetStockTakes()
        {
            var stockTakes = await _context.StockTakes
                .Include(st => st.Employee)
                .Include(st => st.Details)
                    .ThenInclude(d => d.Product)
                .OrderByDescending(st => st.CheckDate)
                .Select(st => new {
                    st.Id,
                    st.Code,
                    st.CheckDate,
                    st.Status,
                    st.Note,
                    EmployeeName = st.Employee != null ? st.Employee.FullName : "System",
                    ItemsCount = st.Details.Count,
                    Details = st.Details.Select(d => new {
                        d.Id,
                        d.ProductId,
                        ProductName = d.Product != null ? d.Product.ProductName : "N/A",
                        d.SystemStock,
                        d.ActualStock,
                        d.Difference,
                        d.Reason
                    })
                }).ToListAsync();

            return Ok(stockTakes);
        }

        // LƯU KẾT QUẢ KIỂM KHO (Bước 1: Draft)
        [HttpPost("StockTakes")]
        public async Task<IActionResult> CreateStockTake([FromBody] StockTakeRequest dto)
        {
            if (dto.Items == null || !dto.Items.Any()) return BadRequest("Không có dữ liệu kiểm kho.");

            // Lấy ID nhân viên
            var employeeIdClaim = User.FindFirst("EmployeeId")?.Value;
            int? employeeId = null;
            if (int.TryParse(employeeIdClaim, out int empId)) employeeId = empId;

            // Generate Code PK001...
            var count = await _context.StockTakes.CountAsync();
            string code = $"PK{(count + 1).ToString("D3")}";

            var stockTake = new StockTake
            {
                Code = code,
                CheckDate = DateTime.Now,
                EmployeeId = employeeId,
                Status = "Draft",
                Note = dto.Note
            };

            foreach (var item in dto.Items)
            {
                stockTake.Details.Add(new StockTakeDetail
                {
                    ProductId = item.ProductId,
                    SystemStock = item.SystemStock,
                    ActualStock = item.ActualStock,
                    Difference = item.ActualStock - item.SystemStock,
                    Reason = item.Reason
                });
            }

            _context.StockTakes.Add(stockTake);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Lưu kết quả đếm kho thành công!", StockTakeId = stockTake.Id });
        }

        // XÁC NHẬN ĐIỀU CHỈNH KHO (Bước 2: Completed)
        [HttpPost("StockTakes/{id}/Confirm")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> ConfirmStockTake(int id)
        {
            var stockTake = await _context.StockTakes
                .Include(st => st.Details)
                .FirstOrDefaultAsync(st => st.Id == id);

            if (stockTake == null) return NotFound("Không tìm thấy Phiếu kiểm kho.");
            if (stockTake.Status == "Completed") return BadRequest("Phiếu này đã được xác nhận từ trước.");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Cập nhật từng mặt hàng
                foreach (var detail in stockTake.Details)
                {
                    if (detail.Difference == 0) continue; // Khớp kho thì bỏ qua

                    var product = await _context.Products.FindAsync(detail.ProductId);
                    if (product != null)
                    {
                        product.Quantity = detail.ActualStock;
                        _context.Products.Update(product);

                        // Ghi lịch sử Adjustments
                        _context.InventoryAdjustments.Add(new InventoryAdjustment
                        {
                            AdjustmentDate = DateTime.Now,
                            ProductId = product.Id,
                            EmployeeId = stockTake.EmployeeId,
                            SystemStock = detail.SystemStock,
                            ActualStock = detail.ActualStock,
                            Difference = detail.Difference,
                            Reason = detail.Reason ?? $"Duyệt phiếu {stockTake.Code}"
                        });

                        // Ghi Transaction
                        _context.InventoryTransactions.Add(new InventoryTransaction
                        {
                            TransactionDate = DateTime.Now,
                            ProductId = product.Id,
                            TransactionType = "ADJUSTMENT",
                            Quantity = detail.Difference,
                            ReferenceId = stockTake.Id,
                            Note = $"Kiểm kho {stockTake.Code}"
                        });
                    }
                }

                stockTake.Status = "Completed";
                _context.StockTakes.Update(stockTake);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Đã xác nhận điều chỉnh tồn kho thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest($"Lỗi: {ex.Message}");
            }
        }

        // --- MỚI: ĐỐI SOÁT DỮ LIỆU TỒN KHO TỰ ĐỘNG (DATA RECONCILIATION) ---
        [HttpGet("Reconcile")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetReconciliation()
        {
            // Lấy toàn bộ sản phẩm đang kinh doanh
            var products = await _context.Products.Where(p => p.IsActive).ToListAsync();

            // Tính tổng Quantity từ lịch sử giao dịch cho từng sản phẩm
            var historyStocks = await _context.InventoryTransactions
                .GroupBy(t => t.ProductId)
                .Select(g => new { ProductId = g.Key, HistoryStock = g.Sum(t => t.Quantity) })
                .ToDictionaryAsync(x => x.ProductId, x => x.HistoryStock);

            // Gộp dữ liệu
            var result = products.Select(p => {
                int historyStock = historyStocks.ContainsKey(p.Id) ? historyStocks[p.Id] : 0;
                int systemStock = p.Quantity;
                bool isMatch = (historyStock == systemStock);

                return new {
                    p.Id,
                    p.ProductCode,
                    p.ProductName,
                    HistoryStock = historyStock,
                    SystemStock = systemStock,
                    IsMatch = isMatch,
                    Difference = systemStock - historyStock
                };
            }).OrderBy(p => p.IsMatch).ToList(); // Lệch (false) lên đầu

            return Ok(result);
        }
    }
}
