using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class PurchaseOrderDetail
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PurchaseOrderId { get; set; }
        [ForeignKey("PurchaseOrderId")]
        public PurchaseOrder? PurchaseOrder { get; set; }

        [Required]
        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

        public int Quantity { get; set; } // Số lượng nhập thêm vào kho

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; } // Giá nhập (CostPrice) tại thời điểm đó

        // 🎯 [NEW] Lưu vết Đơn vị tính được chọn tại thời điểm tạo phiếu (Lốc/Thùng/Chai)
        public string? UnitName { get; set; }

        // 🎯 [NEW] Lưu vết Hệ số quy đổi tại thời điểm tạo phiếu (để nhân ra đơn vị cơ bản)
        public int ConversionFactor { get; set; } = 1;
    }
}