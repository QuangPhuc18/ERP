using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class InventoryTransaction
    {
        [Key]
        public int Id { get; set; }

        public DateTime TransactionDate { get; set; } = DateTime.Now;

        [Required]
        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

        [Required]
        [MaxLength(50)]
        public string TransactionType { get; set; } = string.Empty; // IMPORT, SALE, ADJUSTMENT

        public int Quantity { get; set; } // +5, -2, -1

        // Dùng để lưu ID của Hóa đơn bán hoặc Phiếu nhập kho (nếu có)
        public int? ReferenceId { get; set; }

        [MaxLength(255)]
        public string? Note { get; set; }
    }
}
