using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class StockTake
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty; // Mã phiếu: PK001

        public DateTime CheckDate { get; set; } = DateTime.Now;

        public int? EmployeeId { get; set; }
        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Draft"; // Draft, Completed

        [MaxLength(255)]
        public string? Note { get; set; }

        public ICollection<StockTakeDetail> Details { get; set; } = new List<StockTakeDetail>();
    }
}
