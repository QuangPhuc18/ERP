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
        public decimal UnitPrice { get; set; } // Đơn giá lúc mua (tránh việc sau này giá SP đổi làm sai lịch sử)

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitCost { get; set; } // Giá vốn lúc bán (để tính lợi nhuận chuẩn xác)
    }
}