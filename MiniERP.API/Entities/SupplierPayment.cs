using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class SupplierPayment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PurchaseOrderId { get; set; }
        
        [ForeignKey("PurchaseOrderId")]
        public PurchaseOrder? PurchaseOrder { get; set; }

        [Required]
        public int SupplierId { get; set; }
        
        [ForeignKey("SupplierId")]
        public Supplier? Supplier { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime PaymentDate { get; set; } = DateTime.Now;

        [MaxLength(255)]
        public string? Note { get; set; }
    }
}
