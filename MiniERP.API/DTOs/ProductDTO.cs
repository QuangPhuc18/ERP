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

        public int? UnitId { get; set; }
        public List<ProductUoMDTO>? ProductUoMs { get; set; }
    }

    public class ProductUoMDTO
    {
        public int UnitId { get; set; }
        public int ConversionFactor { get; set; }
        public decimal Price { get; set; }
    }

    public class ProductImportDTO
    {
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public decimal CostPrice { get; set; }
        public int Quantity { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string UnitName { get; set; } = string.Empty;
        public List<ProductUoMImportDTO>? ProductUoMs { get; set; }
    }

    public class ProductUoMImportDTO
    {
        public string UnitName { get; set; } = string.Empty;
        public int ConversionFactor { get; set; }
        public decimal Price { get; set; }
    }
}