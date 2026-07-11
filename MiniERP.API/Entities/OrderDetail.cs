using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class OrderDetail
    {
        [Key]
        public int Id { get; set; }

        // Khóa ngoại liên kết với Đơn hàng tổng
        [Required]
        public int OrderId { get; set; }
        [ForeignKey("OrderId")]
        public Order? Order { get; set; }

        // Khóa ngoại liên kết với Sản phẩm
        [Required]
        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

        public int Quantity { get; set; } // Số lượng mua

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; } // Giá bán thực tế lúc xuất hóa đơn
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitCost { get; set; } // Giá vốn của sản phẩm lúc bán (để tính lãi lỗ gộp)

        // 🎯 [NEW] Lưu vết Đơn vị tính được chọn tại thời điểm bán (Lốc/Thùng/Chai)
        public string? UnitName { get; set; }

        // 🎯 [NEW] Lưu vết Hệ số quy đổi tại thời điểm bán (để nhân ra đơn vị cơ bản)
        public int ConversionFactor { get; set; } = 1;
    }
}