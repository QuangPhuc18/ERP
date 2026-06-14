using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.Entities
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        // Mối quan hệ 1-N: 1 Danh mục có nhiều Sản phẩm
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}