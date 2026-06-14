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

        public DateTime OrderDate { get; set; }

        // 🎯 Bổ sung quy định kiểu dữ liệu tiền tệ vào đây
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = "Completed";

        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}