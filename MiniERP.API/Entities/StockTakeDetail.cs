using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class StockTakeDetail
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int StockTakeId { get; set; }
        [ForeignKey("StockTakeId")]
        public StockTake? StockTake { get; set; }

        [Required]
        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

        public int SystemStock { get; set; }
        public int ActualStock { get; set; }
        public int Difference { get; set; } // ActualStock - SystemStock

        [MaxLength(255)]
        public string? Reason { get; set; }
    }
}
