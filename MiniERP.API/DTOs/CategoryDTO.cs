using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class CategoryDTO
    {
        [Required(ErrorMessage = "Tên danh mục không được để trống")]
        public string Name { get; set; } = string.Empty;
    }
}