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

        public int? UnitId { get; set; } // Đơn vị được chọn khi bán
    }

    public class OrderCreateDTO
    {
        // 🎯 Có thể null
        public int? CustomerId { get; set; }
        
        public int? WorkShiftId { get; set; }

        [Required]
        public decimal TotalAmount { get; set; }

        public decimal AmountPaid { get; set; }

        // 🎯 Số điểm khách muốn sử dụng (1 điểm = 1đ)
        public int PointsUsed { get; set; } = 0;

        public string PaymentMethod { get; set; } = "Cash";

        public string? Note { get; set; }

        [Required]
        public List<OrderDetailDTO> Details { get; set; } = new List<OrderDetailDTO>();
    }
}