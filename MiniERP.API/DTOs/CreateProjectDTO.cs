using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class CreateProjectDTO
    {
        [Required(ErrorMessage = "Tên dự án không được để trống")]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }
    }
}