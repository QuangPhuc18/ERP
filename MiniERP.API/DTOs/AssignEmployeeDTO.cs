using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class AssignEmployeeDTO
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public int ProjectId { get; set; }

        public string Role { get; set; } = "Thành viên";
    }
}