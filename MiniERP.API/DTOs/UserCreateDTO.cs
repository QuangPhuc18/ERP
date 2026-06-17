using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class UserCreateDTO
    {
        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên")]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = "staff"; // admin hoặc staff

        public string Position { get; set; } = "Nhân viên";
    }
}