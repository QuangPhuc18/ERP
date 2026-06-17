using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.Entities
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty; // Mật khẩu đã mã hóa Bcrypt/Identity

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "staff"; // "admin" hoặc "staff"

        [MaxLength(50)]
        public string Position { get; set; } = "Nhân viên"; // "Thu ngân", "Quản lý kho"...

        public bool IsActive { get; set; } = true; // Dùng để kích hoạt hoặc khóa tài khoản

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}