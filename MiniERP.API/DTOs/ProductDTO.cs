using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class ProductDTO
    {
        [Required]
        public string ProductCode { get; set; } = string.Empty;

        [Required]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        public decimal Price { get; set; }

        [Required]
        public decimal CostPrice { get; set; }

        public int Quantity { get; set; }

        [Required]
        public int CategoryId { get; set; }

        // 🎯 Bổ sung trường lưu đường dẫn Hình ảnh (Có thể để trống)
        public string? ImageUrl { get; set; }

        public string? Description { get; set; }
        
        public bool IsNew { get; set; }
    }
}