using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class Account
    {
        // Khóa chính của Account đồng thời là Khóa ngoại trỏ về Employee
        [Key]
        [ForeignKey("Employee")]
        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty; // Chứa mật khẩu đã được băm (mã hóa)

        // Quyền hạn trong hệ thống: VD "Admin", "HR", "Staff"
        public string Role { get; set; } = "Staff";
    }
}