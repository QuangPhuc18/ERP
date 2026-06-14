using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class OrderDetailDTO
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng mua phải lớn hơn 0")]
        public int Quantity { get; set; }

        [Required]
        public decimal UnitPrice { get; set; }
    }

    public class OrderCreateDTO
    {
        // 🎯 Có thể null
        public int? CustomerId { get; set; }

        [Required]
        public decimal TotalAmount { get; set; }

        [Required]
        public List<OrderDetailDTO> Details { get; set; } = new List<OrderDetailDTO>();
    }
}