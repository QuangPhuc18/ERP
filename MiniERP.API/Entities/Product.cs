using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string ProductCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string ProductName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } // Giá bán

        [Column(TypeName = "decimal(18,2)")]
        public decimal CostPrice { get; set; } // Giá vốn

        public int Quantity { get; set; } = 0; // Tồn kho hiện tại

        // 🎯 ĐÂY CHÍNH LÀ CỘT BẠN ĐANG THIẾU
        public string? ImageUrl { get; set; }

        public string? Description { get; set; } // Thêm mô tả
        public int ViewCount { get; set; } = 0; // Lượt xem
        public bool IsNew { get; set; } = false; // Sản phẩm mới

        public bool IsActive { get; set; } = true; // Trạng thái Đang Kinh Doanh / Ngừng Kinh Doanh

        // Khóa ngoại liên kết với Bảng Category
        public int CategoryId { get; set; }
        [ForeignKey("CategoryId")]
        public Category? Category { get; set; }
    }
}