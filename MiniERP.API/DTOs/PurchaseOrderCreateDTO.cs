using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class PurchaseOrderDetailDTO
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng nhập phải lớn hơn 0")]
        public int Quantity { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Giá nhập không hợp lệ")]
        public decimal UnitPrice { get; set; } // Giá nhập từ nhà cung cấp có thể thay đổi theo thời giá
        
        public int? UnitId { get; set; }
    }

    public class PurchaseOrderCreateDTO
    {
        [Required]
        public int SupplierId { get; set; }

        [Required]
        public List<PurchaseOrderDetailDTO> Details { get; set; } = new List<PurchaseOrderDetailDTO>();
    }
}