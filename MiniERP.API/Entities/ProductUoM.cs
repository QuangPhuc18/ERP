using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class ProductUoM
    {
        [Key]
        public int Id { get; set; }

        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

        public int UnitId { get; set; }
        [ForeignKey("UnitId")]
        public Unit? Unit { get; set; }

        [Required]
        public int ConversionFactor { get; set; } // Tỷ lệ quy đổi so với Đơn vị cơ bản (Ví dụ: 1 Thùng = 24 Lon -> ConversionFactor = 24)

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } // Giá bán lẻ cho đơn vị quy đổi này
    }
}
