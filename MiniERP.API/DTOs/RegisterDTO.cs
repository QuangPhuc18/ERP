using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class RegisterDTO
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        // Quyền của người này: Mặc định là Staff. Nếu là sếp thì nhập Admin hoặc HR
        public string Role { get; set; } = "Staff";
    }
}