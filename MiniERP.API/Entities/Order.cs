using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // 🎯 Bắt buộc phải có dòng này

namespace MiniERP.API.Entities
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        public int? CustomerId { get; set; }
        public Customer? Customer { get; set; }

        public int? EmployeeId { get; set; }
        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }

        public int? WorkShiftId { get; set; }
        [ForeignKey("WorkShiftId")]
        public WorkShift? WorkShift { get; set; }

        public DateTime OrderDate { get; set; }

        // 🎯 Bổ sung quy định kiểu dữ liệu tiền tệ vào đây
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = "Completed";

        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountPaid { get; set; } = 0; // Tiền khách đưa thực tế

        public string PaymentMethod { get; set; } = "Cash"; // Tiền mặt, Chuyển khoản, Thẻ

        public string? Note { get; set; } // Ghi chú đơn hàng

        // 🎯 Thêm thông tin giao hàng cho Storefront
        public string? ShippingAddress { get; set; } 
        public string? ShippingMethod { get; set; } 
        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingFee { get; set; } = 0;

        // 🎯 THÊM THÔNG TIN TÍCH ĐIỂM
        public int RewardPointsEarned { get; set; } = 0; // Số điểm cộng thêm từ hóa đơn này
        public int RewardPointsUsed { get; set; } = 0; // Số điểm khách đã xài
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountFromPoints { get; set; } = 0; // Số tiền được giảm do xài điểm

        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}