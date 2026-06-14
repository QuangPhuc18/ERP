using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.Entities
{
    public class Project
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; } // Có thể null vì dự án chưa kết thúc

        // Thuộc tính điều hướng: 1 Dự án có nhiều bản ghi phân công (bảng trung gian)
        public ICollection<EmployeeProject>? EmployeeProjects { get; set; }
    }
}