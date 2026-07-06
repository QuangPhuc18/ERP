using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class PurchaseOrder
    {
        [Key]
        public int Id { get; set; }

        // Khóa ngoại liên kết với Nhà cung cấp
        [Required]
        public int SupplierId { get; set; }
        [ForeignKey("SupplierId")]
        public Supplier? Supplier { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.Now;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; } // Tổng tiền nhập hàng

        [MaxLength(20)]
        public string Status { get; set; } = "Completed"; // Trạng thái phiếu nhập

        // --- CÔNG NỢ ---
        [Column(TypeName = "decimal(18,2)")]
        public decimal PaidAmount { get; set; } = 0; // Đã thanh toán

        [MaxLength(20)]
        public string PaymentStatus { get; set; } = "Unpaid"; // Unpaid, Partial, Paid

        // Mối quan hệ 1-N: 1 Phiếu nhập có nhiều Chi tiết
        public ICollection<PurchaseOrderDetail> PurchaseOrderDetails { get; set; } = new List<PurchaseOrderDetail>();
        
        // Mối quan hệ 1-N: Lịch sử thanh toán
        public ICollection<SupplierPayment> SupplierPayments { get; set; } = new List<SupplierPayment>();
    }
}